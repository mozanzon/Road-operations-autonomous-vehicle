import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, Bot, Camera, CircleDot, ClipboardList, Gauge, MapPinned, Maximize2,
  Navigation, Paintbrush, Pause, Play, Plus, RadioTower, RotateCcw, Route, Save, SlidersHorizontal,
  Square, TestTube2, Trash2, Video, VideoOff, X,
} from 'lucide-react';
import { Detection, drawDetectionOverlay } from '../../lib/yolo';
import { useRobot, RobotMode } from '../../context/RobotContext';
import { useTheme } from '../../context/ThemeContext';
import { DPad } from '../DPad';

delete (L.Icon.Default.prototype as any)._getIconUrl;

type WorkerResponse =
  | { type: 'model-ready'; modelInfo: unknown }
  | { type: 'detections'; requestId: number; detections: Detection[] }
  | { type: 'error'; message: string };

const STREAM_INFERENCE_INTERVAL_MS = 180;
const EGYPT_CENTER: [number, number] = [30.0444, 31.2357];
const SOURCE_CAPTURE_WIDTH = 640;
const MAX_MAP_ZOOM = 22;
const MAX_NATIVE_TILE_ZOOM = 19;

type HeadingSegment = {
  waypointId: string;
  label: string;
  bearing: number;
  heading: number;
  isOverride: boolean;
  difference: number;
};

function toDegrees(rad: number) {
  return (rad * 180) / Math.PI;
}

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function normalizeHeading(deg: number) {
  return ((deg % 360) + 360) % 360;
}

function signedHeadingDifference(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function bearingBetween([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaLng = toRadians(lng2 - lng1);
  const y = Math.sin(deltaLng) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLng);
  return normalizeHeading(toDegrees(Math.atan2(y, x)));
}

function buildHeadingSegments(robotPosition: [number, number], robotHeading: number, sortedWaypoints: { id: string; lat: number; lng: number; headingOverride?: number | null }[]) {
  const pathPositions = sortedWaypoints.map((wp) => [wp.lat, wp.lng] as [number, number]);
  const routePoints = [robotPosition, ...pathPositions];
  const bearings = routePoints.slice(1).map((point, index) => bearingBetween(routePoints[index], point));
  const headings = bearings.map((bearing, index) => sortedWaypoints[index].headingOverride ?? bearing);
  return headings.map((heading, index): HeadingSegment => {
    const previousHeading = index === 0 ? robotHeading : headings[index - 1];
    return {
      waypointId: sortedWaypoints[index].id,
      label: index === 0 ? 'Robot -> WP 1' : `WP ${index} -> WP ${index + 1}`,
      bearing: bearings[index],
      heading,
      isOverride: typeof sortedWaypoints[index].headingOverride === 'number',
      difference: signedHeadingDifference(previousHeading, heading),
    };
  });
}

function useCards() {
  const { isDark } = useTheme();
  return {
    card: isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm',
    panel: isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-100 border-slate-200',
    title: isDark ? 'text-slate-100' : 'text-slate-800',
    label: isDark ? 'text-slate-400' : 'text-slate-500',
    value: isDark ? 'text-slate-100' : 'text-slate-900',
    input: isDark ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900',
    button: isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700',
    isDark,
  };
}

export function ControlTab() {
  const robot = useRobot();
  const th = useCards();
  const [inputMode, setInputMode] = useState<'toggle' | 'hold'>('toggle');
  const [cameraExpanded, setCameraExpanded] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [confidence, setConfidence] = useState(0.35);
  const [iou, setIou] = useState(0.45);
  const [processingLive, setProcessingLive] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelMessage, setModelMessage] = useState('No ONNX model loaded');
  const [routingStatus, setRoutingStatus] = useState('Straight waypoint line');
  const [routePositions, setRoutePositions] = useState<[number, number][]>([]);
  const [motorTrimLeft, setMotorTrimLeft] = useState(0);
  const [motorTrimRight, setMotorTrimRight] = useState(0);
  const [encoderPidOpen, setEncoderPidOpen] = useState(true);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalImageRef = useRef<HTMLImageElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const latestFrameUrlRef = useRef('');
  const requestRef = useRef(0);
  const processingRef = useRef(false);
  const loopRef = useRef<number>();
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const isConnected = robot.connectionStatus === 'connected';
  const sortedWaypoints = useMemo(() => [...robot.waypoints].sort((a, b) => a.order - b.order), [robot.waypoints]);
  const pathPositions = useMemo(() => sortedWaypoints.map((wp) => [wp.lat, wp.lng] as [number, number]), [sortedWaypoints]);

  const clearDetectionCanvases = useCallback(() => {
    clearCanvas(canvasRef.current);
    clearCanvas(modalCanvasRef.current);
  }, []);

  const stopProcessing = useCallback(() => {
    setProcessingLive(false);
    processingRef.current = false;
    requestRef.current += 1;
    if (loopRef.current) window.clearTimeout(loopRef.current);
  }, []);

  const captureTestingFrame = useCallback(() => {
    const source = cameraExpanded ? modalVideoRef.current : videoRef.current;
    if (!source || source.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !source.videoWidth || !source.videoHeight) return '';
    const canvas = captureCanvasRef.current ?? document.createElement('canvas');
    captureCanvasRef.current = canvas;
    const scale = SOURCE_CAPTURE_WIDTH / source.videoWidth;
    canvas.width = SOURCE_CAPTURE_WIDTH;
    canvas.height = Math.max(1, Math.round(source.videoHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    drawProcessedFrame(ctx, source, canvas.width, canvas.height, robot.imageProcessing);
    return canvas.toDataURL('image/jpeg', 0.82);
  }, [cameraExpanded, robot.imageProcessing]);

  const currentSourceElement = useCallback((): CanvasImageSource | null => {
    if (robot.testingMode) return cameraExpanded ? modalVideoRef.current : videoRef.current;
    return cameraExpanded ? modalImageRef.current : imageRef.current;
  }, [cameraExpanded, robot.testingMode]);

  useEffect(() => {
    const worker = new Worker(new URL('../../yolo.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.type === 'model-ready') {
        setModelLoaded(true);
        robot.setModelStatus('ready');
        setModelMessage('Model ready');
        return;
      }
      if (message.type === 'detections') {
        if (message.requestId === requestRef.current) {
          const targetCanvas = cameraExpanded ? modalCanvasRef.current : canvasRef.current;
          const targetSource = currentSourceElement();
          if (targetCanvas && targetSource) drawDetectionOverlay(targetCanvas, targetSource, message.detections);
          message.detections.forEach((det) => {
            if (det.classId === 0 || det.classId === 1) {
              robot.addDetection(det.classId === 0 ? 'pothole' : 'crack', det.score, robot.testingMode ? 'test' : 'model', {
                ...det.box,
                frameWidth: robot.cameraCalibration.streamWidth,
                frameHeight: robot.cameraCalibration.streamHeight,
              });
            }
          });
        }
        processingRef.current = false;
        return;
      }
      processingRef.current = false;
      setModelLoaded(false);
      robot.setModelStatus('error');
      setModelMessage(message.message);
      stopProcessing();
    };
    return () => {
      worker.terminate();
      if (loopRef.current) window.clearTimeout(loopRef.current);
    };
  }, [cameraExpanded, currentSourceElement, robot.addDetection, robot.testingMode, stopProcessing]);

  useEffect(() => {
    if (robot.testingMode || !robot.cameraFrame) return;
    latestFrameUrlRef.current = robot.cameraFrame;
    if (imageRef.current) imageRef.current.src = robot.cameraFrame;
    if (modalImageRef.current) modalImageRef.current.src = robot.cameraFrame;
  }, [robot.cameraFrame, robot.testingMode]);

  useEffect(() => {
    if (!robot.testingMode) {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      if (modalVideoRef.current) modalVideoRef.current.srcObject = null;
      return;
    }

    let cancelled = false;
    stopProcessing();
    latestFrameUrlRef.current = '';
    clearDetectionCanvases();
    setModelMessage((current) => current === 'No ONNX model loaded' ? 'Testing mode uses laptop camera' : current);

    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        cameraStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        if (modalVideoRef.current) modalVideoRef.current.srcObject = stream;
        if (modelLoaded) {
          setModelMessage('Testing mode model detection running...');
          setProcessingLive(true);
          robot.setModelStatus('running');
        }
      })
      .catch((error) => {
        robot.setTestingMode(false);
        setModelMessage(error instanceof Error ? error.message : 'Could not start laptop camera');
      });

    return () => {
      cancelled = true;
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    };
  }, [clearDetectionCanvases, modelLoaded, robot.setModelStatus, robot.setTestingMode, robot.testingMode, stopProcessing]);

  useEffect(() => {
    if (robot.testingMode && modalVideoRef.current && cameraStreamRef.current) {
      modalVideoRef.current.srcObject = cameraStreamRef.current;
    }
    if (!robot.testingMode && modalImageRef.current && latestFrameUrlRef.current) {
      modalImageRef.current.src = latestFrameUrlRef.current;
    }
  }, [cameraExpanded, robot.testingMode]);

  useEffect(() => {
    let frameId = 0;
    const settings = robot.imageProcessing;
    const visible = settings.enabled && settings.showProcessed;

    const draw = () => {
      if (!visible) {
        clearCanvas(previewCanvasRef.current);
        clearCanvas(modalPreviewCanvasRef.current);
        return;
      }
      paintProcessedPreview(robot.testingMode ? videoRef.current : imageRef.current, previewCanvasRef.current, settings);
      if (cameraExpanded) {
        paintProcessedPreview(robot.testingMode ? modalVideoRef.current : modalImageRef.current, modalPreviewCanvasRef.current, settings);
      } else {
        clearCanvas(modalPreviewCanvasRef.current);
      }
      frameId = window.requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [cameraExpanded, robot.cameraFrame, robot.imageProcessing, robot.testingMode]);

  useEffect(() => {
    const hasSource = robot.testingMode || Boolean(latestFrameUrlRef.current || robot.cameraFrame);
    if (!processingLive || !hasSource) return;
    robot.setModelStatus('running');
    const tick = () => {
      const targetSource = currentSourceElement();
      const frameUrl = targetSource
        ? (robot.testingMode ? captureTestingFrame() : captureProcessedFrame(targetSource, robot.imageProcessing, processedCanvasRef))
        : '';
      if (!frameUrl || !targetSource || processingRef.current || !workerRef.current) {
        loopRef.current = window.setTimeout(tick, STREAM_INFERENCE_INTERVAL_MS);
        return;
      }
      processingRef.current = true;
      requestRef.current += 1;
      workerRef.current.postMessage({
        type: 'detect',
        requestId: requestRef.current,
        frameUrl,
        confidenceThreshold: confidence,
        iouThreshold: iou,
      });
      loopRef.current = window.setTimeout(tick, STREAM_INFERENCE_INTERVAL_MS);
    };
    tick();
    return () => {
      if (loopRef.current) window.clearTimeout(loopRef.current);
      robot.setModelStatus(modelLoaded ? 'ready' : 'idle');
    };
  }, [captureTestingFrame, confidence, currentSourceElement, iou, modelLoaded, processingLive, robot.cameraFrame, robot.imageProcessing, robot.setModelStatus, robot.testingMode]);

  useEffect(() => {
    if (!robot.tomTomApiKey || pathPositions.length < 2) {
      setRoutePositions([]);
      setRoutingStatus('Straight waypoint line');
      return;
    }
    const controller = new AbortController();
    const origin = pathPositions[0];
    const destination = pathPositions[pathPositions.length - 1];
    const via = pathPositions.slice(1, -1).map(([lat, lng]) => `${lat},${lng}`).join(':');
    const locations = `${origin[0]},${origin[1]}:${via ? `${via}:` : ''}${destination[0]},${destination[1]}`;
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json?key=${encodeURIComponent(robot.tomTomApiKey)}&routeType=fastest&traffic=false`;
    setRoutingStatus('Loading TomTom route...');
    fetch(url, { signal: controller.signal })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error(`TomTom ${res.status}`)))
      .then((data) => {
        const points = data?.routes?.[0]?.legs?.flatMap((leg: any) => leg.points?.map((point: any) => [point.latitude, point.longitude])) ?? [];
        setRoutePositions(points);
        setRoutingStatus(points.length ? 'TomTom route active' : 'Straight waypoint line');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRoutePositions([]);
          setRoutingStatus('TomTom unavailable, using straight line');
        }
      });
    return () => controller.abort();
  }, [pathPositions, robot.tomTomApiKey]);

  const handleModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    robot.setSelectedModelPath(file.name);
    robot.setModelStatus('loading');
    setModelLoaded(false);
    setModelMessage(`Loading ${file.name}...`);
    workerRef.current?.postMessage({ type: 'load-model', modelFile: file });
  };

  const toggleTestingMode = () => {
    const nextTestingMode = !robot.testingMode;
    robot.setTestingMode(nextTestingMode);
    if (!nextTestingMode) {
      stopProcessing();
      return;
    }
    if (!modelLoaded) {
      setModelMessage('Testing mode needs an ONNX model before model detection can run.');
      return;
    }
    setModelMessage('Testing mode model detection running...');
    setProcessingLive(true);
    robot.setModelStatus('running');
  };

  const startModelTest = () => {
    if (!modelLoaded) {
      setModelMessage('Load an ONNX model first, then run the test with model detection.');
      return;
    }
    if (!robot.testingMode) {
      robot.setTestingMode(true);
    }
    setModelMessage('Testing mode model detection running...');
    setProcessingLive(true);
    robot.setModelStatus('running');
  };

  const closeExpandedCamera = () => {
    setCameraExpanded(false);
    stopProcessing();
    clearCanvas(modalCanvasRef.current);
  };

  const modeButton = (value: RobotMode, label: string, Icon: React.ComponentType<any>) => (
    <button
      type="button"
      onClick={() => robot.setMode(value)}
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-mono font-semibold transition-colors ${
        robot.mode === value ? 'bg-amber-500 border-amber-400 text-slate-950' : th.button
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  const paintMode = robot.painting.active ? robot.painting.mode : 'off';
  const setPaintMode = (value: string) => {
    if (value === 'off') {
      robot.setMotionPaintMode('move-only');
      robot.setPainting({ active: false, status: 'idle' });
      return;
    }

    const mode = value as 'solid' | 'dashed';
    robot.setMotionPaintMode('paint');
    robot.setPainting({ active: true, mode, status: 'active' });
  };

  const toggleEncoderPid = () => {
    setEncoderPidOpen((open) => {
      const nextOpen = !open;
      if (!nextOpen) robot.sendEncoderPid({ kp: 1, ki: 0, kd: 0 });
      return nextOpen;
    });
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col gap-4 overflow-hidden">
      <SensorStrap th={th} />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[minmax(360px,0.95fr)_minmax(460px,1.05fr)]">
      <section className="min-h-0 space-y-4 overflow-y-auto pr-1">
        <Card title="Operation Mode" icon={<Bot className="h-4 w-4 text-amber-400" />} th={th}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {modeButton('manual', 'Manual', Gauge)}
            {modeButton('semi', 'Semi', Route)}
            {modeButton('fully', 'Fully', Navigation)}
          </div>
        </Card>

        {robot.mode === 'manual' && <Card title="Manual Movement" icon={<CircleDot className="h-4 w-4 text-blue-400" />} th={th}>
          <NumberInput label={`Manual Speed (m/s, cap ${robot.robotSpeedCap.toFixed(2)})`} value={robot.manualSpeed} min={0.05} step={0.05} onChange={robot.setManualSpeed} th={th} />
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className={`flex overflow-hidden rounded-lg border ${th.isDark ? 'border-slate-600' : 'border-slate-300'}`}>
              <button onClick={() => setInputMode('toggle')} className={`px-3 py-1.5 text-xs font-mono ${inputMode === 'toggle' ? 'bg-blue-500 text-white' : th.button}`}>TOGGLE DEFAULT</button>
              <button onClick={() => setInputMode('hold')} className={`px-3 py-1.5 text-xs font-mono ${inputMode === 'hold' ? 'bg-blue-500 text-white' : th.button}`}>HOLD</button>
            </div>
            <button type="button" onClick={() => robot.sendVelocity(0, 0)} className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-mono text-red-400">STOP</button>
          </div>
          <div className="flex justify-center">
            <DPad onChange={robot.sendVelocity} speedLimit={robot.manualSpeed} toggleMode={inputMode === 'toggle'} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Metric label="Cmd Vel" value={`${robot.joystickOutput.linear.toFixed(2)} m/s`} th={th} />
            <Metric label="Cmd Ang" value={`${robot.joystickOutput.angular.toFixed(2)} r/s`} th={th} />
          </div>
        </Card>}

        {robot.mode === 'semi' && <Card title="Manual Scripted Path" icon={<ClipboardList className="h-4 w-4 text-amber-400" />} th={th}>
          <NumberInput label={`Semi Default Speed (m/s, cap ${robot.robotSpeedCap.toFixed(2)})`} value={robot.semiSpeed} min={0.05} step={0.05} onChange={(value) => { robot.setSemiSpeed(value); robot.setScriptedMove({ speed: value }); }} th={th} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Direction" value={robot.scriptedMove.direction} onChange={(value) => robot.setScriptedMove({ direction: value as any })} options={['forward', 'backward', 'left', 'right']} th={th} />
            <Select label="Movement" value={robot.scriptedMove.movementType} onChange={(value) => robot.setScriptedMove({ movementType: value as any })} options={['straight', 'turn', 'arc']} th={th} />
            <NumberInput label="Distance (m)" value={robot.scriptedMove.distance} min={0.1} step={0.1} onChange={(value) => robot.setScriptedMove({ distance: value })} th={th} />
            <NumberInput label="Speed (m/s)" value={robot.scriptedMove.speed} min={0.05} step={0.05} onChange={(value) => robot.setScriptedMove({ speed: value })} th={th} />
          </div>
          <button type="button" onClick={robot.addScriptedMove} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-mono ${th.button}`}>
            <Plus className="h-4 w-4" /> Add movement step
          </button>
          <ScriptedMoveList th={th} />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <ActionButton label="Start" icon={<Play className="h-4 w-4" />} onClick={robot.startScriptedMove} color="green" disabled={!isConnected} />
            <ActionButton label="Pause" icon={<Pause className="h-4 w-4" />} onClick={robot.pauseScriptedMove} color="amber" disabled={robot.pathExecStatus !== 'running'} />
            <ActionButton label="Reset" icon={<RotateCcw className="h-4 w-4" />} onClick={robot.resetScriptedMove} color="red" disabled={robot.pathExecStatus === 'idle'} />
          </div>
        </Card>}

        <Card title="Drive Calibration" icon={<SlidersHorizontal className="h-4 w-4 text-cyan-400" />} th={th}>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Left Trim PWM" value={motorTrimLeft} min={-50} step={1} onChange={setMotorTrimLeft} th={th} />
            <NumberInput label="Right Trim PWM" value={motorTrimRight} min={-50} step={1} onChange={setMotorTrimRight} th={th} />
          </div>
          <button type="button" onClick={() => robot.sendMotorTrim(motorTrimLeft, motorTrimRight)} disabled={!isConnected} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-mono disabled:opacity-40 ${th.button}`}>
            Apply motor trim
          </button>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className={`text-xs font-mono uppercase ${th.label}`}>Encoder drift PID</span>
            <button type="button" onClick={toggleEncoderPid} className={`rounded-lg border px-3 py-1.5 text-xs font-mono ${th.button}`}>
              {encoderPidOpen ? 'Hide PID' : 'Show PID'}
            </button>
          </div>
          {encoderPidOpen && <div className="mt-3 grid grid-cols-3 gap-3">
            <NumberInput label="Kp" value={robot.pidLinear.kp} min={-10} step={0.1} onChange={(kp) => robot.setPidLinear({ ...robot.pidLinear, kp })} th={th} />
            <NumberInput label="Ki" value={robot.pidLinear.ki} min={-10} step={0.01} onChange={(ki) => robot.setPidLinear({ ...robot.pidLinear, ki })} th={th} />
            <NumberInput label="Kd" value={robot.pidLinear.kd} min={-10} step={0.01} onChange={(kd) => robot.setPidLinear({ ...robot.pidLinear, kd })} th={th} />
          </div>}
          {encoderPidOpen && <button type="button" onClick={() => robot.sendEncoderPid(robot.pidLinear)} disabled={!isConnected} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-mono disabled:opacity-40 ${th.button}`}>
            Apply encoder PID
          </button>}
          {!encoderPidOpen && <div className={`mt-3 rounded-lg border p-3 text-xs font-mono ${th.panel} ${th.label}`}>Hidden: Arduino is set to ENCODER PID 1 0 0.</div>}
        </Card>

        {robot.mode === 'fully' && <Card title="Waypoint Autonomous" icon={<MapPinned className="h-4 w-4 text-green-400" />} th={th}>
          <NumberInput label={`Max Speed Limit (m/s, cap ${robot.robotSpeedCap.toFixed(2)})`} value={robot.autonomousMaxSpeed} min={0.05} step={0.05} onChange={robot.setAutonomousMaxSpeed} th={th} />
          <NumberInput label="Heading Turn Speed (m/s)" value={robot.autoTurnSpeed} min={0.05} step={0.05} onChange={robot.setAutoTurnSpeed} th={th} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={robot.clearWaypoints} disabled={sortedWaypoints.length === 0} className={`rounded-lg border px-3 py-2 text-xs font-mono disabled:opacity-40 ${th.button}`}>
              Reset waypoints
            </button>
          </div>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {sortedWaypoints.length === 0 ? <p className={`text-xs font-mono ${th.label}`}>Use the map on the right to set waypoints.</p> : sortedWaypoints.map((wp, index) => (
              <div key={wp.id} className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-mono ${th.panel}`}>
                <span>WP {index + 1}</span>
                <span className="truncate">{wp.lat.toFixed(5)}, {wp.lng.toFixed(5)}{typeof wp.headingOverride === 'number' ? ` | H ${wp.headingOverride.toFixed(0)} deg` : ''}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => robot.moveWaypoint(wp.id, 'up')} disabled={index === 0} className="rounded border border-slate-600 px-2 py-1 disabled:opacity-30">Up</button>
                  <button type="button" onClick={() => robot.moveWaypoint(wp.id, 'down')} disabled={index === sortedWaypoints.length - 1} className="rounded border border-slate-600 px-2 py-1 disabled:opacity-30">Down</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <ActionButton label="Start" icon={<Play className="h-4 w-4" />} onClick={() => robot.startPath({ points: (routePositions.length ? routePositions : sortedWaypoints.map(({ lat, lng }) => [lat, lng] as [number, number])).map(([lat, lng]) => ({ lat, lng })), source: routePositions.length ? 'tomtom' : 'direct', maxSpeed: robot.autonomousMaxSpeed })} color="green" disabled={!isConnected || sortedWaypoints.length === 0 || !robot.gps.fix} />
            <ActionButton label="Pause" icon={<Pause className="h-4 w-4" />} onClick={robot.pausePath} color="amber" disabled={robot.pathExecStatus !== 'running'} />
            <ActionButton label="Resume" icon={<Play className="h-4 w-4" />} onClick={robot.resumePath} color="green" disabled={robot.pathExecStatus !== 'paused'} />
            <ActionButton label="Reset" icon={<RotateCcw className="h-4 w-4" />} onClick={robot.resetPath} color="red" disabled={robot.pathExecStatus === 'idle'} />
          </div>
          <div className={`mt-2 text-center text-xs font-mono ${th.label}`}>STATUS: {robot.pathExecStatus.toUpperCase()}</div>
          {!robot.gps.fix && <div className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-mono text-amber-200">Waiting for GPS fix before waypoint following can start.</div>}
          {robot.bridgeStats?.latest_error && <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-mono text-red-300">Arduino: {robot.bridgeStats.latest_error}</div>}
          {robot.bridgeStats?.autonomous_note && <div className="mt-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-mono text-sky-200">{robot.bridgeStats.autonomous_note}</div>}
        </Card>}

        <Card title="Road Painting" icon={<Paintbrush className="h-4 w-4 text-amber-400" />} th={th}>
          <div className={`grid gap-3 ${paintMode === 'dashed' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <Select label="Paint Mode" value={paintMode} onChange={setPaintMode} options={['off', 'solid', 'dashed']} th={th} />
            {paintMode === 'dashed' && <NumberInput label="Dash (m)" value={robot.painting.dashLength} min={0.1} step={0.1} onChange={(value) => robot.setPainting({ dashLength: value })} th={th} />}
            {paintMode === 'dashed' && <NumberInput label="Gap (m)" value={robot.painting.gapLength} min={0.1} step={0.1} onChange={(value) => robot.setPainting({ gapLength: value })} th={th} />}
          </div>
          {paintMode !== 'off' && <LinePreview mode={robot.painting.mode} color={robot.painting.color} dash={robot.painting.dashLength} gap={robot.painting.gapLength} />}
        </Card>

        <Card title="Session And Test" icon={<TestTube2 className="h-4 w-4 text-purple-400" />} th={th}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" onClick={robot.activeSession ? robot.stopSession : robot.startSession} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-mono ${robot.activeSession ? 'border-red-500/40 bg-red-500/15 text-red-300' : th.button}`}>
              <Save className="h-4 w-4" /> {robot.activeSession ? 'Stop session' : 'Start session'}
            </button>
            <button type="button" onClick={startModelTest} className="flex items-center justify-center gap-2 rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-2 text-xs font-mono text-purple-300">
              <TestTube2 className="h-4 w-4" /> Test model detection
            </button>
            <button type="button" onClick={toggleTestingMode} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-mono ${robot.testingMode ? 'border-purple-400 bg-purple-500 text-white' : th.button}`}>
              {robot.testingMode ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />} {robot.testingMode ? 'Stop model test' : 'Test with model'}
            </button>
          </div>
        </Card>
      </section>

      <section className="min-h-0 space-y-4 overflow-y-auto">
        <Card title="Camera Stream" icon={<Camera className="h-4 w-4 text-amber-400" />} th={th}>
          <CameraPanel
            imageRef={imageRef}
            videoRef={videoRef}
            previewCanvasRef={previewCanvasRef}
            canvasRef={canvasRef}
            frame={robot.cameraFrame}
            live={robot.cameraLive}
            testingMode={robot.testingMode}
            processing={processingLive}
            message={modelMessage}
            confidence={confidence}
            iou={iou}
            onConfidence={setConfidence}
            onIou={setIou}
            onModelChange={handleModelChange}
            onToggleProcessing={() => setProcessingLive((value) => !value)}
            onClear={clearDetectionCanvases}
            onExpand={() => setCameraExpanded(true)}
            imageProcessing={robot.imageProcessing}
            onImageProcessing={robot.setImageProcessing}
          />
        </Card>

        <Card title="Waypoint Map" icon={<MapPinned className="h-4 w-4 text-green-400" />} th={th}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className={`text-xs font-mono ${th.label}`}>{routingStatus}</span>
            <button type="button" onClick={() => setMapExpanded(true)} className={`rounded-lg border p-2 ${th.button}`} title="Enlarge map">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
          <WaypointMap height={300} routePositions={routePositions.length ? routePositions : pathPositions} />
        </Card>
      </section>
      </div>

      {cameraExpanded && (
        <div className="fixed inset-0 z-[2500] bg-black/85 p-4">
          <div className="mx-auto flex h-full max-w-6xl flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-slate-200">Expanded camera stream</span>
              <button type="button" onClick={closeExpandedCamera} className="rounded-lg border border-slate-600 bg-slate-900 p-2 text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-700 bg-black">
              {robot.testingMode ? (
                <video ref={modalVideoRef} autoPlay muted playsInline className={`absolute inset-0 h-full w-full object-fill ${robot.imageProcessing.enabled && robot.imageProcessing.showProcessed ? 'opacity-0' : ''}`} />
              ) : (
                <img ref={modalImageRef} alt="Expanded robot stream" className={`absolute inset-0 h-full w-full object-fill ${robot.imageProcessing.enabled && robot.imageProcessing.showProcessed ? 'opacity-0' : ''}`} />
              )}
              <canvas ref={modalPreviewCanvasRef} className={`absolute inset-0 h-full w-full ${robot.imageProcessing.enabled && robot.imageProcessing.showProcessed ? '' : 'hidden'}`} />
              <canvas ref={modalCanvasRef} className="absolute inset-0 h-full w-full" />
            </div>
          </div>
        </div>
      )}

      {mapExpanded && (
        <div className="fixed inset-0 z-[2400] bg-black/80 p-4">
          <div className={`mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-xl border ${th.card}`}>
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
              <span className={`text-sm font-mono ${th.title}`}>Waypoint map editor</span>
              <button type="button" onClick={() => setMapExpanded(false)} className={`rounded-lg border p-2 ${th.button}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <WaypointMap height="100%" routePositions={routePositions.length ? routePositions : pathPositions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, icon, children, th }: { title: string; icon: React.ReactNode; children: React.ReactNode; th: ReturnType<typeof useCards> }) {
  return (
    <section className={`rounded-xl border p-4 ${th.card}`}>
      <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest ${th.title}`}>{icon}{title}</h3>
      {children}
    </section>
  );
}

function CameraPanel({ imageRef, videoRef, previewCanvasRef, canvasRef, frame, live, testingMode, processing, message, confidence, iou, onConfidence, onIou, onModelChange, onToggleProcessing, onClear, onExpand, imageProcessing, onImageProcessing }: {
  imageRef: React.MutableRefObject<HTMLImageElement | null>;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  previewCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  frame: string;
  live: boolean;
  testingMode: boolean;
  processing: boolean;
  message: string;
  confidence: number;
  iou: number;
  onConfidence: (value: number) => void;
  onIou: (value: number) => void;
  onModelChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleProcessing: () => void;
  onClear: () => void;
  onExpand: () => void;
  imageProcessing: ReturnType<typeof useRobot>['imageProcessing'];
  onImageProcessing: ReturnType<typeof useRobot>['setImageProcessing'];
}) {
  const hasSource = testingMode || Boolean(frame);
  const processedVisible = imageProcessing.enabled && imageProcessing.showProcessed;
  return (
    <div className="space-y-3">
      <div className="relative grid h-[clamp(180px,28vh,300px)] place-items-center overflow-hidden rounded-lg border border-slate-700 bg-black">
        {testingMode ? (
          <video ref={videoRef} autoPlay muted playsInline className={`absolute inset-0 h-full w-full object-fill ${processedVisible ? 'opacity-0' : ''}`} />
        ) : (
          <img ref={imageRef} alt="Robot camera stream" className={`absolute inset-0 h-full w-full object-fill ${frame && !processedVisible ? '' : 'opacity-0'}`} />
        )}
        <canvas ref={previewCanvasRef} className={`absolute inset-0 h-full w-full ${processedVisible ? '' : 'hidden'}`} />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {!hasSource && <div className="absolute inset-0 grid place-items-center text-xs font-mono text-slate-500">Waiting for bridge camera frame</div>}
        <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[11px] font-mono text-slate-200">{testingMode ? 'TEST CAMERA' : live ? 'LIVE' : 'OFFLINE'}</div>
        <button type="button" onClick={onExpand} className="absolute right-2 top-2 rounded bg-black/70 p-1.5 text-slate-200" title="Enlarge camera">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <label className="rounded border border-slate-700 p-2">
          <span className="block text-slate-500">Confidence {confidence.toFixed(2)}</span>
          <input className="w-full accent-amber-500" type="range" min={0.05} max={0.95} step={0.05} value={confidence} onChange={(event) => onConfidence(Number(event.target.value))} />
        </label>
        <label className="rounded border border-slate-700 p-2">
          <span className="block text-slate-500">IoU {iou.toFixed(2)}</span>
          <input className="w-full accent-amber-500" type="range" min={0.1} max={0.9} step={0.05} value={iou} onChange={(event) => onIou(Number(event.target.value))} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-mono text-slate-200">
          Load ONNX
          <input type="file" accept=".onnx" className="hidden" onChange={onModelChange} />
        </label>
        <button type="button" onClick={onToggleProcessing} disabled={!hasSource} className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-xs font-mono text-amber-300 disabled:opacity-40">
          {processing ? 'Stop detection' : 'Start detection'}
        </button>
        <button type="button" onClick={onClear} className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-mono text-slate-200">
          Clear detections
        </button>
        <span className="text-xs font-mono text-slate-500">{message}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-mono lg:grid-cols-4">
        <label className="rounded border border-slate-700 p-2">
          <span className="block text-slate-500">Brightness {imageProcessing.brightness.toFixed(0)}</span>
          <input className="w-full accent-amber-500" type="range" min={-100} max={100} step={5} value={imageProcessing.brightness} onChange={(event) => onImageProcessing({ enabled: true, brightness: Number(event.target.value) })} />
        </label>
        <label className="rounded border border-slate-700 p-2">
          <span className="block text-slate-500">Contrast {imageProcessing.contrast.toFixed(2)}</span>
          <input className="w-full accent-amber-500" type="range" min={0.2} max={3} step={0.1} value={imageProcessing.contrast} onChange={(event) => onImageProcessing({ enabled: true, contrast: Number(event.target.value) })} />
        </label>
        <label className="rounded border border-slate-700 p-2">
          <span className="block text-slate-500">Gamma {imageProcessing.gamma.toFixed(2)}</span>
          <input className="w-full accent-amber-500" type="range" min={0.2} max={3} step={0.1} value={imageProcessing.gamma} onChange={(event) => onImageProcessing({ enabled: true, gamma: Number(event.target.value) })} />
        </label>
        <label className="flex items-center justify-between gap-2 rounded border border-slate-700 p-2 text-slate-400">
          <span>Auto normalize</span>
          <input type="checkbox" checked={imageProcessing.autoNormalize} onChange={(event) => onImageProcessing({ enabled: true, autoNormalize: event.target.checked })} />
        </label>
        <label className="flex items-center justify-between gap-2 rounded border border-slate-700 p-2 text-slate-400">
          <span>Show processed</span>
          <input type="checkbox" checked={imageProcessing.showProcessed} onChange={(event) => onImageProcessing({ showProcessed: event.target.checked })} />
        </label>
      </div>
    </div>
  );
}

function SensorStrap({ th }: { th: ReturnType<typeof useCards> }) {
  const { gps, imu, encoders, battery, latency, bridgeStats, arduinoTelemetry, cameraLive, gpsLive, imuLive, encodersLive, potholeCount, crackCount, testingMode } = useRobot();
  const navActive = telemetryBool(arduinoTelemetry, 'nav_active') || telemetryBool(arduinoTelemetry, 'wp_active');
  const targetDistance = telemetryNumber(arduinoTelemetry, 'target_distance_m');
  const headingError = telemetryNumber(arduinoTelemetry, 'heading_error');
  const correctionTrim = telemetryNumber(arduinoTelemetry, 'correction_trim');
  const encoderPidOutput = telemetryNumber(arduinoTelemetry, 'encoder_pid_output');
  const plotterStopped = telemetryBool(arduinoTelemetry, 'plotter_stopped_for_heading');
  const wpIndex = telemetryNumber(arduinoTelemetry, 'wp_index');
  const wpCount = telemetryNumber(arduinoTelemetry, 'wp_count');
  return (
    <section className={`rounded-xl border p-4 ${th.card}`}>
      <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest ${th.title}`}><Activity className="h-4 w-4 text-amber-400" />Sensor Strap</h3>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
        <Metric label="GPS" value={gps.fix ? 'FIX' : 'NO FIX'} th={th} error={!gpsLive || !gps.fix} />
        <Metric label="Lat" value={gps.lat.toFixed(6)} th={th} />
        <Metric label="Lng" value={gps.lng.toFixed(6)} th={th} />
        <Metric label="Accuracy" value={`${gps.accuracy.toFixed(1)} m`} th={th} />
        <Metric label="Compass" value={`${gps.heading.toFixed(1)} deg`} th={th} />
        <Metric label="IMU Yaw" value={`${imu.yaw.toFixed(1)} deg`} th={th} error={!imuLive} />
        <Metric label="Roll/Pitch" value={`${imu.roll.toFixed(1)} / ${imu.pitch.toFixed(1)}`} th={th} />
        <Metric label="Ticks L/R" value={`${encoders.leftTicks} / ${encoders.rightTicks}`} th={th} error={!encodersLive} />
        <Metric label="RPM L/R" value={`${encoders.leftRPM.toFixed(1)} / ${encoders.rightRPM.toFixed(1)}`} th={th} />
        <Metric label="Velocity" value={`${encoders.linearVelocity.toFixed(2)} m/s`} th={th} />
        <Metric label="Odom Err" value={`${encoders.odometryError.toFixed(3)} m`} th={th} />
        <Metric label="Battery" value={`${battery.toFixed(1)}%`} th={th} />
        <Metric label="Latency" value={`${latency.toFixed(0)} ms`} th={th} />
        <Metric label="Bridge FPS" value={`${(bridgeStats?.loop_fps ?? bridgeStats?.stream_fps ?? 0).toFixed(1)}`} th={th} />
        <Metric label="Camera" value={testingMode ? 'TEST' : cameraLive ? 'LIVE' : 'OFFLINE'} th={th} error={!testingMode && (!cameraLive || Boolean(bridgeStats?.camera_error))} />
        <Metric label="Nav" value={navActive ? 'ACTIVE' : 'IDLE'} th={th} />
        <Metric label="WP" value={`${wpCount ? wpIndex + 1 : 0}/${wpCount}`} th={th} />
        <Metric label="Target" value={`${targetDistance.toFixed(2)} m`} th={th} />
        <Metric label="Head Err" value={`${headingError.toFixed(1)} deg`} th={th} error={Math.abs(headingError) > 8} />
        <Metric label="Trim" value={`${correctionTrim.toFixed(0)} pwm`} th={th} />
        <Metric label="PID Out" value={`${encoderPidOutput.toFixed(0)} pwm`} th={th} />
        <Metric label="Plotter" value={plotterStopped ? 'HEADING HOLD' : 'READY'} th={th} error={plotterStopped} />
        <Metric label="Potholes" value={String(potholeCount)} th={th} />
        <Metric label="Cracks" value={String(crackCount)} th={th} />
      </div>
      {bridgeStats?.camera_error ? <div className="mt-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs font-mono text-red-300">{bridgeStats.camera_error}</div> : null}
    </section>
  );
}

function ScriptedMoveList({ th }: { th: ReturnType<typeof useCards> }) {
  const { scriptedMoves, removeScriptedMove, moveScriptedMove } = useRobot();
  if (scriptedMoves.length === 0) {
    return <div className={`mt-3 rounded-lg border p-3 text-xs font-mono ${th.panel} ${th.label}`}>No queued steps. Start will run the current movement once.</div>;
  }
  return (
    <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
      {scriptedMoves.map((step, index) => (
        <div key={step.id} className={`grid grid-cols-[2rem_1fr_auto] items-center gap-2 rounded-lg border p-2 text-xs font-mono ${th.panel}`}>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-slate-950">{index + 1}</span>
          <div className="min-w-0">
            <div className={`truncate font-semibold ${th.value}`}>{step.direction} - {step.movementType}</div>
            <div className={`truncate ${th.label}`}>{step.distance.toFixed(2)} m at {step.speed.toFixed(2)} m/s</div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => moveScriptedMove(step.id, 'up')} disabled={index === 0} className="rounded border border-slate-600 p-1 disabled:opacity-30" title="Move step up">
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => moveScriptedMove(step.id, 'down')} disabled={index === scriptedMoves.length - 1} className="rounded border border-slate-600 p-1 disabled:opacity-30" title="Move step down">
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => removeScriptedMove(step.id)} className="rounded border border-red-500/40 bg-red-500/10 p-1 text-red-300" title="Remove step">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function WaypointMap({ height, routePositions }: { height: number | string; routePositions: [number, number][] }) {
  const { gps, waypoints, addWaypoint, updateWaypoint, deleteWaypoint, clearWaypoints, moveWaypoint, updateWaypointHeading, detections, alignRobotFrontToHeading } = useRobot();
  const center: [number, number] = gps.fix ? [gps.lat, gps.lng] : EGYPT_CENTER;
  const sorted = [...waypoints].sort((a, b) => a.order - b.order);
  const pathPositions = sorted.map((wp) => [wp.lat, wp.lng] as [number, number]);
  const compassHeading = normalizeHeading(gps.heading);
  const displayHeading = alignRobotFrontToHeading ? compassHeading : gps.heading;
  const headingEnd = headingVectorEnd(center, displayHeading);
  const headingSegments = buildHeadingSegments(center, compassHeading, sorted);
  const renderedRoute = routePositions.length ? [center, ...routePositions] : [center, ...pathPositions];
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-700" style={{ height }}>
      <MapContainer center={center} zoom={gps.fix ? 17 : 7} maxZoom={MAX_MAP_ZOOM} zoomSnap={0.25} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap" maxZoom={MAX_MAP_ZOOM} maxNativeZoom={MAX_NATIVE_TILE_ZOOM} />
        <MapSync center={center} />
        <MapClick onAdd={addWaypoint} />
        <Polyline positions={[center, headingEnd]} color="#22d3ee" weight={7} opacity={0.95} />
        <Marker position={headingEnd} icon={headingArrowIcon(displayHeading)} interactive={false} />
        <Marker position={center} icon={robotIcon(displayHeading)}>
          <Popup>
            Robot: {center[0].toFixed(6)}, {center[1].toFixed(6)}
            <br />
            Compass: {compassHeading.toFixed(1)} deg
          </Popup>
        </Marker>
        {renderedRoute.length >= 2 && <Polyline positions={renderedRoute} color="#f59e0b" weight={4} opacity={0.85} dashArray="8 5" />}
        {sorted.map((wp, index) => (
          <Marker
            key={wp.id}
            position={[wp.lat, wp.lng]}
            icon={waypointIcon(index)}
            draggable
            eventHandlers={{
              dragend(event) {
                const pos = (event.target as L.Marker).getLatLng();
                updateWaypoint(wp.id, pos.lat, pos.lng);
              },
              contextmenu() { deleteWaypoint(wp.id); },
            }}
          >
            <Popup>
              Waypoint {index + 1}
              <br />
              Bearing: {headingSegments[index]?.bearing.toFixed(1) ?? '0.0'} deg
              <br />
              Heading: {headingSegments[index]?.heading.toFixed(1) ?? '0.0'} deg{headingSegments[index]?.isOverride ? ' custom' : ''}
              <br />
              Turn: {headingSegments[index]?.difference && headingSegments[index].difference > 0 ? '+' : ''}{headingSegments[index]?.difference.toFixed(1) ?? '0.0'} deg
              <br />
              <label>
                Custom heading
                <input
                  type="number"
                  min={0}
                  max={359}
                  step={1}
                  value={wp.headingOverride ?? ''}
                  placeholder={headingSegments[index]?.bearing.toFixed(0) ?? '0'}
                  onChange={(event) => updateWaypointHeading(wp.id, event.target.value === '' ? null : Number(event.target.value))}
                  style={{ display: 'block', width: '100%', marginTop: 4 }}
                />
              </label>
              <button disabled={index === 0} onClick={() => moveWaypoint(wp.id, 'up')} style={{ marginTop: 6, marginRight: 4 }}>Up</button>
              <button disabled={index === sorted.length - 1} onClick={() => moveWaypoint(wp.id, 'down')} style={{ marginTop: 6 }}>Down</button>
              <br />
              Right-click marker to delete.
            </Popup>
          </Marker>
        ))}
        {detections.map((det) => (
          <Marker key={det.id} position={[det.lat, det.lng]} icon={detectionIcon(det.type)}>
            <Popup>{det.type} {(det.confidence * 100).toFixed(0)}%</Popup>
          </Marker>
        ))}
      </MapContainer>
      {headingSegments.length > 0 && (
        <div className="absolute bottom-3 right-3 z-[500] max-h-36 w-60 overflow-y-auto rounded-lg border border-slate-700/60 bg-slate-900/90 p-2.5 font-mono text-xs backdrop-blur-sm">
          <div className="mb-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-slate-500">
            <span>Heading differences</span>
            <button type="button" onClick={clearWaypoints} className="text-red-300">Reset</button>
          </div>
          {headingSegments.map((segment) => (
            <div key={segment.label} className="flex items-center justify-between gap-3 py-0.5 text-slate-300">
              <span className="truncate">{segment.label}</span>
              <span className="shrink-0 tabular-nums text-amber-300">
                {segment.difference > 0 ? '+' : ''}{segment.difference.toFixed(1)} deg
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MapClick({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (event) => onAdd(event.latlng.lat, event.latlng.lng) });
  return null;
}

function MapSync({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: false });
  }, [center, map]);
  return null;
}

function robotIcon(heading: number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:34px;height:34px;border-radius:50%;background:#f59e0b;border:3px solid white;display:grid;place-items:center;box-shadow:0 0 18px rgba(245,158,11,.9)"><span style="transform:rotate(${heading}deg);display:block;color:#0f172a;font-size:20px;font-weight:900;line-height:1">▲</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function headingArrowIcon(heading: number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;display:grid;place-items:center;filter:drop-shadow(0 2px 5px rgba(0,0,0,.75))"><svg width="34" height="34" viewBox="0 0 34 34" style="transform:rotate(${heading}deg)"><path d="M17 2 L29 30 L17 24 L5 30 Z" fill="#22d3ee" stroke="white" stroke-width="2"/></svg></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function waypointIcon(index: number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:24px;height:24px;border-radius:50%;background:#3b82f6;border:2px solid white;color:white;display:grid;place-items:center;font:700 11px monospace">${index + 1}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function detectionIcon(type: 'pothole' | 'crack') {
  const color = type === 'pothole' ? '#f97316' : '#eab308';
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function Metric({ label, value, th, error = false }: { label: string; value: string; th: ReturnType<typeof useCards>; error?: boolean }) {
  return (
    <div className={`min-w-0 rounded-lg border p-2 ${error ? 'border-red-500/40 bg-red-500/10' : th.panel}`}>
      <div className={`flex items-center gap-1 truncate text-[10px] font-mono uppercase tracking-wider ${error ? 'text-red-300' : th.label}`}>
        {error && <AlertTriangle className="h-3 w-3 shrink-0" />}
        <span className="truncate">{label}</span>
      </div>
      <div className={`truncate text-sm font-mono tabular-nums ${th.value}`}>{value}</div>
    </div>
  );
}

function telemetryNumber(source: Record<string, unknown> | null, key: string): number {
  const value = source?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function telemetryBool(source: Record<string, unknown> | null, key: string): boolean {
  const value = source?.[key];
  return value === true || value === 1 || value === '1';
}

function Select({ label, value, options, onChange, th }: { label: string; value: string; options: string[]; onChange: (value: string) => void; th: ReturnType<typeof useCards> }) {
  return (
    <label className="space-y-1">
      <span className={`text-xs font-mono uppercase ${th.label}`}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${th.input}`}>
        {options.map((option) => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}
      </select>
    </label>
  );
}

function NumberInput({ label, value, min, step, onChange, th }: { label: string; value: number; min: number; step: number; onChange: (value: number) => void; th: ReturnType<typeof useCards> }) {
  return (
    <label className="space-y-1">
      <span className={`text-xs font-mono uppercase ${th.label}`}>{label}</span>
      <input type="number" value={value} min={min} step={step} onChange={(event) => onChange(Number(event.target.value))} className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${th.input}`} />
    </label>
  );
}

function ActionButton({ label, icon, onClick, color, disabled }: { label: string; icon: React.ReactNode; onClick: () => void; color: 'green' | 'amber' | 'red'; disabled?: boolean }) {
  const colors = {
    green: 'border-green-500/40 bg-green-500/15 text-green-400',
    amber: 'border-amber-500/40 bg-amber-500/15 text-amber-400',
    red: 'border-red-500/40 bg-red-500/15 text-red-400',
  }[color];
  return <button type="button" disabled={disabled} onClick={onClick} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-mono disabled:cursor-not-allowed disabled:opacity-40 ${colors}`}>{icon}{label}</button>;
}

function LinePreview({ mode, color, dash, gap }: { mode: 'solid' | 'dashed'; color: string; dash: number; gap: number }) {
  const lineStyle = mode === 'solid'
    ? { backgroundColor: color, filter: `drop-shadow(0 0 8px ${color})` }
    : {
        backgroundImage: `repeating-linear-gradient(90deg, ${color} 0, ${color} ${dash * 70}px, transparent ${dash * 70}px, transparent ${(dash + gap) * 70}px)`,
        filter: `drop-shadow(0 0 8px ${color})`,
      };
  return (
    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950 p-3">
      <div className="relative h-20 overflow-hidden rounded bg-slate-800">
        <div className="absolute inset-x-0 top-4 h-1 bg-white/20" />
        <div className="absolute inset-x-0 bottom-4 h-1 bg-white/20" />
        <div
          className="absolute left-0 right-0 top-1/2 h-3 -translate-y-1/2"
          style={lineStyle}
        />
      </div>
      <div className="mt-2 text-xs font-mono text-slate-500">Expected {mode} paint shape</div>
    </div>
  );
}

function clearCanvas(canvas: HTMLCanvasElement | null) {
  const ctx = canvas?.getContext('2d');
  if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function captureProcessedFrame(source: CanvasImageSource, settings: ReturnType<typeof useRobot>['imageProcessing'], canvasRef: React.MutableRefObject<HTMLCanvasElement | null>) {
  const size = getSourceSize(source);
  if (!size.width || !size.height) return '';
  const canvas = canvasRef.current ?? document.createElement('canvas');
  canvasRef.current = canvas;
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';
  drawProcessedFrame(ctx, source, canvas.width, canvas.height, settings);
  return canvas.toDataURL('image/jpeg', 0.82);
}

function drawProcessedFrame(ctx: CanvasRenderingContext2D, source: CanvasImageSource, width: number, height: number, settings: ReturnType<typeof useRobot>['imageProcessing']) {
  ctx.filter = settings.enabled ? `brightness(${100 + settings.brightness}%) contrast(${settings.contrast})` : 'none';
  ctx.drawImage(source, 0, 0, width, height);
  ctx.filter = 'none';
  if (!settings.enabled || (!settings.autoNormalize && Math.abs(settings.gamma - 1) < 0.01)) return;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let low = 0;
  let high = 255;
  if (settings.autoNormalize) {
    low = 255;
    high = 0;
    for (let i = 0; i < data.length; i += 4) {
      const value = (data[i] + data[i + 1] + data[i + 2]) / 3;
      low = Math.min(low, value);
      high = Math.max(high, value);
    }
    if (high - low < 8) {
      low = 0;
      high = 255;
    }
  }
  const gamma = 1 / Math.max(0.2, settings.gamma);
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c += 1) {
      const normalized = Math.max(0, Math.min(1, (data[i + c] - low) / (high - low)));
      data[i + c] = Math.round(255 * normalized ** gamma);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function paintProcessedPreview(source: CanvasImageSource | null, canvas: HTMLCanvasElement | null, settings: ReturnType<typeof useRobot>['imageProcessing']) {
  if (!source || !canvas) return;
  const size = getSourceSize(source);
  if (!size.width || !size.height) return;
  if (canvas.width !== size.width) canvas.width = size.width;
  if (canvas.height !== size.height) canvas.height = size.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  drawProcessedFrame(ctx, source, canvas.width, canvas.height, settings);
}

function getSourceSize(source: CanvasImageSource) {
  if (source instanceof HTMLVideoElement) return { width: source.videoWidth, height: source.videoHeight };
  if (source instanceof HTMLImageElement) return { width: source.naturalWidth, height: source.naturalHeight };
  if (source instanceof HTMLCanvasElement || source instanceof OffscreenCanvas) return { width: source.width, height: source.height };
  if (source instanceof ImageBitmap) return { width: source.width, height: source.height };
  return { width: 0, height: 0 };
}

function headingVectorEnd(origin: [number, number], headingDeg: number, lengthM = 18): [number, number] {
  const radius = 6378137;
  const headingRad = (headingDeg * Math.PI) / 180;
  const northM = Math.cos(headingRad) * lengthM;
  const eastM = Math.sin(headingRad) * lengthM;
  const lat = origin[0] + (northM / radius) * (180 / Math.PI);
  const lng = origin[1] + (eastM / (radius * Math.cos((origin[0] * Math.PI) / 180))) * (180 / Math.PI);
  return [lat, lng];
}
