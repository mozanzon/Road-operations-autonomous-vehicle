import unittest
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "pi_fast_bridge"))

import robot_fast_bridge


class FakeSerial:
    def __init__(self):
        self.writes = []

    def write(self, data):
        self.writes.append(data)

    def flush(self):
        pass


class FakeClock:
    def __init__(self):
        self.now = 100.0
        self.sleeps = []

    def monotonic(self):
        return self.now

    def sleep(self, seconds):
        self.sleeps.append(seconds)
        self.now += seconds


class ArduinoLinkTests(unittest.TestCase):
    def test_paces_consecutive_serial_commands(self):
        link = robot_fast_bridge.ArduinoLink([], 115200)
        link.serial = FakeSerial()
        clock = FakeClock()
        original_time = robot_fast_bridge.time
        robot_fast_bridge.time = clock
        try:
            self.assertTrue(link.send("WP CLEAR"))
            self.assertTrue(link.send("WP ADD 0 30.044400 31.235700"))
        finally:
            robot_fast_bridge.time = original_time

        self.assertEqual(
            link.serial.writes,
            [b"WP CLEAR\n", b"WP ADD 0 30.044400 31.235700\n"],
        )
        self.assertEqual(len(clock.sleeps), 1)
        self.assertGreater(clock.sleeps[0], 0)

    def test_new_command_clears_previous_error(self):
        link = robot_fast_bridge.ArduinoLink([], 115200)
        link.serial = FakeSerial()
        link.latest_error = {"type": "error", "message": "Use_WP_ADD_order_lat_lng"}

        self.assertTrue(link.send("WP CLEAR"))

        self.assertIsNone(link.snapshot()["error"])


class RobotBridgeCommandTests(unittest.TestCase):
    def make_bridge(self):
        bridge = object.__new__(robot_fast_bridge.RobotBridge)
        return bridge

    def test_wp_route_batches_speed_route_and_start(self):
        bridge = self.make_bridge()

        commands = bridge.to_arduino_commands({
            "type": "wp_route",
            "maxSpeed": 300,
            "autoTurnSpeed": 65,
            "speedCap": -5,
            "points": [
                {"lat": 30.0444, "lng": 31.2357},
                {"lat": 30.0451, "lng": 31.2362},
            ],
        })

        self.assertEqual(commands, [
            "SPEED 255",
            "AUTO TURN SPEED 65",
            "SPEED CAP 0",
            "WP BEGIN 2",
            "WP ADD 0 30.044400 31.235700",
            "WP ADD 1 30.045100 31.236200",
            "WP START",
        ])

    def test_wp_route_rejects_empty_or_malformed_points(self):
        bridge = self.make_bridge()

        self.assertEqual(bridge.to_arduino_commands({"type": "wp_route", "points": []}), [])
        self.assertEqual(bridge.to_arduino_commands({"type": "wp_route", "points": [{"lat": 30.0}]}), [])

    def test_wp_pause_resume_stop_commands(self):
        bridge = self.make_bridge()

        self.assertEqual(bridge.to_arduino_commands({"type": "wp_pause"}), ["WP PAUSE"])
        self.assertEqual(bridge.to_arduino_commands({"type": "wp_resume"}), ["WP RESUME"])
        self.assertEqual(bridge.to_arduino_commands({"type": "wp_stop"}), ["WP STOP"])


if __name__ == "__main__":
    unittest.main()
