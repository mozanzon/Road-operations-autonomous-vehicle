import unittest
from http.server import ThreadingHTTPServer
from threading import Thread
from urllib.request import urlopen

from robot_fast_bridge import CommandQueue, MjpegHandler, parse_arduino_line


class ParseArduinoLineTest(unittest.TestCase):
    def test_parses_motion_packet(self):
        self.assertEqual(parse_arduino_line("M,1524,184250,77,98,22.0,1,0,3,2,5,1,1"), {
            "type": "motion",
            "sequence": 1524,
            "arduino_ms": 184250,
            "left_ticks": 77,
            "right_ticks": 98,
            "heading": 22.0,
            "compass_ok": True,
            "motion_state": 0,
            "navigation_state": 3,
            "waypoint_index": 2,
            "waypoint_count": 5,
            "plotter_state": 1,
            "spraying": True,
        })

    def test_parses_gps_constants_event_and_legacy_without_aliases(self):
        self.assertEqual(parse_arduino_line("G,1525,184500,29.983943,30.949378,1,12,0.67")["type"], "gps")
        self.assertEqual(parse_arduino_line("C,0.16,2400,0.50,0.20,0.60")["type"], "constants")
        self.assertEqual(parse_arduino_line("E,NAVIGATION_ERROR,GPS_TIMEOUT"), {
            "type": "event",
            "event_type": "NAVIGATION_ERROR",
            "message": "GPS_TIMEOUT",
        })
        legacy = parse_arduino_line("STATUS|gps_fix=1|gps_hdop=0.8|drive_moving=1|heading=13.5")
        self.assertTrue(legacy["legacy"])
        self.assertNotIn("fix", legacy)
        self.assertNotIn("hdop", legacy)
        self.assertNotIn("moving", legacy)

    def test_parses_ack_warn_error_ready(self):
        self.assertEqual(parse_arduino_line("ACK,124,movement,forward"), {
            "type": "ack",
            "command_id": 124,
            "command": "movement",
            "message": "forward",
        })
        self.assertEqual(parse_arduino_line("WARN,GPS_FIX_LOST")["message"], "GPS_FIX_LOST")
        self.assertEqual(parse_arduino_line("ERROR,GPS_TIMEOUT")["message"], "GPS_TIMEOUT")
        self.assertEqual(parse_arduino_line("READY,Combined_RoboScan_controller")["message"], "Combined_RoboScan_controller")


class CommandQueueTest(unittest.TestCase):
    def test_emergency_stop_preempts_movement_and_movement_is_coalesced(self):
        queue = CommandQueue()
        queue.enqueue(["SPEED 80", "W"], "movement", 10)
        queue.enqueue(["SPEED 90", "X"], "movement", 11)
        queue.enqueue(["S"], "emergency", 12)

        self.assertEqual(queue.get(), ("S", 12, "emergency"))
        self.assertEqual(queue.get(), ("SPEED 90", 11, "movement"))
        self.assertEqual(queue.get(), ("X", 11, "movement"))
        self.assertIsNone(queue.get())

    def test_stop_is_not_discarded_by_movement_coalescing(self):
        queue = CommandQueue()
        queue.enqueue(["W"], "movement", 1)
        queue.enqueue(["S"], "stop", 2)
        queue.enqueue(["X"], "movement", 3)

        self.assertEqual(queue.get(), ("S", 2, "stop"))
        self.assertEqual(queue.get(), ("X", 3, "movement"))


class MjpegHandlerTest(unittest.TestCase):
    def test_mjpeg_endpoints_allow_browser_canvas_reads(self):
        class FakeCamera:
            def latest_encoded(self, timeout=2.0):
                return b"\xff\xd8\xff\xd9"

        previous_camera = MjpegHandler.camera
        MjpegHandler.camera = FakeCamera()
        server = ThreadingHTTPServer(("127.0.0.1", 0), MjpegHandler)
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            base_url = f"http://127.0.0.1:{server.server_address[1]}"
            with urlopen(base_url, timeout=2) as response:
                self.assertEqual(response.headers.get("Access-Control-Allow-Origin"), "*")

            response = urlopen(f"{base_url}/video_feed", timeout=2)
            try:
                self.assertEqual(response.headers.get("Access-Control-Allow-Origin"), "*")
            finally:
                response.close()
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)
            MjpegHandler.camera = previous_camera


if __name__ == "__main__":
    unittest.main()
