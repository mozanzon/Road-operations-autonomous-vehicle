#!/usr/bin/env python3
"""
Fast RoboScan bridge for Raspberry Pi.

Streams Arduino STATUS packets and a low-latency JPEG camera feed to the React UI.
YOLO is intentionally not run here; run it on the laptop with yolo_inference_server.py.
"""

import argparse
import asyncio
import base64
import json
import logging
import threading
import time
from collections import deque
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

try:
    import cv2
except ImportError:
    cv2 = None

try:
    import serial
except ImportError:
    serial = None

import websockets


DEFAULT_PORTS = ["/dev/ttyACM0", "/dev/ttyUSB0", "/dev/ttyAMA0", "/dev/ttyAMA10"]
EGYPT_TZ = ZoneInfo("Africa/Cairo")
ARDUINO_COMMAND_INTERVAL_S = 0.025
SCHEMA_PATH = Path(__file__).resolve().parents[1] / "telemetry_schema.json"
DEFAULT_TELEMETRY_SCHEMA = [
    {"key": "h", "name": "heading", "type": "number"},
    {"key": "lat", "name": "lat", "type": "number"},
    {"key": "lng", "name": "lng", "type": "number"},
    {"key": "fix", "name": "gps_fix", "type": "boolean"},
    {"key": "spd", "name": "gps_speed", "type": "number"},
    {"key": "crs", "name": "gps_course", "type": "number"},
    {"key": "sat", "name": "gps_sat", "type": "number"},
    {"key": "hdop", "name": "gps_hdop", "type": "number"},
    {"key": "age", "name": "gps_age_ms", "type": "number"},
    {"key": "e1", "name": "e1", "type": "number"},
    {"key": "e2", "name": "e2", "type": "number"},
    {"key": "lm", "name": "left_m", "type": "number"},
    {"key": "rm", "name": "right_m", "type": "number"},
    {"key": "v", "name": "speed", "type": "number"},
    {"key": "bat", "name": "battery", "type": "number"},
    {"key": "mov", "name": "drive_moving", "type": "boolean"},
    {"key": "ds", "name": "drive_speed", "type": "number"},
    {"key": "ads", "name": "active_drive_speed", "type": "number"},
    {"key": "lp", "name": "left_pwm", "type": "number"},
    {"key": "rp", "name": "right_pwm", "type": "number"},
    {"key": "nav", "name": "wp_status", "type": "string"},
    {"key": "na", "name": "nav_active", "type": "boolean"},
    {"key": "wpa", "name": "wp_active", "type": "boolean"},
    {"key": "wpp", "name": "wp_paused", "type": "boolean"},
    {"key": "wpc", "name": "wp_count", "type": "number"},
    {"key": "wp", "name": "wp_index", "type": "number"},
    {"key": "tlat", "name": "target_lat", "type": "number"},
    {"key": "tlng", "name": "target_lng", "type": "number"},
    {"key": "bear", "name": "target_bearing", "type": "number"},
    {"key": "dist", "name": "target_distance_m", "type": "number"},
    {"key": "herr", "name": "heading_error", "type": "number"},
    {"key": "hadj", "name": "heading_adjusting", "type": "boolean"},
    {"key": "turn", "name": "turn_active", "type": "boolean"},
    {"key": "tet", "name": "turn_expected_ticks", "type": "number"},
    {"key": "et", "name": "encoder_error", "type": "number"},
    {"key": "ekp", "name": "encoder_pid_kp", "type": "number"},
    {"key": "eki", "name": "encoder_pid_ki", "type": "number"},
    {"key": "ekd", "name": "encoder_pid_kd", "type": "number"},
    {"key": "epo", "name": "encoder_pid_output", "type": "number"},
    {"key": "plot", "name": "plot_mode", "type": "string"},
    {"key": "spray", "name": "spraying", "type": "boolean"},
    {"key": "dash", "name": "dash_m", "type": "number"},
    {"key": "gap", "name": "gap_m", "type": "number"},
    {"key": "pt", "name": "plot_target_m", "type": "number"},
    {"key": "pd", "name": "plot_done", "type": "boolean"},
]


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger("robot_fast_bridge")
TURN_IN_PLACE_PWM = 26


def load_telemetry_schema():
    try:
        return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        logger.warning("Failed to load telemetry schema %s, using built-in schema: %s", SCHEMA_PATH, exc)
        return DEFAULT_TELEMETRY_SCHEMA


TELEMETRY_SCHEMA = load_telemetry_schema()
TELEMETRY_BY_KEY = {field["key"]: field for field in TELEMETRY_SCHEMA}


def parse_ports(value):
    return [part.strip() for part in str(value).split(",") if part.strip()]


def parse_value(value):
    value = value.strip()
    if value.lower() in ("true", "false"):
        return value.lower() == "true"
    try:
        parsed = float(value)
        return int(parsed) if parsed.is_integer() else parsed
    except ValueError:
        return value


def parse_schema_value(value, value_type):
    if value_type == "boolean":
        if isinstance(value, bool):
            return value
        text = str(value).strip().lower()
        return text in ("1", "true", "yes", "on")
    if value_type == "number":
        return parse_value(str(value))
    return str(value).strip()


def parse_compact_status(line):
    data = {"type": "status"}
    for part in line[3:].split(","):
        if "=" not in part:
            continue
        key, value = part.split("=", 1)
        field = TELEMETRY_BY_KEY.get(key.strip())
        if field is None:
            continue
        data[field["name"]] = parse_schema_value(value, field.get("type", "string"))
    return data


def parse_arduino_line(line):
    if line.startswith("ST,"):
        return parse_compact_status(line)

    if not line.startswith("STATUS|"):
        if line.startswith("ACK:"):
            return {"type": "ack", "message": line[4:]}
        if line.startswith("ERROR:"):
            return {"type": "error", "message": line[6:]}
        return None

    data = {"type": "status"}
    for part in line.split("|")[1:]:
        if "=" not in part:
            continue
        key, value = part.split("=", 1)
        data[key] = parse_value(value)

    return data


class ArduinoLink:
    def __init__(self, ports, baudrate):
        self.ports = ports
        self.baudrate = baudrate
        self.serial = None
        self.running = True
        self.latest_sensor = None
        self.latest_raw = ""
        self.latest_ack = None
        self.latest_error = None
        self.telemetry_count = 0
        self.last_parsed_at = None
        self.connected_port = None
        self.lock = threading.Lock()
        self.write_lock = threading.Lock()
        self.last_write_at = 0.0

    def start(self):
        threading.Thread(target=self._loop, daemon=True).start()

    def _connect(self):
        if serial is None:
            logger.error("pyserial is not installed")
            time.sleep(2)
            return

        for port in self.ports:
            try:
                logger.info("Trying Arduino port %s", port)
                self.serial = serial.Serial(port, self.baudrate, timeout=0.02, write_timeout=0.05)
                self.connected_port = port
                time.sleep(1.5)
                logger.info("Connected Arduino on %s", port)
                return
            except Exception as exc:
                logger.warning("Arduino port %s failed: %s", port, exc)
                self.serial = None

        time.sleep(2)

    def _loop(self):
        while self.running:
            if self.serial is None:
                self._connect()
                continue

            try:
                raw = self.serial.readline()
                if not raw:
                    continue
                line = raw.decode("utf-8", errors="ignore").strip()
                if not line:
                    continue
                parsed = parse_arduino_line(line)
                with self.lock:
                    self.latest_raw = line
                    if not parsed:
                        continue
                    if parsed.get("type") == "status":
                        self.latest_sensor = parsed
                        self.telemetry_count += 1
                        self.last_parsed_at = datetime.now(EGYPT_TZ).isoformat()
                    elif parsed.get("type") == "ack":
                        self.latest_ack = parsed
                        self.latest_error = None
                    elif parsed.get("type") == "error":
                        self.latest_error = parsed
            except Exception as exc:
                logger.warning("Arduino read failed, reconnecting: %s", exc)
                try:
                    self.serial.close()
                except Exception:
                    pass
                self.serial = None
                self.connected_port = None

    def send(self, command):
        if self.serial is None:
            return False
        try:
            with self.write_lock:
                elapsed = time.monotonic() - self.last_write_at
                if elapsed < ARDUINO_COMMAND_INTERVAL_S:
                    time.sleep(ARDUINO_COMMAND_INTERVAL_S - elapsed)
                self.serial.write((command.strip() + "\n").encode("utf-8"))
                self.serial.flush()
                self.last_write_at = time.monotonic()
                with self.lock:
                    self.latest_error = None
            return True
        except Exception as exc:
            logger.warning("Arduino write failed: %s", exc)
            return False

    def snapshot(self):
        with self.lock:
            return {
                "sensor": self.latest_sensor,
                "raw": self.latest_raw,
                "ack": self.latest_ack,
                "error": self.latest_error,
                "port": self.connected_port,
                "telemetry_count": self.telemetry_count,
                "last_parsed_at": self.last_parsed_at,
            }


class CameraLink:
    def __init__(self, source, width, height, fps, quality):
        self.source = int(source) if str(source).isdigit() else source
        self.width = width
        self.height = height
        self.fps = fps
        self.quality = quality
        self.frame_b64 = None
        self.error = None
        self.frames = 0
        self.running = True
        self.lock = threading.Lock()

    def start(self):
        if cv2 is None:
            self.error = "opencv-python is not installed"
            logger.error(self.error)
            return
        threading.Thread(target=self._loop, daemon=True).start()

    def _loop(self):
        delay = 1.0 / max(1, self.fps)
        while self.running:
            cap = cv2.VideoCapture(self.source, cv2.CAP_V4L2)
            if not cap.isOpened():
                self.error = f"camera {self.source} not available"
                logger.warning(self.error)
                time.sleep(2)
                continue

            cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            cap.set(cv2.CAP_PROP_FPS, self.fps)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            self.error = None

            while self.running:
                start = time.time()
                ok, frame = cap.read()
                if not ok or frame is None:
                    self.error = "camera frame read failed"
                    break

                if frame.shape[1] != self.width or frame.shape[0] != self.height:
                    frame = cv2.resize(frame, (self.width, self.height), interpolation=cv2.INTER_AREA)

                ok, encoded = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, self.quality])
                if ok:
                    with self.lock:
                        self.frame_b64 = base64.b64encode(encoded).decode("ascii")
                        self.frames += 1

                elapsed = time.time() - start
                if elapsed < delay:
                    time.sleep(delay - elapsed)

            cap.release()
            time.sleep(0.5)

    def snapshot(self):
        with self.lock:
            return self.frame_b64, self.frames, self.error


class RobotBridge:
    def __init__(self, args):
        self.arduino = ArduinoLink(parse_ports(args.arduino_ports), args.baudrate)
        self.camera = CameraLink(args.camera, args.width, args.height, args.fps, args.jpeg_quality)
        self.host = args.host
        self.port = args.port
        self.telemetry_fps = args.telemetry_fps
        self.clients = set()
        self.command_history = deque(maxlen=20)
        self.last_frame_count_sent = -1

    def start_background(self):
        self.arduino.start()
        self.camera.start()

    async def handle_client(self, websocket, path=None):
        self.clients.add(websocket)
        logger.info("client connected: %d", len(self.clients))
        try:
            async for message in websocket:
                await self.handle_message(message)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.clients.discard(websocket)
            logger.info("client disconnected: %d", len(self.clients))

    async def handle_message(self, message):
        try:
            data = json.loads(message)
        except json.JSONDecodeError:
            return

        commands = self.to_arduino_commands(data)
        if not commands:
            return

        for command in commands:
            sent = self.arduino.send(command)
            self.command_history.append({"command": command, "sent": sent, "time": time.time()})
            logger.info("command %s sent=%s", command, sent)

    def to_arduino_commands(self, data):
        msg_type = data.get("type")

        if msg_type == "raw":
            command = str(data.get("command", "")).strip()
            return [command] if command else []

        if msg_type == "movement":
            action = str(data.get("action", "")).lower()
            movement = {
                "forward": "W",
                "backward": "X",
                "left": "A",
                "right": "D",
            }.get(action)
            if not movement:
                return []
            if "speed" not in data:
                return [movement]
            speed = TURN_IN_PLACE_PWM if action in {"left", "right"} else int(max(0, min(255, int(data.get("speed", 160)))))
            speed_command = f"TURN SPEED {speed}" if action in {"left", "right"} else f"SPEED {speed}"
            return [speed_command, movement]

        if msg_type == "stop":
            return ["S"]

        if msg_type == "status":
            return ["STATUS"]

        if msg_type == "speed":
            return [f"SPEED {int(max(0, min(255, int(data.get('speed', 160)))))}"]

        if msg_type == "turn_speed":
            return [f"TURN SPEED {TURN_IN_PLACE_PWM}"]

        if msg_type == "auto_turn_speed":
            return [f"AUTO TURN SPEED {TURN_IN_PLACE_PWM}"]

        if msg_type == "compass_offset":
            degrees = max(-180.0, min(180.0, float(data.get("degrees", 0))))
            return [f"COMPASS OFFSET {degrees:.2f}"]

        if msg_type == "speed_cap":
            return [f"SPEED CAP {int(max(0, min(255, int(data.get('speed', 102)))))}"]

        if msg_type == "motor_trim":
            left = int(max(-50, min(50, int(data.get("left", 0)))))
            right = int(max(-50, min(50, int(data.get("right", 0)))))
            return [f"MOTOR TRIM {left} {right}"]

        if msg_type == "encoder_pid":
            kp = float(data.get("kp", 1))
            ki = float(data.get("ki", 0))
            kd = float(data.get("kd", 0))
            return [f"ENCODER PID {kp:.3f} {ki:.3f} {kd:.3f}"]

        if msg_type == "goto":
            if "lat" not in data or "lng" not in data:
                return []
            lat = float(data.get("lat"))
            lng = float(data.get("lng"))
            return [f"GOTO {lat:.6f} {lng:.6f}"]

        if msg_type == "wp_route":
            points = data.get("points")
            if not isinstance(points, list) or len(points) == 0:
                return []

            speed = int(max(0, min(255, int(data.get("maxSpeed", data.get("speed", 160))))))
            auto_turn_speed = int(max(0, min(255, int(data.get("autoTurnSpeed", TURN_IN_PLACE_PWM)))))
            speed_cap = int(max(0, min(255, int(data.get("speedCap", 102)))))
            commands = [
                f"SPEED {speed}",
                f"AUTO TURN SPEED {auto_turn_speed}",
                f"SPEED CAP {speed_cap}",
                f"WP BEGIN {len(points)}",
            ]
            for order, point in enumerate(points):
                if not isinstance(point, dict) or "lat" not in point or "lng" not in point:
                    return []
                lat = float(point.get("lat"))
                lng = float(point.get("lng"))
                commands.append(f"WP ADD {order} {lat:.6f} {lng:.6f}")
            commands.append("WP START")
            return commands

        if msg_type == "wp_clear":
            return ["WP CLEAR"]

        if msg_type == "wp_add":
            if "order" not in data or "lat" not in data or "lng" not in data:
                return []
            order = int(data.get("order"))
            lat = float(data.get("lat"))
            lng = float(data.get("lng"))
            return [f"WP ADD {order} {lat:.6f} {lng:.6f}"]

        if msg_type == "wp_start":
            return ["WP START"]

        if msg_type == "wp_pause":
            return ["WP PAUSE"]

        if msg_type == "wp_resume":
            return ["WP RESUME"]

        if msg_type == "wp_stop":
            return ["WP STOP"]

        if msg_type == "plot":
            mode = str(data.get("mode", "")).lower()
            if mode == "cont":
                return ["PLOT CONT"]
            if mode == "dash":
                return ["PLOT DASH"]
            if mode == "dash_dist":
                dash_m = max(0.01, float(data.get("dash_m", 0.5)))
                gap_m = max(0.01, float(data.get("gap_m", 0.3)))
                return [f"PLOT DASH DIST {dash_m:.3f} {gap_m:.3f}"]
            if mode == "off":
                return ["PLOT OFF"]
            if mode == "speed":
                return [f"PLOT SPEED {int(max(0, min(255, int(data.get('speed', 180)))))}"]
            if mode == "dist":
                return [f"PLOT DIST {float(data.get('meters', 0)):.3f}"]
            if mode == "ticks":
                return [f"PLOT TICKS {int(max(0, int(data.get('ticks', 0))))}"]

        return []

    async def broadcast_loop(self):
        while True:
            arduino_snapshot = self.arduino.snapshot()
            frame, frame_count, camera_error = self.camera.snapshot()
            last_command = self.command_history[-1] if self.command_history else None
            now = datetime.now(EGYPT_TZ)
            payload = {
                "timestamp": now.isoformat(),
                "timestamp_egypt": now.isoformat(),
                "timestamp_ms": int(time.time() * 1000),
                "arduino": arduino_snapshot["sensor"],
                "raw": arduino_snapshot["raw"],
                "stats": {
                    "connected_clients": len(self.clients),
                    "arduino_port": arduino_snapshot["port"],
                    "camera_connected": frame is not None and camera_error is None,
                    "camera_has_frame": frame is not None,
                    "camera_error": camera_error,
                    "camera_frames_encoded": frame_count,
                    "stream_fps": self.camera.fps,
                    "telemetry_fps": self.telemetry_fps,
                    "jpeg_quality": self.camera.quality,
                    "last_raw": arduino_snapshot["raw"],
                    "last_parsed_at": arduino_snapshot["last_parsed_at"],
                    "last_command": last_command["command"] if last_command else None,
                    "last_command_sent": last_command["sent"] if last_command else None,
                    "telemetry_packets": arduino_snapshot["telemetry_count"],
                },
            }
            if arduino_snapshot["ack"] is not None:
                payload["ack"] = arduino_snapshot["ack"]
            if arduino_snapshot["error"] is not None:
                payload["error"] = arduino_snapshot["error"]
            if frame is not None and frame_count != self.last_frame_count_sent:
                payload["frame"] = frame
                self.last_frame_count_sent = frame_count

            if self.clients:
                message = json.dumps(payload, separators=(",", ":"))
                results = await asyncio.gather(
                    *[asyncio.wait_for(client.send(message), timeout=1.0) for client in list(self.clients)],
                    return_exceptions=True,
                )
                for client, result in zip(list(self.clients), results):
                    if isinstance(result, Exception):
                        self.clients.discard(client)

            await asyncio.sleep(1.0 / max(1, self.telemetry_fps))

    async def run(self):
        self.start_background()
        logger.info("WebSocket listening on ws://%s:%s", self.host, self.port)
        async with websockets.serve(
            self.handle_client,
            self.host,
            self.port,
            ping_interval=30,
            ping_timeout=60,
            max_size=4_000_000,
        ):
            await self.broadcast_loop()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--arduino-ports", default=",".join(DEFAULT_PORTS))
    parser.add_argument("--baudrate", type=int, default=115200)
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--camera", default="0")
    parser.add_argument("--width", type=int, default=320)
    parser.add_argument("--height", type=int, default=180)
    parser.add_argument("--fps", type=int, default=6)
    parser.add_argument("--telemetry-fps", type=int, default=20)
    parser.add_argument("--jpeg-quality", type=int, default=32)
    args = parser.parse_args()

    asyncio.run(RobotBridge(args).run())


if __name__ == "__main__":
    main()
