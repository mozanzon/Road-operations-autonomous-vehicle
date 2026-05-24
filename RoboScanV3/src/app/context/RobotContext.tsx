import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type ConnectionStatus = 'connected' | 'disconnected' | 'attempting';
export type RobotMode = 'manual' | 'semi' | 'fully' | 'automatic';
export type PathExecStatus = 'idle' | 'running' | 'paused';
export type MotionPaintMode = 'move-only' | 'paint';
export type ScriptDirection = 'forward' | 'backward' | 'left' | 'right';
export type ScriptMovementType = 'straight' | 'turn' | 'arc';

export interface IMUData {
  roll: number; pitch: number; yaw: number;
  accelX: number; accelY: number; accelZ: number;
  gyroX: number; gyroY: number; gyroZ: number;
  timestamp: number;
}

export interface GPSData {
  lat: number; lng: number; speed: number;
  heading: number; fix: boolean; accuracy: number;
  timestamp: number;
}

export interface EncoderData {
  leftTicks: number; rightTicks: number;
  leftRPM: number; rightRPM: number;
  linearVelocity: number; odometryError: number;
  errorHistory: number[]; timestamp: number;
}

export interface Detection {
  id: string; type: 'pothole' | 'crack';
  lat: number; lng: number; confidence: number; timestamp: number;
  source?: 'model' | 'manual' | 'test';
}

export interface Waypoint {
  id: string; lat: number; lng: number; order: number;
}

export interface PIDSet { kp: number; ki: number; kd: number; }

export interface PaintingState {
  active: boolean; mode: 'solid' | 'dashed';
  dashLength: number; gapLength: number;
  color: string;
  targetDistance: number; distancePainted: number;
  status: 'active' | 'idle' | 'error';
}

export interface BridgeStats {
  connected_clients?: number;
  arduino_port?: string | null;
  camera_connected?: boolean;
  camera_backend?: string | null;
  camera_has_frame?: boolean;
  camera_error?: string | null;
  camera_source?: string;
  camera_frames_captured?: number;
  camera_frames_encoded?: number;
  camera_last_frame_at?: string | null;
  loop_fps?: number;
  stream_fps?: number;
  jpeg_quality?: number;
  active_mode?: RobotMode;
  path_status?: PathExecStatus;
  current_target_idx?: number;
  scripted_step_idx?: number;
  last_command?: string;
  last_command_sent?: boolean | null;
  last_raw?: string;
  last_parsed_at?: string | null;
  telemetry_fps?: number;
  telemetry_packets?: number;
  latest_ack?: string;
  latest_error?: string;
  autonomous_note?: string;
}

export interface ScriptedMove {
  direction: ScriptDirection;
  distance: number;
  movementType: ScriptMovementType;
  speed: number;
}

export interface ScriptedMoveStep extends ScriptedMove {
  id: string;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface ReportEvent {
  id: string;
  timestamp: number;
  kind: 'detection' | 'manual-reading' | 'command' | 'test';
  label: string;
  source: 'robot' | 'manual' | 'test';
  gps: GPSData;
  imu: IMUData;
  encoders: EncoderData;
  confidence?: number;
  details?: string;
}

export interface RobotContextType {
  connectionStatus: ConnectionStatus;
  connectionIp: string;
  setConnectionIp: (ip: string) => void;
  connect: () => void;
  disconnect: () => void;
  hostname: string; uptime: number; battery: number; latency: number;
  bridgeStats: BridgeStats | null;
  cameraFrame: string;
  cameraLive: boolean;
  testingMode: boolean;
  setTestingMode: (enabled: boolean) => void;
  modelStatus: 'idle' | 'loading' | 'ready' | 'running' | 'error';
  selectedModelPath: string;
  setSelectedModelPath: (value: string) => void;
  setModelStatus: (status: 'idle' | 'loading' | 'ready' | 'running' | 'error') => void;
  tomTomApiKey: string;
  setTomTomApiKey: (value: string) => void;
  imu: IMUData; gps: GPSData; encoders: EncoderData;
  imuLive: boolean; gpsLive: boolean; encodersLive: boolean;
  mode: RobotMode; setMode: (m: RobotMode) => void;
  motionPaintMode: MotionPaintMode; setMotionPaintMode: (m: MotionPaintMode) => void;
  gpsFix: boolean; totalDistance: number; segmentDistance: number;
  potholeCount: number; crackCount: number;
  detections: Detection[];
  addDetection: (type: 'pothole' | 'crack', confidence: number, source?: Detection['source']) => void;
  waypoints: Waypoint[];
  addWaypoint: (lat: number, lng: number) => void;
  updateWaypoint: (id: string, lat: number, lng: number) => void;
  deleteWaypoint: (id: string) => void;
  importWaypoints: (wps: Waypoint[]) => void;
  pathExecStatus: PathExecStatus;
  startPath: (route?: { points: RoutePoint[]; source: 'tomtom' | 'direct'; maxSpeed: number }) => void; pausePath: () => void; stopPath: () => void; resetPath: () => void;
  currentTargetIdx: number;
  scriptedStepIdx: number;
  scriptedMove: ScriptedMove;
  setScriptedMove: (move: Partial<ScriptedMove>) => void;
  scriptedMoves: ScriptedMoveStep[];
  addScriptedMove: () => void;
  removeScriptedMove: (id: string) => void;
  moveScriptedMove: (id: string, direction: 'up' | 'down') => void;
  startScriptedMove: () => void; pauseScriptedMove: () => void; resetScriptedMove: () => void;
  manualSpeed: number; setManualSpeed: (v: number) => void;
  semiSpeed: number; setSemiSpeed: (v: number) => void;
  autonomousMaxSpeed: number; setAutonomousMaxSpeed: (v: number) => void;
  painting: PaintingState;
  setPainting: (p: Partial<PaintingState>) => void;
  pidLinear: PIDSet; setPidLinear: (v: PIDSet) => void;
  pidAngular: PIDSet; setPidAngular: (v: PIDSet) => void;
  pidHistory: { time: number; setpoint: number; actual: number }[];
  joystickOutput: { linear: number; angular: number };
  setJoystickOutput: (v: { linear: number; angular: number }) => void;
  sendVelocity: (linear: number, angular: number) => void;
  sendCommand: (command: string, payload?: Record<string, unknown>) => void;
  recordManualReading: (label?: string) => void;
  injectTestReport: () => void;
  reportEvents: ReportEvent[];
  emergencyStop: () => void;
  units: 'metric' | 'imperial';
  setUnits: (u: 'metric' | 'imperial') => void;
  gpsThreshold: number; setGpsThreshold: (v: number) => void;
  encoderErrorLimit: number; setEncoderErrorLimit: (v: number) => void;
  batteryWarning: number; setBatteryWarning: (v: number) => void;
  streamTimeout: number; setStreamTimeout: (v: number) => void;
  mapTileSource: string; setMapTileSource: (s: string) => void;
}

type BridgePayload = {
  frame?: string;
  arduino?: Record<string, unknown> | null;
  raw?: string;
  stats?: BridgeStats;
  ack?: { type?: 'ack'; message?: string };
  error?: { type?: 'error'; message?: string };
};

const DEFAULT_GPS: GPSData = { lat: 30.0444, lng: 31.2357, speed: 0, heading: 0, fix: false, accuracy: 999, timestamp: 0 };
const DEFAULT_IMU: IMUData = { roll: 0, pitch: 0, yaw: 0, accelX: 0, accelY: 0, accelZ: 0, gyroX: 0, gyroY: 0, gyroZ: 0, timestamp: 0 };
const DEFAULT_ENCODERS: EncoderData = { leftTicks: 0, rightTicks: 0, leftRPM: 0, rightRPM: 0, linearVelocity: 0, odometryError: 0, errorHistory: [], timestamp: 0 };
const MODEL_STORAGE_KEY = 'roboscan-selected-model-path';
const TOMTOM_STORAGE_KEY = 'roboscan-tomtom-api-key';
const BRIDGE_PORT = 8765;
const MIN_COMMAND_PWM = 1;
const MAX_COMMAND_PWM = 255;

const RobotContext = createContext<RobotContextType>({} as RobotContextType);

export function RobotProvider({ children }: { children: React.ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionIp, setConnectionIp] = useState('192.168.1.100');
  const [hostname, setHostname] = useState('raspberrypi');
  const [uptime, setUptime] = useState(0);
  const [battery, setBattery] = useState(0);
  const [latency, setLatency] = useState(0);
  const [bridgeStats, setBridgeStats] = useState<BridgeStats | null>(null);
  const [cameraFrame, setCameraFrame] = useState('');
  const [cameraLive, setCameraLive] = useState(false);
  const [testingMode, setTestingMode] = useState(false);
  const [modelStatus, setModelStatus] = useState<RobotContextType['modelStatus']>('idle');
  const [selectedModelPathState, setSelectedModelPathState] = useState(() => localStorage.getItem(MODEL_STORAGE_KEY) ?? '');
  const [tomTomApiKeyState, setTomTomApiKeyState] = useState(() => localStorage.getItem(TOMTOM_STORAGE_KEY) ?? '');
  const [imu, setImu] = useState<IMUData>(DEFAULT_IMU);
  const [gps, setGps] = useState<GPSData>(DEFAULT_GPS);
  const [encoders, setEncoders] = useState<EncoderData>(DEFAULT_ENCODERS);
  const [imuLive, setImuLive] = useState(false);
  const [gpsLive, setGpsLive] = useState(false);
  const [encodersLive, setEncodersLive] = useState(false);
  const [mode, setModeState] = useState<RobotMode>('manual');
  const [motionPaintMode, setMotionPaintModeState] = useState<MotionPaintMode>('move-only');
  const [totalDistance, setTotalDistance] = useState(0);
  const [segmentDistance, setSegmentDistance] = useState(0);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [pathExecStatus, setPathExecStatus] = useState<PathExecStatus>('idle');
  const [currentTargetIdx, setCurrentTargetIdx] = useState(0);
  const [scriptedStepIdx, setScriptedStepIdx] = useState(0);
  const [manualSpeed, setManualSpeed] = useState(0.5);
  const [semiSpeed, setSemiSpeed] = useState(0.5);
  const [autonomousMaxSpeed, setAutonomousMaxSpeed] = useState(0.5);
  const [scriptedMoveState, setScriptedMoveState] = useState<ScriptedMove>({ direction: 'forward', distance: 1, movementType: 'straight', speed: 0.5 });
  const [scriptedMoves, setScriptedMoves] = useState<ScriptedMoveStep[]>([]);
  const [painting, setPaintingState] = useState<PaintingState>({
    active: false, mode: 'solid', dashLength: 0.5, gapLength: 0.3,
    color: '#ffffff', targetDistance: 100, distancePainted: 0, status: 'idle',
  });
  const [pidLinear, setPidLinear] = useState<PIDSet>({ kp: 0, ki: 0, kd: 0 });
  const [pidAngular, setPidAngular] = useState<PIDSet>({ kp: 0, ki: 0, kd: 0 });
  const [joystickOutput, setJoystickOutputState] = useState({ linear: 0, angular: 0 });
  const [reportEvents, setReportEvents] = useState<ReportEvent[]>([]);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [gpsThreshold, setGpsThreshold] = useState(5);
  const [encoderErrorLimit, setEncoderErrorLimit] = useState(0.15);
  const [batteryWarning, setBatteryWarning] = useState(20);
  const [streamTimeout, setStreamTimeout] = useState(3);
  const [mapTileSource, setMapTileSource] = useState('osm');

  const socketRef = useRef<WebSocket | null>(null);
  const connectedAtRef = useRef<number | null>(null);
  const lastMessageAtRef = useRef<number | null>(null);
  const latestRef = useRef({ gps: DEFAULT_GPS, imu: DEFAULT_IMU, encoders: DEFAULT_ENCODERS });

  useEffect(() => {
    latestRef.current = { gps, imu, encoders };
  }, [gps, imu, encoders]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!connectedAtRef.current) return;
      setUptime((Date.now() - connectedAtRef.current) / 1000);
      if (lastMessageAtRef.current) setLatency(Date.now() - lastMessageAtRef.current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const appendReportEvent = useCallback((event: Omit<ReportEvent, 'id' | 'timestamp' | 'gps' | 'imu' | 'encoders'> & { timestamp?: number }) => {
    const timestamp = event.timestamp ?? Date.now();
    const snapshot = latestRef.current;
    setReportEvents((prev) => [{
      id: `${event.source}-${timestamp}-${prev.length}`,
      timestamp,
      gps: snapshot.gps,
      imu: snapshot.imu,
      encoders: snapshot.encoders,
      ...event,
    }, ...prev].slice(0, 500));
  }, []);

  const sendCommand = useCallback((command: string, payload?: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload ? { type: command, ...payload } : { type: command }));
  }, []);

  useEffect(() => {
    if (!testingMode) return;

    setConnectionStatus('disconnected');
    setCameraLive(true);
    setBridgeStats({
      camera_connected: true,
      camera_has_frame: true,
      camera_source: 'laptop-test-camera',
      loop_fps: 24,
      stream_fps: 24,
      camera_error: null,
    });
    appendReportEvent({ kind: 'test', source: 'test', label: 'Testing mode enabled', details: 'Laptop camera and simulated sensors active' });

    let tick = 0;
    const timer = window.setInterval(() => {
      tick += 1;
      const now = Date.now();
      const simulatedGps: GPSData = {
        lat: DEFAULT_GPS.lat + tick * 0.00001,
        lng: DEFAULT_GPS.lng + tick * 0.000012,
        speed: 0.35 + (tick % 6) * 0.03,
        heading: (tick * 8) % 360,
        fix: true,
        accuracy: 1.8,
        timestamp: now,
      };
      const simulatedImu: IMUData = {
        roll: Math.sin(tick / 5) * 2,
        pitch: Math.cos(tick / 6) * 2,
        yaw: simulatedGps.heading,
        accelX: 0.02,
        accelY: 0.01,
        accelZ: 9.81,
        gyroX: 0.01,
        gyroY: 0.02,
        gyroZ: 0.03,
        timestamp: now,
      };
      const simulatedEncoders: EncoderData = {
        leftTicks: tick * 12,
        rightTicks: tick * 12 + (tick % 3),
        leftRPM: 42 + (tick % 5),
        rightRPM: 42 + ((tick + 2) % 5),
        linearVelocity: simulatedGps.speed,
        odometryError: Math.abs(Math.sin(tick / 8)) * 0.03,
        errorHistory: [...latestRef.current.encoders.errorHistory.slice(-59), Math.abs(Math.sin(tick / 8)) * 0.03],
        timestamp: now,
      };
      setGps(simulatedGps);
      setImu(simulatedImu);
      setEncoders(simulatedEncoders);
      setGpsLive(true);
      setImuLive(true);
      setEncodersLive(true);
      setBattery(88 - (tick % 8));
      setLatency(12 + (tick % 5));
      setTotalDistance((prev) => prev + simulatedGps.speed * 0.5);
      setSegmentDistance((prev) => prev + simulatedGps.speed * 0.5);
    }, 500);

    return () => {
      window.clearInterval(timer);
      setCameraLive(false);
      setBridgeStats(null);
      setGpsLive(false);
      setImuLive(false);
      setEncodersLive(false);
    };
  }, [appendReportEvent, testingMode]);

  const sendVelocity = useCallback((linear: number, angular: number) => {
    setJoystickOutputState({ linear, angular });
    const speed = velocityToPwm(linear, angular);

    if (speed === 0) {
      sendCommand('stop');
      return;
    }

    if (Math.abs(linear) >= Math.abs(angular)) {
      sendCommand('movement', { action: linear > 0 ? 'forward' : 'backward', speed });
      return;
    }

    sendCommand('movement', { action: angular > 0 ? 'left' : 'right', speed });
  }, [sendCommand]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    connectedAtRef.current = null;
    lastMessageAtRef.current = null;
    setConnectionStatus('disconnected');
    setCameraLive(false);
    setCameraFrame('');
    setBridgeStats(null);
    setImuLive(false);
    setGpsLive(false);
    setEncodersLive(false);
    setJoystickOutputState({ linear: 0, angular: 0 });
    setPathExecStatus('idle');
  }, []);

  const handleArduinoPayload = useCallback((arduino: Record<string, unknown>) => {
    const now = Date.now();
    const hasGpsFields = hasAny(arduino, [
      'lat', 'latitude', 'gps_lat', 'la',
      'lng', 'lon', 'longitude', 'gps_lng', 'gps_lon', 'lo',
      'fix', 'gps_fix', 'gpsFix', 'g',
      'gps_speed', 'gpsSpeed', 'gps_heading', 'gpsHeading', 'gps_hdop', 'hdop',
    ]);
    const hasGpsFix = hasAny(arduino, ['fix', 'gps_fix', 'gpsFix', 'g']);
    const heading = numberFrom(arduino, ['heading', 'yaw', 'compass', 'h'], 0);
    const gpsHeading = numberFrom(arduino, ['gps_heading', 'gpsHeading', 'course'], heading);
    const gpsSpeed = numberFrom(arduino, ['gps_speed', 'gpsSpeed'], 0);
    setGps((prev) => {
      const gpsFix = hasGpsFix ? boolFrom(arduino, ['fix', 'gps_fix', 'gpsFix', 'g'], prev.fix) : prev.fix;
      const lat = gpsFix ? numberFrom(arduino, ['lat', 'latitude', 'gps_lat', 'la'], prev.lat) : prev.lat;
      const lng = gpsFix ? numberFrom(arduino, ['lng', 'lon', 'longitude', 'gps_lng', 'gps_lon', 'lo'], prev.lng) : prev.lng;
      const speed = numberFrom(arduino, ['gps_speed', 'gpsSpeed'], prev.speed);
      const accuracy = numberFrom(arduino, ['accuracy', 'gps_accuracy', 'gps_hdop', 'hdop', 'hd'], prev.accuracy);
      return { lat, lng, speed, heading: gpsHeading, fix: gpsFix, accuracy, timestamp: hasGpsFields ? now : prev.timestamp };
    });
    setGpsLive((prev) => hasGpsFields ? boolFrom(arduino, ['fix', 'gps_fix', 'gpsFix', 'g'], prev) || hasAny(arduino, ['lat', 'latitude', 'lng', 'lon', 'longitude', 'la', 'lo']) : prev);

    setImu({
      roll: numberFrom(arduino, ['roll'], 0),
      pitch: numberFrom(arduino, ['pitch'], 0),
      yaw: numberFrom(arduino, ['yaw', 'heading', 'compass', 'h'], heading),
      accelX: numberFrom(arduino, ['accelX', 'accel_x', 'ax'], 0),
      accelY: numberFrom(arduino, ['accelY', 'accel_y', 'ay'], 0),
      accelZ: numberFrom(arduino, ['accelZ', 'accel_z', 'az'], 0),
      gyroX: numberFrom(arduino, ['gyroX', 'gyro_x', 'gx'], 0),
      gyroY: numberFrom(arduino, ['gyroY', 'gyro_y', 'gy'], 0),
      gyroZ: numberFrom(arduino, ['gyroZ', 'gyro_z', 'gz'], 0),
      timestamp: now,
    });
    setImuLive(hasAny(arduino, ['roll', 'pitch', 'yaw', 'heading', 'compass', 'h']));

    const leftTicks = numberFrom(arduino, ['leftTicks', 'left_ticks', 'encoder_left', 'left', 'e1'], 0);
    const rightTicks = numberFrom(arduino, ['rightTicks', 'right_ticks', 'encoder_right', 'right', 'e2'], 0);
    const leftRPM = numberFrom(arduino, ['leftRPM', 'left_rpm', 'de1', 'ls'], 0);
    const rightRPM = numberFrom(arduino, ['rightRPM', 'right_rpm', 'de2', 'rs'], 0);
    const linearVelocity = numberFrom(arduino, ['linearVelocity', 'linear_velocity', 'velocity', 'speed', 'v'], gpsSpeed);
    const odometryError = numberFrom(arduino, ['odometryError', 'odometry_error', 'odom_error'], 0);
    setEncoders((prev) => ({
      leftTicks,
      rightTicks,
      leftRPM,
      rightRPM,
      linearVelocity,
      odometryError,
      errorHistory: [...prev.errorHistory.slice(-59), odometryError],
      timestamp: now,
    }));
    setEncodersLive(hasAny(arduino, ['leftTicks', 'left_ticks', 'rightTicks', 'right_ticks', 'leftRPM', 'rightRPM', 'linearVelocity', 'e1', 'e2', 'de1', 'de2', 'ls', 'rs', 'v']));
    setBattery(numberFrom(arduino, ['battery', 'battery_percent', 'batteryLevel'], battery));
    setHostname(stringFrom(arduino, ['hostname', 'host'], hostname));
    setTotalDistance(numberFrom(arduino, ['totalDistance', 'total_distance'], numberFrom(arduino, ['left_m', 'right_m'], totalDistance)));
    setSegmentDistance(numberFrom(arduino, ['segmentDistance', 'segment_distance', 'plot_distance_m', 'pd', 'plot_target_m', 'pt'], segmentDistance));
  }, [battery, hostname, segmentDistance, totalDistance]);

  const connect = useCallback(() => {
    const host = connectionIp.trim();
    if (!host || connectionStatus === 'attempting') return;
    disconnect();
    setConnectionStatus('attempting');
    const socket = new WebSocket(`ws://${host}:${BRIDGE_PORT}`);
    socketRef.current = socket;

    socket.onopen = () => {
      connectedAtRef.current = Date.now();
      lastMessageAtRef.current = Date.now();
      setConnectionStatus('connected');
      setHostname(host);
    };
    socket.onmessage = (event) => {
      lastMessageAtRef.current = Date.now();
      const payload = parseBridgePayload(event.data);
      if (!payload) return;
      if (payload.stats) {
        setBridgeStats({
          ...payload.stats,
          latest_ack: payload.ack?.message,
          latest_error: payload.error?.message,
        });
        setCameraLive(Boolean(payload.stats.camera_connected || payload.stats.camera_has_frame));
        if (payload.stats.path_status) setPathExecStatus(payload.stats.path_status);
        if (typeof payload.stats.current_target_idx === 'number') setCurrentTargetIdx(payload.stats.current_target_idx);
        if (typeof payload.stats.scripted_step_idx === 'number') setScriptedStepIdx(payload.stats.scripted_step_idx);
      }
      if ((payload.ack || payload.error) && !payload.stats) {
        setBridgeStats((prev) => ({
          ...(prev ?? {}),
          latest_ack: payload.ack?.message ?? prev?.latest_ack,
          latest_error: payload.error?.message ?? prev?.latest_error,
        }));
      }
      const arduinoPayload = payload.arduino ?? parseCompactArduinoStatus(payload.raw);
      if (arduinoPayload) handleArduinoPayload(arduinoPayload);
      if (payload.frame) {
        setCameraFrame(`data:image/jpeg;base64,${payload.frame}`);
        setCameraLive(true);
      }
    };
    socket.onerror = () => {
      setConnectionStatus('disconnected');
      setCameraLive(false);
    };
    socket.onclose = () => {
      if (socketRef.current === socket) {
        socketRef.current = null;
        setConnectionStatus('disconnected');
        setCameraLive(false);
      }
    };
  }, [connectionIp, connectionStatus, disconnect, handleArduinoPayload]);

  const setMode = useCallback((nextMode: RobotMode) => {
    setModeState(nextMode);
  }, []);

  const setMotionPaintMode = useCallback((nextMode: MotionPaintMode) => {
    setMotionPaintModeState(nextMode);
  }, []);

  const addWaypoint = useCallback((lat: number, lng: number) => {
    setWaypoints((prev) => [...prev, { id: `wp-${Date.now()}`, lat, lng, order: prev.length }]);
  }, []);

  const updateWaypoint = useCallback((id: string, lat: number, lng: number) => {
    setWaypoints((prev) => prev.map((wp) => wp.id === id ? { ...wp, lat, lng } : wp));
  }, []);

  const deleteWaypoint = useCallback((id: string) => {
    setWaypoints((prev) => prev.filter((wp) => wp.id !== id).map((wp, order) => ({ ...wp, order })));
  }, []);

  const importWaypoints = useCallback((wps: Waypoint[]) => {
    setWaypoints(wps.map((wp, order) => ({ ...wp, order, id: wp.id || `wp-${Date.now()}-${order}` })));
  }, []);

  const startPath = useCallback((route?: { points: RoutePoint[]; source: 'tomtom' | 'direct'; maxSpeed: number }) => {
    setPathExecStatus('running');
    setCurrentTargetIdx(0);
    const routePoints = route?.points ?? waypoints.map(({ lat, lng }) => ({ lat, lng }));
    appendReportEvent({ kind: 'command', source: 'robot', label: 'Started waypoint path', details: `${routePoints.length} route points at max ${route?.maxSpeed ?? autonomousMaxSpeed}m/s` });
  }, [appendReportEvent, autonomousMaxSpeed, waypoints]);

  const pausePath = useCallback(() => {
    setPathExecStatus('paused');
    sendCommand('stop');
  }, [sendCommand]);

  const stopPath = useCallback(() => {
    setPathExecStatus('idle');
    setCurrentTargetIdx(0);
    sendCommand('stop');
  }, [sendCommand]);

  const resetPath = useCallback(() => {
    setPathExecStatus('idle');
    setCurrentTargetIdx(0);
  }, []);

  const setScriptedMove = useCallback((move: Partial<ScriptedMove>) => {
    setScriptedMoveState((prev) => ({ ...prev, ...move }));
  }, []);

  const addScriptedMove = useCallback(() => {
    setScriptedMoves((prev) => [
      ...prev,
      { ...scriptedMoveState, speed: scriptedMoveState.speed || semiSpeed, id: `step-${Date.now()}-${prev.length}` },
    ]);
  }, [scriptedMoveState, semiSpeed]);

  const removeScriptedMove = useCallback((id: string) => {
    setScriptedMoves((prev) => prev.filter((step) => step.id !== id));
  }, []);

  const moveScriptedMove = useCallback((id: string, direction: 'up' | 'down') => {
    setScriptedMoves((prev) => {
      const next = [...prev];
      const index = next.findIndex((step) => step.id === id);
      const target = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const startScriptedMove = useCallback(() => {
    const steps = scriptedMoves.length ? scriptedMoves : [{ ...scriptedMoveState, id: `step-${Date.now()}-single` }];
    setPathExecStatus('running');
    setScriptedStepIdx(0);
    const firstStep = steps[0];
    const speed = normalizedSpeedToPwm(firstStep.speed);
    sendCommand('speed', { speed });
    sendCommand('movement', { action: firstStep.direction, speed });
    appendReportEvent({ kind: 'command', source: 'robot', label: 'Started scripted path', details: `${steps.length} movement step${steps.length === 1 ? '' : 's'}` });
  }, [appendReportEvent, scriptedMoveState, scriptedMoves, sendCommand]);

  const pauseScriptedMove = useCallback(() => {
    setPathExecStatus('paused');
    sendCommand('stop');
  }, [sendCommand]);

  const resetScriptedMove = useCallback(() => {
    setPathExecStatus('idle');
    setScriptedStepIdx(0);
    sendCommand('stop');
  }, [sendCommand]);

  const setPainting = useCallback((next: Partial<PaintingState>) => {
    setPaintingState((prev) => {
      const updated = { ...prev, ...next };
      if (!updated.active) {
        sendCommand('plot', { mode: 'off' });
      } else if (updated.mode === 'dashed') {
        sendCommand('plot', {
          mode: 'dash_dist',
          dash_m: updated.dashLength,
          gap_m: updated.gapLength,
        });
        sendCommand('plot', { mode: 'dash' });
      } else {
        sendCommand('plot', { mode: 'cont' });
      }
      return updated;
    });
  }, [sendCommand]);

  const addDetection = useCallback((type: 'pothole' | 'crack', confidence: number, source: Detection['source'] = 'model') => {
    const snapshot = latestRef.current;
    const detection: Detection = {
      id: `det-${Date.now()}`,
      type,
      lat: snapshot.gps.lat,
      lng: snapshot.gps.lng,
      confidence,
      timestamp: Date.now(),
      source,
    };
    setDetections((prev) => [detection, ...prev].slice(0, 500));
    appendReportEvent({ kind: 'detection', source: source === 'test' ? 'test' : 'robot', label: type, confidence, details: `Detected ${type}` });
  }, [appendReportEvent]);

  const recordManualReading = useCallback((label = 'Manual reading') => {
    appendReportEvent({ kind: 'manual-reading', source: 'manual', label, details: 'Manual sensor snapshot recorded' });
  }, [appendReportEvent]);

  const injectTestReport = useCallback(() => {
    const type = detections.length % 2 === 0 ? 'pothole' : 'crack';
    addDetection(type, 0.88, 'test');
    appendReportEvent({ kind: 'test', source: 'test', label: 'Test application record', confidence: 0.88, details: 'Synthetic test event generated from Operations tab' });
  }, [addDetection, appendReportEvent, detections.length]);

  const emergencyStop = useCallback(() => {
    sendVelocity(0, 0);
    setPathExecStatus('idle');
    setPaintingState((prev) => ({ ...prev, active: false, status: 'idle' }));
    sendCommand('stop');
    appendReportEvent({ kind: 'command', source: 'robot', label: 'Emergency stop' });
  }, [appendReportEvent, sendCommand, sendVelocity]);

  const setSelectedModelPath = useCallback((value: string) => {
    setSelectedModelPathState(value);
    localStorage.setItem(MODEL_STORAGE_KEY, value);
    setModelStatus(value ? 'ready' : 'idle');
  }, []);

  const setTomTomApiKey = useCallback((value: string) => {
    setTomTomApiKeyState(value);
    localStorage.setItem(TOMTOM_STORAGE_KEY, value);
  }, []);

  const pidHistory = useMemo(() => encoders.errorHistory.map((actual, time) => ({ time, setpoint: 0, actual })), [encoders.errorHistory]);

  return (
    <RobotContext.Provider value={{
      connectionStatus, connectionIp, setConnectionIp, connect, disconnect,
      hostname, uptime, battery, latency, bridgeStats, cameraFrame, cameraLive, testingMode, setTestingMode, modelStatus,
      selectedModelPath: selectedModelPathState, setSelectedModelPath, setModelStatus,
      tomTomApiKey: tomTomApiKeyState, setTomTomApiKey,
      imu, gps, encoders, imuLive, gpsLive, encodersLive,
      mode, setMode, motionPaintMode, setMotionPaintMode, gpsFix: gps.fix, totalDistance, segmentDistance,
      potholeCount: detections.filter((d) => d.type === 'pothole').length,
      crackCount: detections.filter((d) => d.type === 'crack').length,
      detections, addDetection,
      waypoints, addWaypoint, updateWaypoint, deleteWaypoint, importWaypoints,
      pathExecStatus, startPath, pausePath, stopPath, resetPath, currentTargetIdx, scriptedStepIdx,
      scriptedMove: scriptedMoveState, setScriptedMove,
      scriptedMoves, addScriptedMove, removeScriptedMove, moveScriptedMove,
      startScriptedMove, pauseScriptedMove, resetScriptedMove,
      manualSpeed, setManualSpeed, semiSpeed, setSemiSpeed, autonomousMaxSpeed, setAutonomousMaxSpeed,
      painting, setPainting,
      pidLinear, setPidLinear, pidAngular, setPidAngular, pidHistory,
      joystickOutput, setJoystickOutput: sendVelocity, sendVelocity, sendCommand,
      recordManualReading, injectTestReport, reportEvents,
      emergencyStop,
      units, setUnits, gpsThreshold, setGpsThreshold,
      encoderErrorLimit, setEncoderErrorLimit, batteryWarning, setBatteryWarning,
      streamTimeout, setStreamTimeout, mapTileSource, setMapTileSource,
    }}>
      {children}
    </RobotContext.Provider>
  );
}

function parseBridgePayload(data: unknown): BridgePayload | null {
  if (typeof data !== 'string') return null;
  try {
    return JSON.parse(data) as BridgePayload;
  } catch {
    return null;
  }
}

function parseCompactArduinoStatus(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== 'string' || !raw.startsWith('ST,')) return null;

  const parsed: Record<string, unknown> = { type: 'status' };
  for (const part of raw.slice(3).split(',')) {
    const [key, value] = part.split('=');
    if (!key || value === undefined) continue;
    parsed[key.trim()] = parseCompactValue(value);
  }
  return parsed;
}

function parseCompactValue(value: string): number | string {
  const trimmed = value.trim();
  const numeric = Number(trimmed);
  return trimmed !== '' && Number.isFinite(numeric) ? numeric : trimmed;
}

function normalizedSpeedToPwm(speed: number): number {
  if (!Number.isFinite(speed) || speed <= 0) return 0;
  return Math.max(MIN_COMMAND_PWM, Math.min(MAX_COMMAND_PWM, Math.round(speed * MAX_COMMAND_PWM)));
}

function velocityToPwm(linear: number, angular: number): number {
  return normalizedSpeedToPwm(Math.max(Math.abs(linear), Math.abs(angular)));
}

function numberFrom(data: Record<string, unknown>, keys: string[], fallback: number): number {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function stringFrom(data: Record<string, unknown>, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return fallback;
}

function boolFrom(data: Record<string, unknown>, keys: string[], fallback: boolean): boolean {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return ['true', '1', 'yes', 'fix'].includes(value.toLowerCase());
  }
  return fallback;
}

function hasAny(data: Record<string, unknown>, keys: string[]): boolean {
  return keys.some((key) => data[key] !== undefined && data[key] !== null);
}

export const useRobot = () => useContext(RobotContext);
