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
  count?: number;
  lastSeenAt?: number;
  mapped?: boolean;
}

export interface Waypoint {
  id: string; lat: number; lng: number; order: number; headingOverride?: number | null;
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

export interface CameraCalibration {
  heightCm: number;
  tiltDeg: number;
  horizontalFovDeg: number;
  verticalFovDeg: number;
  streamWidth: number;
  streamHeight: number;
  forwardOffsetCm: number;
}

export interface ImageProcessingSettings {
  enabled: boolean;
  brightness: number;
  contrast: number;
  gamma: number;
  autoNormalize: boolean;
  showProcessed: boolean;
}

export interface ReportSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  mode: RobotMode;
}

export interface ReportEvent {
  id: string;
  timestamp: number;
  kind: 'detection' | 'manual-reading' | 'command' | 'test' | 'session' | 'telemetry';
  label: string;
  source: 'robot' | 'manual' | 'test';
  gps: GPSData;
  imu: IMUData;
  encoders: EncoderData;
  confidence?: number;
  details?: string;
  sessionId?: string;
  arduino?: Record<string, unknown> | null;
  mode?: RobotMode;
  motorMotion?: string;
  plotMode?: string;
  plotActive?: boolean;
  dashLengthM?: number;
  gapLengthM?: number;
  plottedDashedM?: number;
  plottedUndashedM?: number;
  trackingErrorM?: number;
  pathPosition?: number;
  totalMovedDistance?: number;
}

export interface RobotContextType {
  connectionStatus: ConnectionStatus;
  connectionIp: string;
  setConnectionIp: (ip: string) => void;
  connect: () => void;
  disconnect: () => void;
  hostname: string; uptime: number; battery: number; latency: number;
  bridgeStats: BridgeStats | null;
  arduinoTelemetry: Record<string, unknown> | null;
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
  addDetection: (type: 'pothole' | 'crack', confidence: number, source?: Detection['source'], pixelBox?: { x: number; y: number; width: number; height: number; frameWidth?: number; frameHeight?: number }) => void;
  waypoints: Waypoint[];
  addWaypoint: (lat: number, lng: number) => void;
  updateWaypoint: (id: string, lat: number, lng: number) => void;
  deleteWaypoint: (id: string) => void;
  clearWaypoints: () => void;
  moveWaypoint: (id: string, direction: 'up' | 'down') => void;
  updateWaypointHeading: (id: string, heading: number | null) => void;
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
  robotSpeedCap: number; setRobotSpeedCap: (v: number) => void;
  autoTurnSpeed: number; setAutoTurnSpeed: (v: number) => void;
  cameraCalibration: CameraCalibration; setCameraCalibration: (v: Partial<CameraCalibration>) => void;
  compassOffset: number; setCompassOffset: (v: number) => void;
  alignRobotFrontToHeading: boolean; setAlignRobotFrontToHeading: (v: boolean) => void;
  imageProcessing: ImageProcessingSettings; setImageProcessing: (v: Partial<ImageProcessingSettings>) => void;
  painting: PaintingState;
  setPainting: (p: Partial<PaintingState>) => void;
  pidLinear: PIDSet; setPidLinear: (v: PIDSet) => void;
  pidAngular: PIDSet; setPidAngular: (v: PIDSet) => void;
  pidHistory: { time: number; setpoint: number; actual: number }[];
  sendMotorTrim: (left: number, right: number) => void;
  sendEncoderPid: (pid: PIDSet) => void;
  stopWaypointQueue: () => void;
  joystickOutput: { linear: number; angular: number };
  setJoystickOutput: (v: { linear: number; angular: number }) => void;
  sendVelocity: (linear: number, angular: number) => void;
  sendCommand: (command: string, payload?: Record<string, unknown>) => void;
  startSession: () => void;
  stopSession: () => void;
  activeSession: ReportSession | null;
  reportSessions: ReportSession[];
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
  timestamp_egypt?: string;
  timestamp_ms?: number;
  stats?: BridgeStats;
  ack?: { type?: 'ack'; message?: string };
  error?: { type?: 'error'; message?: string };
};

const DEFAULT_GPS: GPSData = { lat: 30.0444, lng: 31.2357, speed: 0, heading: 0, fix: false, accuracy: 999, timestamp: 0 };
const DEFAULT_IMU: IMUData = { roll: 0, pitch: 0, yaw: 0, accelX: 0, accelY: 0, accelZ: 0, gyroX: 0, gyroY: 0, gyroZ: 0, timestamp: 0 };
const DEFAULT_ENCODERS: EncoderData = { leftTicks: 0, rightTicks: 0, leftRPM: 0, rightRPM: 0, linearVelocity: 0, odometryError: 0, errorHistory: [], timestamp: 0 };
const MODEL_STORAGE_KEY = 'roboscan-selected-model-path';
const TOMTOM_STORAGE_KEY = 'roboscan-tomtom-api-key';
const PREF_STORAGE_KEY = 'roboscan-robot-preferences';
const REPORT_EVENTS_STORAGE_KEY = 'roboscan-report-events';
const REPORT_SESSIONS_STORAGE_KEY = 'roboscan-report-sessions';
const BRIDGE_PORT = 8765;
const MIN_COMMAND_PWM = 1;
const MAX_COMMAND_PWM = 255;
const DEFAULT_ROBOT_SPEED_CAP = 0.4;
const POTHOME_DUPLICATE_DISTANCE_M = 2;
const GPS_GLITCH_DISTANCE_M = 1000;
const GPS_DEFAULT_REJECT_DISTANCE_M = 50;
const WAYPOINT_COMMAND_INTERVAL_MS = 150;
const DEFAULT_CAMERA_CALIBRATION: CameraCalibration = {
  heightCm: 35,
  tiltDeg: 35,
  horizontalFovDeg: 62,
  verticalFovDeg: 38,
  streamWidth: 320,
  streamHeight: 180,
  forwardOffsetCm: 0,
};
const DEFAULT_IMAGE_PROCESSING: ImageProcessingSettings = {
  enabled: false,
  brightness: 0,
  contrast: 1,
  gamma: 1,
  autoNormalize: false,
  showProcessed: true,
};

type StoredPreferences = {
  robotSpeedCap?: number;
  autoTurnSpeed?: number;
  cameraCalibration?: Partial<CameraCalibration>;
  compassOffset?: number;
  alignRobotFrontToHeading?: boolean;
  imageProcessing?: Partial<ImageProcessingSettings>;
};

const RobotContext = createContext<RobotContextType>({} as RobotContextType);

export function RobotProvider({ children }: { children: React.ReactNode }) {
  const storedPreferences = useMemo(readStoredPreferences, []);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionIp, setConnectionIp] = useState('192.168.1.100');
  const [hostname, setHostname] = useState('raspberrypi');
  const [uptime, setUptime] = useState(0);
  const [battery, setBattery] = useState(0);
  const [latency, setLatency] = useState(0);
  const [bridgeStats, setBridgeStats] = useState<BridgeStats | null>(null);
  const [arduinoTelemetry, setArduinoTelemetry] = useState<Record<string, unknown> | null>(null);
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
  const [robotSpeedCap, setRobotSpeedCapState] = useState(storedPreferences.robotSpeedCap ?? DEFAULT_ROBOT_SPEED_CAP);
  const [autoTurnSpeed, setAutoTurnSpeedState] = useState(storedPreferences.autoTurnSpeed ?? DEFAULT_ROBOT_SPEED_CAP);
  const [cameraCalibration, setCameraCalibrationState] = useState<CameraCalibration>({ ...DEFAULT_CAMERA_CALIBRATION, ...(storedPreferences.cameraCalibration ?? {}) });
  const [compassOffset, setCompassOffsetState] = useState(normalizeSignedDegrees(storedPreferences.compassOffset ?? 0));
  const [alignRobotFrontToHeading, setAlignRobotFrontToHeadingState] = useState(storedPreferences.alignRobotFrontToHeading ?? true);
  const [imageProcessing, setImageProcessingState] = useState<ImageProcessingSettings>({ ...DEFAULT_IMAGE_PROCESSING, ...(storedPreferences.imageProcessing ?? {}) });
  const [manualSpeed, setManualSpeedState] = useState(DEFAULT_ROBOT_SPEED_CAP);
  const [semiSpeed, setSemiSpeedState] = useState(DEFAULT_ROBOT_SPEED_CAP);
  const [autonomousMaxSpeed, setAutonomousMaxSpeedState] = useState(DEFAULT_ROBOT_SPEED_CAP);
  const [scriptedMoveState, setScriptedMoveState] = useState<ScriptedMove>({ direction: 'forward', distance: 1, movementType: 'straight', speed: DEFAULT_ROBOT_SPEED_CAP });
  const [scriptedMoves, setScriptedMoves] = useState<ScriptedMoveStep[]>([]);
  const [painting, setPaintingState] = useState<PaintingState>({
    active: false, mode: 'solid', dashLength: 0.5, gapLength: 0.3,
    color: '#ffffff', targetDistance: 100, distancePainted: 0, status: 'idle',
  });
  const [pidLinear, setPidLinear] = useState<PIDSet>({ kp: 0, ki: 0, kd: 0 });
  const [pidAngular, setPidAngular] = useState<PIDSet>({ kp: 0, ki: 0, kd: 0 });
  const [joystickOutput, setJoystickOutputState] = useState({ linear: 0, angular: 0 });
  const [reportEvents, setReportEvents] = useState<ReportEvent[]>(() => readJsonArray<ReportEvent>(REPORT_EVENTS_STORAGE_KEY));
  const [reportSessions, setReportSessions] = useState<ReportSession[]>(() => readJsonArray<ReportSession>(REPORT_SESSIONS_STORAGE_KEY));
  const [activeSession, setActiveSession] = useState<ReportSession | null>(null);
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
  const lastManualMotionRef = useRef('');
  const scriptedTimerRef = useRef<number | null>(null);
  const activeSessionRef = useRef<ReportSession | null>(null);
  const latestTelemetryRef = useRef<Record<string, unknown> | null>(null);
  const lastTelemetryReportAtRef = useRef(0);
  const lastAckMessageRef = useRef('');
  const gpsPausedPlotterRef = useRef(false);
  const waypointCommandTimersRef = useRef<number[]>([]);

  useEffect(() => {
    latestRef.current = { gps, imu, encoders };
  }, [gps, imu, encoders]);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  useEffect(() => {
    latestTelemetryRef.current = arduinoTelemetry;
  }, [arduinoTelemetry]);

  useEffect(() => {
    localStorage.setItem(REPORT_EVENTS_STORAGE_KEY, JSON.stringify(reportEvents.slice(0, 10000)));
  }, [reportEvents]);

  useEffect(() => {
    localStorage.setItem(REPORT_SESSIONS_STORAGE_KEY, JSON.stringify(reportSessions.slice(0, 100)));
  }, [reportSessions]);

  useEffect(() => {
    localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify({
      robotSpeedCap,
      autoTurnSpeed,
      cameraCalibration,
      compassOffset,
      alignRobotFrontToHeading,
      imageProcessing,
    } satisfies StoredPreferences));
  }, [alignRobotFrontToHeading, autoTurnSpeed, cameraCalibration, compassOffset, imageProcessing, robotSpeedCap]);

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
    const telemetry = latestTelemetryRef.current;
    setReportEvents((prev) => [{
      id: `${event.source}-${timestamp}-${prev.length}`,
      timestamp,
      gps: snapshot.gps,
      imu: snapshot.imu,
      encoders: snapshot.encoders,
      sessionId: activeSessionRef.current?.id,
      arduino: telemetry,
      mode,
      motorMotion: stringFrom(telemetry ?? {}, ['motor_motion', 'motion', 'drive_motion'], inferMotorMotion(telemetry, snapshot.encoders)),
      plotMode: stringFrom(telemetry ?? {}, ['plot_mode'], 'OFF'),
      plotActive: boolFrom(telemetry ?? {}, ['spraying', 'plot_active'], false),
      dashLengthM: numberFrom(telemetry ?? {}, ['dash_m'], painting.dashLength),
      gapLengthM: numberFrom(telemetry ?? {}, ['gap_m'], painting.gapLength),
      plottedDashedM: numberFrom(telemetry ?? {}, ['plotted_dashed_m'], 0),
      plottedUndashedM: numberFrom(telemetry ?? {}, ['plotted_undashed_m', 'plot_distance_m'], 0),
      trackingErrorM: numberFrom(telemetry ?? {}, ['odometryError', 'odometry_error', 'odom_error', 'encoder_error'], snapshot.encoders.odometryError),
      pathPosition: numberFrom(telemetry ?? {}, ['wp_index', 'path_position'], currentTargetIdx),
      totalMovedDistance: totalDistance,
      ...event,
    }, ...prev].slice(0, 10000));
  }, [currentTargetIdx, mode, painting.dashLength, painting.gapLength, totalDistance]);

  const sendCommand = useCallback((command: string, payload?: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload ? { type: command, ...payload } : { type: command }));
  }, []);

  const clearQueuedWaypointCommands = useCallback(() => {
    waypointCommandTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    waypointCommandTimersRef.current = [];
  }, []);

  const queueWaypointCommands = useCallback((commands: Array<{ command: string; payload?: Record<string, unknown> }>) => {
    clearQueuedWaypointCommands();
    commands.forEach(({ command, payload }, index) => {
      const timer = window.setTimeout(() => {
        sendCommand(command, payload);
        waypointCommandTimersRef.current = waypointCommandTimersRef.current.filter((queuedTimer) => queuedTimer !== timer);
      }, index * WAYPOINT_COMMAND_INTERVAL_MS);
      waypointCommandTimersRef.current.push(timer);
    });
  }, [clearQueuedWaypointCommands, sendCommand]);

  const capSpeed = useCallback((speed: number) => clampSpeed(speed, robotSpeedCap), [robotSpeedCap]);

  const setRobotSpeedCap = useCallback((value: number) => {
    const next = clampSpeed(value, 2);
    setRobotSpeedCapState(next);
    setManualSpeedState((prev) => clampSpeed(prev, next));
    setSemiSpeedState((prev) => clampSpeed(prev, next));
    setAutonomousMaxSpeedState((prev) => clampSpeed(prev, next));
    setAutoTurnSpeedState((prev) => clampSpeed(prev, next));
    setScriptedMoveState((prev) => ({ ...prev, speed: clampSpeed(prev.speed, next) }));
    sendCommand('speed_cap', { speed: normalizedSpeedToPwm(next) });
  }, [sendCommand]);

  const setAutoTurnSpeed = useCallback((value: number) => {
    const next = capSpeed(value);
    setAutoTurnSpeedState(next);
    sendCommand('auto_turn_speed', { speed: normalizedSpeedToPwm(next) });
  }, [capSpeed, sendCommand]);

  const setManualSpeed = useCallback((value: number) => setManualSpeedState(capSpeed(value)), [capSpeed]);
  const setSemiSpeed = useCallback((value: number) => setSemiSpeedState(capSpeed(value)), [capSpeed]);
  const setAutonomousMaxSpeed = useCallback((value: number) => setAutonomousMaxSpeedState(capSpeed(value)), [capSpeed]);

  const setCameraCalibration = useCallback((value: Partial<CameraCalibration>) => {
    setCameraCalibrationState((prev) => sanitizeCameraCalibration({ ...prev, ...value }));
  }, []);

  const setCompassOffset = useCallback((value: number) => {
    const next = normalizeSignedDegrees(value);
    setCompassOffsetState(next);
    sendCommand('compass_offset', { degrees: next });
  }, [sendCommand]);

  const setImageProcessing = useCallback((value: Partial<ImageProcessingSettings>) => {
    setImageProcessingState((prev) => sanitizeImageProcessing({ ...prev, ...value }));
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
    const cappedLinear = Math.sign(linear) * capSpeed(Math.abs(linear));
    const cappedAngular = Math.sign(angular) * capSpeed(Math.abs(angular));
    setJoystickOutputState({ linear: cappedLinear, angular: cappedAngular });
    const speed = velocityToPwm(cappedLinear, cappedAngular, robotSpeedCap);
    const nextMotion = speed === 0 ? 'stop' : Math.abs(cappedLinear) >= Math.abs(cappedAngular) ? (cappedLinear > 0 ? 'forward' : 'backward') : (cappedAngular > 0 ? 'left' : 'right');

    if (speed === 0) {
      sendCommand('stop');
      lastManualMotionRef.current = 'stop';
      return;
    }

    if (lastManualMotionRef.current && lastManualMotionRef.current !== nextMotion && lastManualMotionRef.current !== 'stop') {
      sendCommand('stop');
    }
    lastManualMotionRef.current = nextMotion;

    if (Math.abs(cappedLinear) >= Math.abs(cappedAngular)) {
      sendCommand('speed', { speed });
      sendCommand('movement', { action: cappedLinear > 0 ? 'forward' : 'backward' });
      return;
    }

    sendCommand('turn_speed', { speed });
    sendCommand('movement', { action: cappedAngular > 0 ? 'left' : 'right' });
  }, [capSpeed, robotSpeedCap, sendCommand]);

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
    setArduinoTelemetry(null);
    setImuLive(false);
    setGpsLive(false);
    setEncodersLive(false);
    setJoystickOutputState({ linear: 0, angular: 0 });
    setPathExecStatus('idle');
  }, []);

  const handleArduinoPayload = useCallback((arduino: Record<string, unknown>) => {
    const now = Date.now();
    latestTelemetryRef.current = arduino;
    setArduinoTelemetry(arduino);
    const hasLat = hasAny(arduino, ['lat', 'latitude', 'gps_lat', 'la']);
    const hasLng = hasAny(arduino, ['lng', 'lon', 'longitude', 'gps_lng', 'gps_lon', 'lo']);
    const hasGpsFields = hasAny(arduino, [
      'lat', 'latitude', 'gps_lat', 'la',
      'lng', 'lon', 'longitude', 'gps_lng', 'gps_lon', 'lo',
      'fix', 'gps_fix', 'gpsFix', 'g',
      'gps_speed', 'gpsSpeed', 'gps_course', 'gpsCourse', 'gps_heading', 'gpsHeading', 'gps_hdop', 'hdop',
    ]);
    const hasGpsFix = hasAny(arduino, ['fix', 'gps_fix', 'gpsFix', 'g']);
    const correctedCompassHeading = numberFrom(arduino, ['compass_heading', 'compassHeading', 'heading', 'compass', 'h'], Number.NaN);
    const rawCompassHeading = numberFrom(arduino, ['compass_raw_heading', 'compassRawHeading', 'heading_raw'], Number.NaN);
    const heading = Number.isFinite(correctedCompassHeading)
      ? normalizeDegrees(correctedCompassHeading)
      : Number.isFinite(rawCompassHeading)
        ? normalizeDegrees(rawCompassHeading + compassOffset)
        : latestRef.current.gps.heading;
    const gpsSpeed = numberFrom(arduino, ['gps_speed', 'gpsSpeed'], 0);
    const moving = boolFrom(arduino, ['drive_moving', 'moving'], false)
      || Math.abs(numberFrom(arduino, ['linearVelocity', 'linear_velocity', 'velocity', 'speed', 'v'], gpsSpeed)) > 0.01
      || Math.abs(gpsSpeed) > 0.01;
    const previousGps = latestRef.current.gps;
    const reportedFix = hasGpsFix ? boolFrom(arduino, ['fix', 'gps_fix', 'gpsFix', 'g'], false) : previousGps.fix;
    const candidateLat = numberFrom(arduino, ['lat', 'latitude', 'gps_lat', 'la'], Number.NaN);
    const candidateLng = numberFrom(arduino, ['lng', 'lon', 'longitude', 'gps_lng', 'gps_lon', 'lo'], Number.NaN);
    const hasCoordinate = hasLat && hasLng && isValidGpsCoordinate(candidateLat, candidateLng);
    const distanceFromLast = hasCoordinate ? distanceMeters(previousGps.lat, previousGps.lng, candidateLat, candidateLng) : 0;
    const candidateLooksDefault = hasCoordinate && distanceMeters(candidateLat, candidateLng, DEFAULT_GPS.lat, DEFAULT_GPS.lng) <= GPS_DEFAULT_REJECT_DISTANCE_M;
    const isJumpGlitch = previousGps.timestamp > 0 && hasCoordinate && distanceFromLast > GPS_GLITCH_DISTANCE_M;
    const isDefaultGlitch = previousGps.timestamp > 0 && candidateLooksDefault && distanceFromLast > GPS_DEFAULT_REJECT_DISTANCE_M;
    const acceptedGpsFix = hasGpsFix && !reportedFix
      ? false
      : hasCoordinate
        ? reportedFix && !isJumpGlitch && !isDefaultGlitch
        : previousGps.fix;
    const acceptedCoordinate = acceptedGpsFix && hasCoordinate;
    setGps({
      lat: acceptedCoordinate ? candidateLat : previousGps.lat,
      lng: acceptedCoordinate ? candidateLng : previousGps.lng,
      speed: acceptedGpsFix ? numberFrom(arduino, ['gps_speed', 'gpsSpeed'], previousGps.speed) : 0,
      heading,
      fix: acceptedGpsFix,
      accuracy: acceptedGpsFix ? numberFrom(arduino, ['accuracy', 'gps_accuracy', 'gps_hdop', 'hdop', 'hd'], previousGps.accuracy) : previousGps.accuracy,
      timestamp: acceptedCoordinate ? now : previousGps.timestamp,
    });
    setGpsLive((prev) => hasGpsFields ? acceptedGpsFix : prev);

    if (!acceptedGpsFix && painting.active && !gpsPausedPlotterRef.current) {
      sendCommand('plot', { mode: 'off' });
      gpsPausedPlotterRef.current = true;
      setPaintingState((prev) => ({ ...prev, status: 'idle' }));
    } else if (acceptedGpsFix && moving && gpsPausedPlotterRef.current && painting.active) {
      sendCommand('plot', {
        mode: painting.mode === 'dashed' ? 'dash_dist' : 'cont',
        dash_m: painting.dashLength,
        gap_m: painting.gapLength,
      });
      gpsPausedPlotterRef.current = false;
      setPaintingState((prev) => ({ ...prev, status: 'active' }));
    }

    setImu((prev) => ({
      roll: numberFrom(arduino, ['roll'], prev.roll),
      pitch: numberFrom(arduino, ['pitch'], prev.pitch),
      yaw: numberFrom(arduino, ['yaw'], prev.yaw),
      accelX: numberFrom(arduino, ['accelX', 'accel_x', 'ax'], 0),
      accelY: numberFrom(arduino, ['accelY', 'accel_y', 'ay'], 0),
      accelZ: numberFrom(arduino, ['accelZ', 'accel_z', 'az'], 0),
      gyroX: numberFrom(arduino, ['gyroX', 'gyro_x', 'gx'], 0),
      gyroY: numberFrom(arduino, ['gyroY', 'gyro_y', 'gy'], 0),
      gyroZ: numberFrom(arduino, ['gyroZ', 'gyro_z', 'gz'], 0),
      timestamp: now,
    }));
    setImuLive(hasAny(arduino, ['roll', 'pitch', 'yaw', 'accelX', 'accel_x', 'gyroX', 'gyro_x']));

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
    if (hasAny(arduino, ['wp_index'])) setCurrentTargetIdx(numberFrom(arduino, ['wp_index'], currentTargetIdx));
    const waypointCount = numberFrom(arduino, ['wp_count'], 0);
    if (boolFrom(arduino, ['nav_active', 'wp_active'], false)) {
      setPathExecStatus('running');
    } else if (waypointCount > 0 && pathExecStatus === 'running') {
      setPathExecStatus('idle');
    }
    if (activeSessionRef.current && now - lastTelemetryReportAtRef.current >= 1000) {
      lastTelemetryReportAtRef.current = now;
      appendReportEvent({
        kind: 'telemetry',
        source: 'robot',
        label: 'Telemetry snapshot',
        details: `WP ${numberFrom(arduino, ['wp_index'], currentTargetIdx) + 1}/${waypointCount || '-'}; target ${numberFrom(arduino, ['target_distance_m'], 0).toFixed(2)}m; heading error ${numberFrom(arduino, ['heading_error'], 0).toFixed(2)} deg`,
        timestamp: now,
      });
    }
  }, [appendReportEvent, battery, compassOffset, currentTargetIdx, hostname, painting.active, painting.dashLength, painting.gapLength, painting.mode, pathExecStatus, segmentDistance, sendCommand, totalDistance]);

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
      socket.send(JSON.stringify({ type: 'compass_offset', degrees: compassOffset }));
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
      if (payload.ack?.message && payload.ack.message !== lastAckMessageRef.current) {
        lastAckMessageRef.current = payload.ack.message;
        if (/^(WP_|NAV_|GOTO)/.test(payload.ack.message)) {
          appendReportEvent({
            kind: 'command',
            source: 'robot',
            label: payload.ack.message.split('|')[0].replace(/_/g, ' '),
            details: payload.ack.message,
            timestamp: typeof payload.timestamp_ms === 'number' ? payload.timestamp_ms : Date.now(),
          });
        }
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
  }, [appendReportEvent, compassOffset, connectionIp, connectionStatus, disconnect, handleArduinoPayload]);

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

  const clearWaypoints = useCallback(() => {
    setWaypoints([]);
  }, []);

  const moveWaypoint = useCallback((id: string, direction: 'up' | 'down') => {
    setWaypoints((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((wp) => wp.id === id);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) return prev;
      [sorted[index], sorted[targetIndex]] = [sorted[targetIndex], sorted[index]];
      return sorted.map((wp, order) => ({ ...wp, order }));
    });
  }, []);

  const updateWaypointHeading = useCallback((id: string, heading: number | null) => {
    setWaypoints((prev) => prev.map((wp) => (
      wp.id === id ? { ...wp, headingOverride: heading === null ? null : ((heading % 360) + 360) % 360 } : wp
    )));
  }, []);

  const importWaypoints = useCallback((wps: Waypoint[]) => {
    setWaypoints(wps.map((wp, order) => ({
      ...wp,
      headingOverride: typeof wp.headingOverride === 'number' ? ((wp.headingOverride % 360) + 360) % 360 : null,
      order,
      id: wp.id || `wp-${Date.now()}-${order}`,
    })));
  }, []);

  const startPath = useCallback((route?: { points: RoutePoint[]; source: 'tomtom' | 'direct'; maxSpeed: number }) => {
    const routePoints = route?.points ?? waypoints.map(({ lat, lng }) => ({ lat, lng }));
    if (routePoints.length === 0) return;
    if (!gps.fix) {
      setPathExecStatus('idle');
      appendReportEvent({ kind: 'command', source: 'robot', label: 'Waypoint start blocked', details: 'GPS fix is required before waypoint following can start' });
      setBridgeStats((prev) => ({
        ...(prev ?? {}),
        autonomous_note: 'GPS fix required before waypoint following can start',
      }));
      return;
    }
    const cappedMaxSpeed = capSpeed(route?.maxSpeed ?? autonomousMaxSpeed);
    setCurrentTargetIdx(0);
    queueWaypointCommands([
      { command: 'speed', payload: { speed: normalizedSpeedToPwm(cappedMaxSpeed) } },
      { command: 'auto_turn_speed', payload: { speed: normalizedSpeedToPwm(autoTurnSpeed) } },
      { command: 'speed_cap', payload: { speed: normalizedSpeedToPwm(robotSpeedCap) } },
      { command: 'wp_clear' },
      ...routePoints.map((point, order) => ({ command: 'wp_add', payload: { order, lat: point.lat, lng: point.lng } })),
      { command: 'wp_start' },
    ]);
    appendReportEvent({ kind: 'command', source: 'robot', label: 'Started waypoint path', details: `${routePoints.length} route points at max ${cappedMaxSpeed}m/s` });
  }, [appendReportEvent, autoTurnSpeed, autonomousMaxSpeed, capSpeed, gps.fix, queueWaypointCommands, robotSpeedCap, waypoints]);

  const pausePath = useCallback(() => {
    clearQueuedWaypointCommands();
    setPathExecStatus('paused');
    sendCommand('wp_stop');
  }, [clearQueuedWaypointCommands, sendCommand]);

  const stopPath = useCallback(() => {
    clearQueuedWaypointCommands();
    setPathExecStatus('idle');
    setCurrentTargetIdx(0);
    sendCommand('wp_stop');
  }, [clearQueuedWaypointCommands, sendCommand]);

  const resetPath = useCallback(() => {
    clearQueuedWaypointCommands();
    setPathExecStatus('idle');
    setCurrentTargetIdx(0);
    sendCommand('wp_stop');
  }, [clearQueuedWaypointCommands, sendCommand]);

  const setScriptedMove = useCallback((move: Partial<ScriptedMove>) => {
    setScriptedMoveState((prev) => ({ ...prev, ...move, speed: move.speed === undefined ? prev.speed : capSpeed(move.speed) }));
  }, [capSpeed]);

  const addScriptedMove = useCallback(() => {
    setScriptedMoves((prev) => [
      ...prev,
      { ...scriptedMoveState, speed: capSpeed(scriptedMoveState.speed || semiSpeed), id: `step-${Date.now()}-${prev.length}` },
    ]);
  }, [capSpeed, scriptedMoveState, semiSpeed]);

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
    if (scriptedTimerRef.current) window.clearTimeout(scriptedTimerRef.current);
    setPathExecStatus('running');
    setScriptedStepIdx(0);
    runScriptedStep(steps.map((step) => ({ ...step, speed: capSpeed(step.speed) })), 0, sendCommand, setScriptedStepIdx, setPathExecStatus, scriptedTimerRef);
    appendReportEvent({ kind: 'command', source: 'robot', label: 'Started scripted path', details: `${steps.length} movement step${steps.length === 1 ? '' : 's'}` });
  }, [appendReportEvent, capSpeed, scriptedMoveState, scriptedMoves, sendCommand]);

  const pauseScriptedMove = useCallback(() => {
    if (scriptedTimerRef.current) window.clearTimeout(scriptedTimerRef.current);
    setPathExecStatus('paused');
    sendCommand('stop');
  }, [sendCommand]);

  const resetScriptedMove = useCallback(() => {
    if (scriptedTimerRef.current) window.clearTimeout(scriptedTimerRef.current);
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

  const addDetection = useCallback((type: 'pothole' | 'crack', confidence: number, source: Detection['source'] = 'model', pixelBox?: { x: number; y: number; width: number; height: number; frameWidth?: number; frameHeight?: number }) => {
    const snapshot = latestRef.current;
    const estimatedGps = type === 'pothole'
      ? estimateDetectionGps(snapshot.gps, cameraCalibration, pixelBox)
      : null;
    const detection: Detection = {
      id: `det-${Date.now()}`,
      type,
      lat: estimatedGps?.lat ?? snapshot.gps.lat,
      lng: estimatedGps?.lng ?? snapshot.gps.lng,
      confidence,
      timestamp: Date.now(),
      source,
      count: 1,
      lastSeenAt: Date.now(),
      mapped: Boolean(estimatedGps),
    };
    setDetections((prev) => {
      if (type === 'pothole' && estimatedGps) {
        const duplicateIndex = prev.findIndex((item) => item.type === 'pothole' && distanceMeters(item.lat, item.lng, detection.lat, detection.lng) < POTHOME_DUPLICATE_DISTANCE_M);
        if (duplicateIndex >= 0) {
          return prev.map((item, index) => index === duplicateIndex ? {
            ...item,
            confidence: Math.max(item.confidence, confidence),
            count: (item.count ?? 1) + 1,
            lastSeenAt: detection.timestamp,
            timestamp: detection.timestamp,
          } : item);
        }
      }
      return [detection, ...prev].slice(0, 500);
    });
    appendReportEvent({
      kind: 'detection',
      source: source === 'test' ? 'test' : 'robot',
      label: type,
      confidence,
      details: estimatedGps ? `Detected ${type} mapped from camera pixels` : `Detected ${type}${type === 'pothole' ? ' without valid GPS pixel map' : ''}`,
    });
  }, [appendReportEvent, cameraCalibration]);

  const recordManualReading = useCallback((label = 'Manual reading') => {
    appendReportEvent({ kind: 'manual-reading', source: 'manual', label, details: 'Manual sensor snapshot recorded' });
  }, [appendReportEvent]);

  const startSession = useCallback(() => {
    if (activeSessionRef.current) return;
    const session: ReportSession = { id: `session-${Date.now()}`, startedAt: Date.now(), mode };
    setActiveSession(session);
    setReportSessions((prev) => [session, ...prev].slice(0, 100));
    appendReportEvent({ kind: 'session', source: 'robot', label: 'Session started', details: `Started ${mode} session`, sessionId: session.id });
  }, [appendReportEvent, mode]);

  const stopSession = useCallback(() => {
    const session = activeSessionRef.current;
    if (!session) return;
    const endedAt = Date.now();
    setActiveSession(null);
    setReportSessions((prev) => prev.map((item) => item.id === session.id ? { ...item, endedAt } : item));
    appendReportEvent({ kind: 'session', source: 'robot', label: 'Session stopped', details: `Stopped session after ${Math.round((endedAt - session.startedAt) / 1000)}s`, sessionId: session.id });
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

  const sendMotorTrim = useCallback((left: number, right: number) => {
    sendCommand('motor_trim', { left, right });
    appendReportEvent({ kind: 'command', source: 'robot', label: 'Motor trim applied', details: `left=${left}, right=${right}` });
  }, [appendReportEvent, sendCommand]);

  const sendEncoderPid = useCallback((pid: PIDSet) => {
    setPidLinear(pid);
    sendCommand('encoder_pid', pid);
    appendReportEvent({ kind: 'command', source: 'robot', label: 'Encoder PID applied', details: `kp=${pid.kp}, ki=${pid.ki}, kd=${pid.kd}` });
  }, [appendReportEvent, sendCommand]);

  const stopWaypointQueue = useCallback(() => {
    setPathExecStatus('idle');
    setCurrentTargetIdx(0);
    sendCommand('wp_stop');
  }, [sendCommand]);

  const pidHistory = useMemo(() => encoders.errorHistory.map((actual, time) => ({ time, setpoint: 0, actual })), [encoders.errorHistory]);

  return (
    <RobotContext.Provider value={{
      connectionStatus, connectionIp, setConnectionIp, connect, disconnect,
      hostname, uptime, battery, latency, bridgeStats, arduinoTelemetry, cameraFrame, cameraLive, testingMode, setTestingMode, modelStatus,
      selectedModelPath: selectedModelPathState, setSelectedModelPath, setModelStatus,
      tomTomApiKey: tomTomApiKeyState, setTomTomApiKey,
      imu, gps, encoders, imuLive, gpsLive, encodersLive,
      mode, setMode, motionPaintMode, setMotionPaintMode, gpsFix: gps.fix, totalDistance, segmentDistance,
      potholeCount: detections.filter((d) => d.type === 'pothole').length,
      crackCount: detections.filter((d) => d.type === 'crack').length,
      detections, addDetection,
      waypoints, addWaypoint, updateWaypoint, deleteWaypoint, clearWaypoints, moveWaypoint, updateWaypointHeading, importWaypoints,
      pathExecStatus, startPath, pausePath, stopPath, resetPath, currentTargetIdx, scriptedStepIdx,
      scriptedMove: scriptedMoveState, setScriptedMove,
      scriptedMoves, addScriptedMove, removeScriptedMove, moveScriptedMove,
      startScriptedMove, pauseScriptedMove, resetScriptedMove,
      manualSpeed, setManualSpeed, semiSpeed, setSemiSpeed, autonomousMaxSpeed, setAutonomousMaxSpeed,
      robotSpeedCap, setRobotSpeedCap, autoTurnSpeed, setAutoTurnSpeed,
      cameraCalibration, setCameraCalibration, compassOffset, setCompassOffset,
      alignRobotFrontToHeading, setAlignRobotFrontToHeading: setAlignRobotFrontToHeadingState,
      imageProcessing, setImageProcessing,
      painting, setPainting,
      pidLinear, setPidLinear, pidAngular, setPidAngular, pidHistory,
      sendMotorTrim, sendEncoderPid, stopWaypointQueue,
      joystickOutput, setJoystickOutput: sendVelocity, sendVelocity, sendCommand,
      startSession, stopSession, activeSession, reportSessions,
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

function velocityToPwm(linear: number, angular: number, cap: number): number {
  return normalizedSpeedToPwm(clampSpeed(Math.max(Math.abs(linear), Math.abs(angular)), cap));
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

function clampSpeed(value: number, cap: number): number {
  if (!Number.isFinite(value)) return DEFAULT_ROBOT_SPEED_CAP;
  return Math.max(0, Math.min(Math.max(0.05, cap), value));
}

function normalizeDegrees(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return ((value % 360) + 360) % 360;
}

function normalizeSignedDegrees(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return ((((value % 360) + 540) % 360) - 180);
}

function isValidGpsCoordinate(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function sanitizeCameraCalibration(value: CameraCalibration): CameraCalibration {
  return {
    heightCm: Math.max(1, value.heightCm),
    tiltDeg: Math.max(0, Math.min(89, value.tiltDeg)),
    horizontalFovDeg: Math.max(10, Math.min(160, value.horizontalFovDeg)),
    verticalFovDeg: Math.max(10, Math.min(120, value.verticalFovDeg)),
    streamWidth: Math.max(1, Math.round(value.streamWidth)),
    streamHeight: Math.max(1, Math.round(value.streamHeight)),
    forwardOffsetCm: Math.max(-200, Math.min(200, value.forwardOffsetCm)),
  };
}

function sanitizeImageProcessing(value: ImageProcessingSettings): ImageProcessingSettings {
  return {
    enabled: Boolean(value.enabled),
    brightness: Math.max(-100, Math.min(100, value.brightness)),
    contrast: Math.max(0.2, Math.min(3, value.contrast)),
    gamma: Math.max(0.2, Math.min(3, value.gamma)),
    autoNormalize: Boolean(value.autoNormalize),
    showProcessed: Boolean(value.showProcessed),
  };
}

function readStoredPreferences(): StoredPreferences {
  try {
    return JSON.parse(localStorage.getItem(PREF_STORAGE_KEY) ?? '{}') as StoredPreferences;
  } catch {
    return {};
  }
}

function readJsonArray<T>(key: string): T[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function inferMotorMotion(telemetry: Record<string, unknown> | null, encoders: EncoderData): string {
  if (boolFrom(telemetry ?? {}, ['drive_moving', 'moving'], false)) return 'moving';
  if (Math.abs(encoders.linearVelocity) > 0.01) return 'moving';
  return 'stopped';
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radius = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function offsetGps(lat: number, lng: number, northM: number, eastM: number) {
  const radius = 6378137;
  const nextLat = lat + (northM / radius) * (180 / Math.PI);
  const nextLng = lng + (eastM / (radius * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);
  return { lat: nextLat, lng: nextLng };
}

function estimateDetectionGps(gps: GPSData, calibration: CameraCalibration, pixelBox?: { x: number; y: number; width: number; height: number; frameWidth?: number; frameHeight?: number }) {
  if (!gps.fix || !pixelBox) return null;
  const frameWidth = pixelBox.frameWidth || calibration.streamWidth;
  const frameHeight = pixelBox.frameHeight || calibration.streamHeight;
  const centerX = pixelBox.x + pixelBox.width / 2;
  const centerY = pixelBox.y + pixelBox.height / 2;
  const xNorm = (centerX - frameWidth / 2) / frameWidth;
  const yNorm = (centerY - frameHeight / 2) / frameHeight;
  const sideAngle = xNorm * calibration.horizontalFovDeg;
  const groundAngle = Math.max(1, calibration.tiltDeg + yNorm * calibration.verticalFovDeg);
  const forwardM = Math.max(0, (calibration.heightCm / 100) / Math.tan((groundAngle * Math.PI) / 180)) + calibration.forwardOffsetCm / 100;
  const lateralM = Math.tan((sideAngle * Math.PI) / 180) * forwardM;
  const heading = (gps.heading * Math.PI) / 180;
  const northM = Math.cos(heading) * forwardM - Math.sin(heading) * lateralM;
  const eastM = Math.sin(heading) * forwardM + Math.cos(heading) * lateralM;
  return offsetGps(gps.lat, gps.lng, northM, eastM);
}

function runScriptedStep(
  steps: ScriptedMoveStep[],
  index: number,
  sendCommand: (command: string, payload?: Record<string, unknown>) => void,
  setScriptedStepIdx: (index: number) => void,
  setPathExecStatus: (status: PathExecStatus) => void,
  timerRef: React.MutableRefObject<number | null>,
) {
  if (index >= steps.length) {
    sendCommand('stop');
    setPathExecStatus('idle');
    return;
  }
  const step = steps[index];
  const speed = normalizedSpeedToPwm(step.speed);
  setScriptedStepIdx(index);
  sendCommand('stop');
  timerRef.current = window.setTimeout(() => {
    if (step.direction === 'left' || step.direction === 'right') sendCommand('turn_speed', { speed });
    else sendCommand('speed', { speed });
    sendCommand('movement', { action: step.direction, speed });
    const durationMs = stepDurationMs(step);
    timerRef.current = window.setTimeout(() => runScriptedStep(steps, index + 1, sendCommand, setScriptedStepIdx, setPathExecStatus, timerRef), durationMs);
  }, 250);
}

function stepDurationMs(step: ScriptedMove): number {
  if (step.direction === 'left' || step.direction === 'right' || step.movementType === 'turn') return 3500;
  const speed = Math.max(0.05, step.speed);
  return Math.max(750, Math.min(30000, (step.distance / speed) * 1000));
}

export const useRobot = () => useContext(RobotContext);
