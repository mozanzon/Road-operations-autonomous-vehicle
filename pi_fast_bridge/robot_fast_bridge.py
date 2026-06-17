#!/usr/bin/env python3
"""
Low-latency RoboScan bridge for Raspberry Pi.

Arduino control/telemetry uses WebSocket port 8765. Camera frames are never sent
through that socket; MJPEG is served independently on HTTP port 5000.
"""

import argparse
import asyncio
import json
import logging
import queue
import threading
import time
from collections import deque
from datetime import datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
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
DEBUG_RAW_SERIAL = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("robot_fast_bridge")


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


def parse_bool(value):
    return bool(int(value))


def parse_int(value):
    return int(float(value))


def parse_float(value):
    return float(value)


def parse_arduino_line(line):
    line = line.strip()
    if not line:
        return None

    if line.startswith("STATUS|"):
        data = {"type": "status", "legacy": True}
        for part in line.split("|")[1:]:
            if "=" not in part:
                continue
            key, value = part.split("=", 1)
            data[key.strip()] = parse_value(value)
        return data

    parts = [part.strip() for part in line.split(",")]
    packet = parts[0]

    if packet == "M" and len(parts) >= 13:
        return {
            "type": "motion",
            "sequence": parse_int(parts[1]),
            "arduino_ms": parse_int(parts[2]),
            "left_ticks": parse_int(parts[3]),
            "right_ticks": parse_int(parts[4]),
            "heading": parse_float(parts[5]),
            "compass_ok": parse_bool(parts[6]),
            "motion_state": parse_int(parts[7]),
            "navigation_state": parse_int(parts[8]),
            "waypoint_index": parse_int(parts[9]),
            "waypoint_count": parse_int(parts[10]),
            "plotter_state": parse_int(parts[11]),
            "spraying": parse_bool(parts[12]),
        }

    if packet == "G" and len(parts) >= 8:
        return {
            "type": "gps",
            "sequence": parse_int(parts[1]),
            "arduino_ms": parse_int(parts[2]),
            "latitude": parse_float(parts[3]),
            "longitude": parse_float(parts[4]),
            "gps_fix": parse_bool(parts[5]),
            "satellites": parse_int(parts[6]),
            "gps_hdop": parse_float(parts[7]),
        }

    if packet == "C" and len(parts) >= 6:
        return {
            "type": "constants",
            "wheel_radius_m": parse_float(parts[1]),
            "ticks_per_revolution": parse_float(parts[2]),
            "track_width_m": parse_float(parts[3]),
            "dash_length_m": parse_float(parts[4]),
            "gap_length_m": parse_float(parts[5]),
        }

    if packet == "E" and len(parts) >= 2:
        parsed = {"type": "event", "event_type": parts[1]}
        if len(parts) > 2:
            parsed["message"] = ",".join(parts[2:])
        return parsed

    if packet == "ACK" and len(parts) >= 3:
        parsed = {"type": "ack", "command": parts[2]}
        try:
            parsed["command_id"] = parse_int(parts[1])
        except ValueError:
            parsed["message"] = ",".join(parts[1:])
        if len(parts) > 3:
            parsed["message"] = ",".join(parts[3:])
        return parsed

    if line.startswith("ACK:"):
        return {"type": "ack", "message": line[4:]}
    if line.startswith("WARN:"):
        return {"type": "warn", "message": line[5:]}
    if line.startswith("ERROR:"):
        return {"type": "error", "message": line[6:]}
    if line.startswith("READY:"):
        return {"type": "ready", "message": line[6:]}

    if packet in {"WARN", "ERROR", "READY"} and len(parts) >= 2:
        return {"type": packet.lower(), "message": ",".join(parts[1:])}

    return None


class CommandQueue:
    PRIORITY = {
        "emergency": 0,
        "stop": 1,
        "movement": 2,
        "navigation": 3,
        "marking": 4,
        "route": 5,
        "status": 6,
    }

    def __init__(self):
        self._lock = threading.Lock()
        self._items = []
        self._order = 0

    def enqueue(self, commands, category, command_id=None):
        if not commands:
            return
        with self._lock:
            if category == "movement":
                self._items = [item for item in self._items if item[3] != "movement"]
            priority = self.PRIORITY.get(category, 6)
            for command in commands:
                self._items.append((priority, self._order, command, category, command_id))
                self._order += 1

    def get(self):
        with self._lock:
            if not self._items:
                return None
            index = min(range(len(self._items)), key=lambda idx: (self._items[idx][0], self._items[idx][1]))
            _, _, command, category, command_id = self._items.pop(index)
            return command, command_id, category


class ArduinoLink:
    def __init__(self, ports, baudrate, event_loop):
        self.ports = ports
        self.baudrate = baudrate
        self.loop = event_loop
        self.serial = None
        self.running = True
        self.connected_port = None
        self.lock = threading.Lock()
        self.command_queue = CommandQueue()
        self.outgoing = asyncio.Queue()
        self.telemetry_count = 0
        self.last_parsed_at = None
        self.last_raw = ""
        self.last_write_at = 0.0

    def start(self):
        threading.Thread(target=self._reader_loop, daemon=True).start()
        threading.Thread(target=self._writer_loop, daemon=True).start()

    def enqueue(self, commands, category, command_id=None):
        self.command_queue.enqueue(commands, category, command_id)

    def snapshot(self):
        with self.lock:
            return {
                "arduino_port": self.connected_port,
                "telemetry_packets": self.telemetry_count,
                "last_parsed_at": self.last_parsed_at,
                "last_raw": self.last_raw if DEBUG_RAW_SERIAL else None,
            }

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

    def _disconnect_serial(self):
        try:
            if self.serial is not None:
                self.serial.close()
        except Exception:
            pass
        self.serial = None
        self.connected_port = None

    def _reader_loop(self):
        while self.running:
            if self.serial is None:
                self._connect()
                continue
            try:
                raw = self.serial.readline()
                if not raw:
                    continue
                line = raw.decode("utf-8", errors="ignore").strip()
                parsed = parse_arduino_line(line)
                with self.lock:
                    if DEBUG_RAW_SERIAL:
                        self.last_raw = line
                    if parsed:
                        self.telemetry_count += 1
                        self.last_parsed_at = datetime.now(EGYPT_TZ).isoformat()
                if parsed:
                    asyncio.run_coroutine_threadsafe(self.outgoing.put(parsed), self.loop)
            except Exception as exc:
                logger.warning("Arduino read failed, reconnecting: %s", exc)
                self._disconnect_serial()

    def _writer_loop(self):
        while self.running:
            item = self.command_queue.get()
            if item is None:
                time.sleep(0.005)
                continue
            command, command_id, category = item
            if self.serial is None:
                asyncio.run_coroutine_threadsafe(
                    self.outgoing.put({"type": "error", "message": "arduino_not_connected", "command_id": command_id}),
                    self.loop,
                )
                time.sleep(0.05)
                continue
            try:
                if category != "emergency":
                    elapsed = time.monotonic() - self.last_write_at
                    if elapsed < ARDUINO_COMMAND_INTERVAL_S:
                        time.sleep(ARDUINO_COMMAND_INTERVAL_S - elapsed)
                self.serial.write((command.strip() + "\n").encode("utf-8"))
                self.last_write_at = time.monotonic()
            except Exception as exc:
                logger.warning("Arduino write failed: %s", exc)
                self._disconnect_serial()


class CameraLink:
    def __init__(self, source, width, height, fps, quality):
        self.source = int(source) if str(source).isdigit() else source
        self.width = width
        self.height = height
        self.fps = fps
        self.quality = quality
        self.running = True
        self.lock = threading.Condition()
        self.latest_frame = None
        self.latest_jpeg = None
        self.frames_captured = 0
        self.frames_encoded = 0
        self.last_frame_at = None
        self.error = None

    def start(self):
        threading.Thread(target=self._capture_loop, daemon=True).start()
        threading.Thread(target=self._encode_loop, daemon=True).start()

    def snapshot(self):
        with self.lock:
            return {
                "camera_connected": self.error is None and self.latest_jpeg is not None,
                "camera_has_frame": self.latest_jpeg is not None,
                "camera_error": self.error,
                "camera_source": str(self.source),
                "camera_frames_captured": self.frames_captured,
                "camera_frames_encoded": self.frames_encoded,
                "camera_last_frame_at": self.last_frame_at,
                "stream_fps": self.fps,
                "jpeg_quality": self.quality,
            }

    def latest_encoded(self, timeout=1.0):
        end = time.monotonic() + timeout
        with self.lock:
            while self.latest_jpeg is None and self.running and time.monotonic() < end:
                self.lock.wait(timeout=0.1)
            return self.latest_jpeg

    def _capture_loop(self):
        if cv2 is None:
            with self.lock:
                self.error = "opencv-python is not installed"
                self.lock.notify_all()
            return
        delay = 1.0 / max(1, self.fps)
        while self.running:
            cap = cv2.VideoCapture(self.source)
            if not cap.isOpened():
                with self.lock:
                    self.error = f"camera {self.source} not available"
                    self.lock.notify_all()
                time.sleep(1)
                continue
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            while self.running and cap.isOpened():
                ok, frame = cap.read()
                if not ok:
                    with self.lock:
                        self.error = "camera frame read failed"
                        self.lock.notify_all()
                    break
                with self.lock:
                    self.latest_frame = frame
                    self.frames_captured += 1
                    self.last_frame_at = datetime.now(EGYPT_TZ).isoformat()
                    self.error = None
                    self.lock.notify_all()
                time.sleep(delay)
            cap.release()
            time.sleep(0.5)

    def _encode_loop(self):
        if cv2 is None:
            return
        seen = 0
        while self.running:
            with self.lock:
                while self.frames_captured == seen and self.running:
                    self.lock.wait(timeout=0.2)
                frame = self.latest_frame
                seen = self.frames_captured
            if frame is None:
                continue
            ok, encoded = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), int(self.quality)])
            if not ok:
                with self.lock:
                    self.error = "camera JPEG encoding failed"
                    self.lock.notify_all()
                continue
            with self.lock:
                self.latest_jpeg = encoded.tobytes()
                self.frames_encoded += 1
                self.lock.notify_all()


class MjpegHandler(BaseHTTPRequestHandler):
    camera = None

    def log_message(self, format, *args):
        logger.debug("mjpeg %s", format % args)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path not in {"/", "/video_feed"}:
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        if self.path == "/":
            self.send_response(HTTPStatus.OK)
            self._send_cors_headers()
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"RoboScan MJPEG endpoint: /video_feed\n")
            return
        self.send_response(HTTPStatus.OK)
        self._send_cors_headers()
        self.send_header("Age", "0")
        self.send_header("Cache-Control", "no-cache, private")
        self.send_header("Pragma", "no-cache")
        self.send_header("Content-Type", "multipart/x-mixed-replace; boundary=frame")
        self.end_headers()
        while True:
            frame = self.camera.latest_encoded(timeout=2.0)
            if frame is None:
                time.sleep(0.1)
                continue
            try:
                self.wfile.write(b"--frame\r\n")
                self.wfile.write(b"Content-Type: image/jpeg\r\n")
                self.wfile.write(f"Content-Length: {len(frame)}\r\n\r\n".encode("ascii"))
                self.wfile.write(frame)
                self.wfile.write(b"\r\n")
            except (BrokenPipeError, ConnectionResetError):
                return


class RobotBridge:
    def __init__(self, args):
        self.host = args.host
        self.port = args.port
        self.http_port = args.http_port
        self.loop = None
        self.arduino = ArduinoLink(parse_ports(args.arduino_ports), args.baudrate, self.loop)
        self.camera = CameraLink(args.camera, args.width, args.height, args.fps, args.jpeg_quality)
        self.clients = set()
        self.command_history = deque(maxlen=50)

    def start_background(self):
        self.arduino.start()
        self.camera.start()
        MjpegHandler.camera = self.camera
        server = ThreadingHTTPServer((self.host, self.http_port), MjpegHandler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        logger.info("MJPEG listening on http://%s:%s/video_feed", self.host, self.http_port)

    async def handle_client(self, websocket, path=None):
        self.clients.add(websocket)
        logger.info("client connected: %d", len(self.clients))
        await self._send(websocket, self.bridge_status_payload())
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
        commands, category = self.to_arduino_commands(data)
        command_id = data.get("command_id")
        if commands:
            self.arduino.enqueue(commands, category, command_id)
            for command in commands:
                self.command_history.append({"command": command, "queued": True, "time": time.time(), "command_id": command_id})
        await self.broadcast({"type": "bridge_ack", "command_id": command_id, "command": data.get("type"), "queued": bool(commands)})

    def to_arduino_commands(self, data):
        msg_type = data.get("type")
        if msg_type == "raw":
            command = str(data.get("command", "")).strip()
            return ([command], "status") if command else ([], "status")
        if msg_type in {"emergency", "emergency_stop"}:
            return ["S"], "emergency"
        if msg_type == "movement":
            action = str(data.get("action", "")).lower()
            movement = {"forward": "W", "backward": "X", "left": "A", "right": "D"}.get(action)
            if not movement:
                return [], "movement"
            if "speed" not in data:
                return [movement], "movement"
            speed = int(max(0, min(255, int(data.get("speed", 160)))))
            speed_command = f"TURN SPEED {speed}" if action in {"left", "right"} else f"SPEED {speed}"
            return [speed_command, movement], "movement"
        if msg_type == "stop":
            return ["S"], "stop"
        if msg_type == "status":
            return ["STATUS"], "status"
        if msg_type == "speed":
            return [f"SPEED {int(max(0, min(255, int(data.get('speed', 160)))))}"], "movement"
        if msg_type == "turn_speed":
            return [f"TURN SPEED {int(max(0, min(255, int(data.get('speed', 70)))))}"], "movement"
        if msg_type == "auto_turn_speed":
            return [f"AUTO TURN SPEED {int(max(0, min(255, int(data.get('speed', 70)))))}"], "navigation"
        if msg_type == "compass_offset":
            degrees = max(-180.0, min(180.0, float(data.get("degrees", 0))))
            return [f"COMPASS OFFSET {degrees:.2f}"], "status"
        if msg_type == "speed_cap":
            return [f"SPEED CAP {int(max(0, min(255, int(data.get('speed', 102)))))}"], "movement"
        if msg_type == "motor_trim":
            left = int(max(-50, min(50, int(data.get("left", 0)))))
            right = int(max(-50, min(50, int(data.get("right", 0)))))
            return [f"MOTOR TRIM {left} {right}"], "status"
        if msg_type == "encoder_pid":
            return [f"ENCODER PID {float(data.get('kp', 1)):.3f} {float(data.get('ki', 0)):.3f} {float(data.get('kd', 0)):.3f}"], "status"
        if msg_type == "goto" and "lat" in data and "lng" in data:
            return [f"GOTO {float(data.get('lat')):.6f} {float(data.get('lng')):.6f}"], "navigation"
        if msg_type == "wp_route":
            points = data.get("points")
            if not isinstance(points, list) or not points:
                return [], "route"
            speed = int(max(0, min(255, int(data.get("maxSpeed", data.get("speed", 160))))))
            auto_turn_speed = int(max(0, min(255, int(data.get("autoTurnSpeed", 70)))))
            speed_cap = int(max(0, min(255, int(data.get("speedCap", 102)))))
            commands = [f"SPEED {speed}", f"AUTO TURN SPEED {auto_turn_speed}", f"SPEED CAP {speed_cap}", f"WP BEGIN {len(points)}"]
            for order, point in enumerate(points):
                if not isinstance(point, dict) or "lat" not in point or "lng" not in point:
                    return [], "route"
                commands.append(f"WP ADD {order} {float(point.get('lat')):.6f} {float(point.get('lng')):.6f}")
            commands.append("WP START")
            return commands, "route"
        wp_commands = {
            "wp_clear": "WP CLEAR",
            "wp_start": "WP START",
            "wp_pause": "WP PAUSE",
            "wp_resume": "WP RESUME",
            "wp_stop": "WP STOP",
        }
        if msg_type in wp_commands:
            return [wp_commands[msg_type]], "stop" if msg_type == "wp_stop" else "navigation"
        if msg_type == "wp_add" and {"order", "lat", "lng"} <= data.keys():
            return [f"WP ADD {int(data.get('order'))} {float(data.get('lat')):.6f} {float(data.get('lng')):.6f}"], "route"
        if msg_type == "plot":
            mode = str(data.get("mode", "")).lower()
            if mode == "cont":
                return ["PLOT CONT"], "marking"
            if mode == "dash":
                return ["PLOT DASH"], "marking"
            if mode == "dash_dist":
                dash_m = max(0.01, float(data.get("dash_m", 0.5)))
                gap_m = max(0.01, float(data.get("gap_m", 0.3)))
                return [f"PLOT DASH DIST {dash_m:.3f} {gap_m:.3f}"], "marking"
            if mode == "off":
                return ["PLOT OFF"], "marking"
            if mode == "dist":
                return [f"PLOT DIST {float(data.get('meters', 0)):.3f}"], "marking"
            if mode == "ticks":
                return [f"PLOT TICKS {int(max(0, int(data.get('ticks', 0))))}"], "marking"
        return [], "status"

    def bridge_status_payload(self):
        last_command = self.command_history[-1] if self.command_history else None
        now = datetime.now(EGYPT_TZ)
        stats = {
            "connected_clients": len(self.clients),
            **self.arduino.snapshot(),
            **self.camera.snapshot(),
            "last_command": last_command["command"] if last_command else None,
            "last_command_sent": last_command["queued"] if last_command else None,
        }
        return {"type": "bridge_status", "timestamp": now.isoformat(), "timestamp_ms": int(time.time() * 1000), "stats": stats}

    async def _send(self, websocket, payload):
        await websocket.send(json.dumps(payload, separators=(",", ":")))

    async def broadcast(self, payload):
        if not self.clients:
            return
        message = json.dumps(payload, separators=(",", ":"))
        clients = list(self.clients)
        results = await asyncio.gather(*[asyncio.wait_for(client.send(message), timeout=1.0) for client in clients], return_exceptions=True)
        for client, result in zip(clients, results):
            if isinstance(result, Exception):
                self.clients.discard(client)

    async def arduino_broadcast_loop(self):
        while True:
            parsed = await self.arduino.outgoing.get()
            now = datetime.now(EGYPT_TZ)
            payload = {"type": parsed.get("type", "arduino"), "timestamp": now.isoformat(), "timestamp_ms": int(time.time() * 1000), parsed.get("type", "arduino"): parsed}
            await self.broadcast(payload)

    async def stats_loop(self):
        while True:
            await self.broadcast(self.bridge_status_payload())
            await asyncio.sleep(1.0)

    async def run(self):
        self.loop = asyncio.get_running_loop()
        self.arduino.loop = self.loop
        self.start_background()
        logger.info("WebSocket listening on ws://%s:%s", self.host, self.port)
        async with websockets.serve(self.handle_client, self.host, self.port, ping_interval=20, ping_timeout=20):
            await asyncio.gather(self.arduino_broadcast_loop(), self.stats_loop())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--http-port", type=int, default=5000)
    parser.add_argument("--arduino-ports", default=",".join(DEFAULT_PORTS))
    parser.add_argument("--baudrate", type=int, default=115200)
    parser.add_argument("--camera", default="0")
    parser.add_argument("--width", type=int, default=640)
    parser.add_argument("--height", type=int, default=480)
    parser.add_argument("--fps", type=int, default=15)
    parser.add_argument("--jpeg-quality", type=int, default=65)
    args = parser.parse_args()
    bridge = RobotBridge(args)
    asyncio.run(bridge.run())


if __name__ == "__main__":
    main()
