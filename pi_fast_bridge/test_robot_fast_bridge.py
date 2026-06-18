import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from robot_fast_bridge import RobotBridge, parse_arduino_line


class Args:
    arduino_ports = "/dev/null"
    baudrate = 115200
    camera = "0"
    width = 320
    height = 180
    fps = 1
    jpeg_quality = 32
    host = "127.0.0.1"
    port = 8765
    telemetry_fps = 20


class TelemetrySchemaTests(unittest.TestCase):
    def test_compact_status_expands_to_canonical_fields(self):
        parsed = parse_arduino_line(
            "ST,h=123.4,crh=120.1,lat=30.044400,lng=31.235700,fix=1,"
            "spd=0.12,crs=90.0,e1=123,e2=456,nav=running,wp=2,wpc=5,"
            "dist=3.4,bear=88.2,herr=-2.1,plot=CONT,spray=1"
        )

        self.assertEqual(parsed["type"], "status")
        self.assertEqual(parsed["heading"], 123.4)
        self.assertEqual(parsed["compassHeading"], 123.4)
        self.assertEqual(parsed["compassRawHeading"], 120.1)
        self.assertEqual(parsed["gps_fix"], True)
        self.assertEqual(parsed["fix"], True)
        self.assertEqual(parsed["gps_speed"], 0.12)
        self.assertEqual(parsed["gpsSpeed"], 0.12)
        self.assertEqual(parsed["gps_course"], 90.0)
        self.assertEqual(parsed["gpsCourse"], 90.0)
        self.assertEqual(parsed["wp_status"], "running")
        self.assertEqual(parsed["wp_index"], 2)
        self.assertEqual(parsed["wp_count"], 5)
        self.assertEqual(parsed["target_distance_m"], 3.4)
        self.assertEqual(parsed["target_bearing"], 88.2)
        self.assertEqual(parsed["heading_error"], -2.1)
        self.assertEqual(parsed["plot_mode"], "CONT")
        self.assertEqual(parsed["spraying"], True)

    def test_legacy_status_still_parses(self):
        parsed = parse_arduino_line("STATUS|heading=12.5|gps_fix=1|drive_moving=0")

        self.assertEqual(parsed["type"], "status")
        self.assertEqual(parsed["heading"], 12.5)
        self.assertEqual(parsed["compassHeading"], 12.5)
        self.assertEqual(parsed["gps_fix"], 1)
        self.assertEqual(parsed["fix"], True)
        self.assertEqual(parsed["moving"], False)


class RouteUploadTests(unittest.TestCase):
    def test_wp_route_expands_to_one_ordered_upload_sequence(self):
        bridge = RobotBridge(Args())

        commands = bridge.to_arduino_commands({
            "type": "wp_route",
            "points": [
                {"lat": 30.1, "lng": 31.1},
                {"lat": 30.2, "lng": 31.2},
            ],
            "maxSpeed": 102,
            "autoTurnSpeed": 42,
            "speedCap": 120,
        })

        self.assertEqual(commands, [
            "SPEED 102",
            "AUTO TURN SPEED 42",
            "SPEED CAP 120",
            "WP BEGIN 2",
            "WP ADD 0 30.100000 31.100000",
            "WP ADD 1 30.200000 31.200000",
            "WP START",
        ])
        self.assertEqual(commands.count("WP START"), 1)


if __name__ == "__main__":
    unittest.main()
