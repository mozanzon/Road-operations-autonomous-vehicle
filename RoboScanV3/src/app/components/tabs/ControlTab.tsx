import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import {
  Activity, Bot, Camera, CircleDot, ClipboardList, Gauge, MapPinned, Maximize2,
  Navigation, Paintbrush, Pause, Play, RadioTower, RotateCcw, Route, Save,
  Square, TestTube2, X,
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
  const [modelMessage, setModelMessage] = useState('No ONNX model loaded');
  const [routingStatus, setRoutingStatus] = useState('Straight waypoint line');
  const [routePositions, setRoutePositions] = useState<[number, number][]>([]);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalImageRef = useRef<HTMLImageElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef(0);
  const processingRef = useRef(false);
  const loopRef = useRef<number>();

  const isConnected = robot.connectionStatus === 'connected';
  const sortedWaypoints = useMemo(() => [...robot.waypoints].sort((a, b) => a.order - b.order), [robot.waypoints]);
  const pathPositions = useMemo(() => sortedWaypoints.map((wp) => [wp.lat, wp.lng] as [number, number]), [sortedWaypoints]);

  useEffect(() => {
    const worker = new Worker(new URL('../../yolo.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.type === 'model-ready') {
        setModelMessage('Model ready');
        return;
      }
      if (message.type === 'detections') {
        if (message.requestId === requestRef.current) {
          const targetCanvas = cameraExpanded ? modalCanvasRef.current : canvasRef.current;
          const targetImage = cameraExpanded ? modalImageRef.current : imageRef.current;
          if (targetCanvas && targetImage) drawDetectionOverlay(targetCanvas, targetImage, message.detections);
          message.detections.forEach((det) => {
            if (det.classId === 0 || det.classId === 1) {
              robot.addDetection(det.classId === 0 ? 'pothole' : 'crack', det.score, 'model');
            }
          });
        }
        processingRef.current = false;
        return;
      }
      processingRef.current = false;
      setModelMessage(message.message);
      setProcessingLive(false);
    };
    return () => {
      worker.terminate();
      if (loopRef.current) window.clearTimeout(loopRef.current);
    };
  }, [cameraExpanded, robot]);

  useEffect(() => {
    if (!processingLive || !robot.cameraFrame) return;
    const tick = () => {
      const targetImage = cameraExpanded ? modalImageRef.current : imageRef.current;
      if (!targetImage || processingRef.current || !workerRef.current) {
        loopRef.current = window.setTimeout(tick, STREAM_INFERENCE_INTERVAL_MS);
        return;
      }
      processingRef.current = true;
      requestRef.current += 1;
      workerRef.current.postMessage({
        type: 'detect',
        requestId: requestRef.current,
        frameUrl: robot.cameraFrame,
        confidenceThreshold: confidence,
        iouThreshold: iou,
      });
      loopRef.current = window.setTimeout(tick, STREAM_INFERENCE_INTERVAL_MS);
    };
    tick();
    return () => {
      if (loopRef.current) window.clearTimeout(loopRef.current);
    };
  }, [cameraExpanded, confidence, iou, processingLive, robot.cameraFrame]);

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
    setModelMessage(`Loading ${file.name}...`);
    workerRef.current?.postMessage({ type: 'load-model', modelFile: file });
  };

  const closeExpandedCamera = () => {
    setCameraExpanded(false);
    setProcessingLive(false);
    processingRef.current = false;
    requestRef.current += 1;
    if (loopRef.current) window.clearTimeout(loopRef.current);
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

  return (
    <div className="grid h-[calc(100vh-8.5rem)] grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[minmax(360px,0.95fr)_minmax(460px,1.05fr)]">
      <section className="min-h-0 space-y-4 overflow-y-auto pr-1">
        <Card title="Operation Mode" icon={<Bot className="h-4 w-4 text-amber-400" />} th={th}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {modeButton('manual', 'Manual', Gauge)}
            {modeButton('semi', 'Semi', Route)}
            {modeButton('fully', 'Fully', Navigation)}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => robot.setMotionPaintMode('move-only')} className={`rounded-lg border px-3 py-2 text-xs font-mono ${robot.motionPaintMode === 'move-only' ? 'bg-blue-500 text-white border-blue-400' : th.button}`}>Move without painting</button>
            <button type="button" onClick={() => robot.setMotionPaintMode('paint')} className={`rounded-lg border px-3 py-2 text-xs font-mono ${robot.motionPaintMode === 'paint' ? 'bg-amber-500 text-slate-950 border-amber-400' : th.button}`}>Move and paint</button>
          </div>
        </Card>

        <Card title="Manual Movement" icon={<CircleDot className="h-4 w-4 text-blue-400" />} th={th}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className={`flex overflow-hidden rounded-lg border ${th.isDark ? 'border-slate-600' : 'border-slate-300'}`}>
              <button onClick={() => setInputMode('toggle')} className={`px-3 py-1.5 text-xs font-mono ${inputMode === 'toggle' ? 'bg-blue-500 text-white' : th.button}`}>TOGGLE DEFAULT</button>
              <button onClick={() => setInputMode('hold')} className={`px-3 py-1.5 text-xs font-mono ${inputMode === 'hold' ? 'bg-blue-500 text-white' : th.button}`}>HOLD</button>
            </div>
            <button type="button" onClick={() => robot.sendVelocity(0, 0)} className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-mono text-red-400">STOP</button>
          </div>
          <div className="flex justify-center">
            <DPad onChange={robot.sendVelocity} speedLimit={robot.scriptedMove.speed} toggleMode={inputMode === 'toggle'} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Metric label="Cmd Vel" value={`${robot.joystickOutput.linear.toFixed(2)} m/s`} th={th} />
            <Metric label="Cmd Ang" value={`${robot.joystickOutput.angular.toFixed(2)} r/s`} th={th} />
          </div>
        </Card>

        <Card title="Manual Scripted Path" icon={<ClipboardList className="h-4 w-4 text-amber-400" />} th={th}>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Direction" value={robot.scriptedMove.direction} onChange={(value) => robot.setScriptedMove({ direction: value as any })} options={['forward', 'backward', 'left', 'right']} th={th} />
            <Select label="Movement" value={robot.scriptedMove.movementType} onChange={(value) => robot.setScriptedMove({ movementType: value as any })} options={['straight', 'turn', 'arc']} th={th} />
            <NumberInput label="Distance (m)" value={robot.scriptedMove.distance} min={0.1} step={0.1} onChange={(value) => robot.setScriptedMove({ distance: value })} th={th} />
            <NumberInput label="Speed (m/s)" value={robot.scriptedMove.speed} min={0.05} step={0.05} onChange={(value) => robot.setScriptedMove({ speed: value })} th={th} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <ActionButton label="Start" icon={<Play className="h-4 w-4" />} onClick={robot.startScriptedMove} color="green" disabled={!isConnected} />
            <ActionButton label="Pause" icon={<Pause className="h-4 w-4" />} onClick={robot.pauseScriptedMove} color="amber" disabled={robot.pathExecStatus !== 'running'} />
            <ActionButton label="Reset" icon={<RotateCcw className="h-4 w-4" />} onClick={robot.resetScriptedMove} color="red" disabled={robot.pathExecStatus === 'idle'} />
          </div>
        </Card>

        <Card title="Waypoint Autonomous" icon={<MapPinned className="h-4 w-4 text-green-400" />} th={th}>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {sortedWaypoints.length === 0 ? <p className={`text-xs font-mono ${th.label}`}>Use the map on the right to set waypoints.</p> : sortedWaypoints.map((wp, index) => (
              <div key={wp.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-mono ${th.panel}`}>
                <span>WP {index + 1}</span>
                <span>{wp.lat.toFixed(5)}, {wp.lng.toFixed(5)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <ActionButton label="Start" icon={<Play className="h-4 w-4" />} onClick={robot.startPath} color="green" disabled={!isConnected || sortedWaypoints.length === 0} />
            <ActionButton label="Pause" icon={<Pause className="h-4 w-4" />} onClick={robot.pausePath} color="amber" disabled={robot.pathExecStatus !== 'running'} />
            <ActionButton label="Reset" icon={<RotateCcw className="h-4 w-4" />} onClick={robot.resetPath} color="red" disabled={robot.pathExecStatus === 'idle'} />
          </div>
          <div className={`mt-2 text-center text-xs font-mono ${th.label}`}>STATUS: {robot.pathExecStatus.toUpperCase()}</div>
        </Card>

        <Card title="Road Painting" icon={<Paintbrush className="h-4 w-4 text-amber-400" />} th={th}>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Paint Type" value={robot.painting.mode} onChange={(value) => robot.setPainting({ mode: value as any })} options={['solid', 'dashed']} th={th} />
            <NumberInput label="Line Width (cm)" value={robot.painting.lineWidth} min={1} step={1} onChange={(value) => robot.setPainting({ lineWidth: value })} th={th} />
            <NumberInput label="Dash (m)" value={robot.painting.dashLength} min={0.1} step={0.1} onChange={(value) => robot.setPainting({ dashLength: value })} th={th} />
            <NumberInput label="Gap (m)" value={robot.painting.gapLength} min={0.1} step={0.1} onChange={(value) => robot.setPainting({ gapLength: value })} th={th} />
          </div>
          <DashedPreview color={robot.painting.color} dash={robot.painting.dashLength} gap={robot.painting.gapLength} />
          <button
            type="button"
            disabled={!isConnected}
            onClick={() => robot.setPainting({ active: !robot.painting.active, status: robot.painting.active ? 'idle' : 'active' })}
            className={`mt-4 w-full rounded-lg border py-2.5 text-sm font-mono font-bold disabled:cursor-not-allowed disabled:opacity-40 ${robot.painting.active ? 'bg-amber-500 text-slate-950 border-amber-400' : th.button}`}
          >
            {robot.painting.active ? 'STOP PAINTING' : 'START PAINTING'}
          </button>
        </Card>

        <Card title="Record And Test" icon={<TestTube2 className="h-4 w-4 text-purple-400" />} th={th}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => robot.recordManualReading()} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-mono ${th.button}`}>
              <Save className="h-4 w-4" /> Record reading
            </button>
            <button type="button" onClick={robot.injectTestReport} className="flex items-center justify-center gap-2 rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-2 text-xs font-mono text-purple-300">
              <TestTube2 className="h-4 w-4" /> Test application
            </button>
          </div>
        </Card>
      </section>

      <section className="min-h-0 space-y-4 overflow-y-auto">
        <Card title="Camera Stream" icon={<Camera className="h-4 w-4 text-amber-400" />} th={th}>
          <CameraPanel
            imageRef={imageRef}
            canvasRef={canvasRef}
            frame={robot.cameraFrame}
            live={robot.cameraLive}
            processing={processingLive}
            message={modelMessage}
            confidence={confidence}
            iou={iou}
            onConfidence={setConfidence}
            onIou={setIou}
            onModelChange={handleModelChange}
            onToggleProcessing={() => setProcessingLive((value) => !value)}
            onExpand={() => setCameraExpanded(true)}
          />
        </Card>

        <SensorStrap th={th} />

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
              {robot.cameraFrame ? <img ref={modalImageRef} src={robot.cameraFrame} alt="Expanded robot stream" className="absolute inset-0 h-full w-full object-contain" /> : null}
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

function CameraPanel({ imageRef, canvasRef, frame, live, processing, message, confidence, iou, onConfidence, onIou, onModelChange, onToggleProcessing, onExpand }: {
  imageRef: React.MutableRefObject<HTMLImageElement | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  frame: string;
  live: boolean;
  processing: boolean;
  message: string;
  confidence: number;
  iou: number;
  onConfidence: (value: number) => void;
  onIou: (value: number) => void;
  onModelChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleProcessing: () => void;
  onExpand: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative h-52 overflow-hidden rounded-lg border border-slate-700 bg-black">
        {frame ? <img ref={imageRef} src={frame} alt="Robot camera stream" className="absolute inset-0 h-full w-full object-contain" /> : null}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {!frame && <div className="absolute inset-0 grid place-items-center text-xs font-mono text-slate-500">Waiting for bridge camera frame</div>}
        <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[11px] font-mono text-slate-200">{live ? 'LIVE' : 'OFFLINE'}</div>
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
        <button type="button" onClick={onToggleProcessing} disabled={!frame} className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-xs font-mono text-amber-300 disabled:opacity-40">
          {processing ? 'Stop detection' : 'Start detection'}
        </button>
        <span className="text-xs font-mono text-slate-500">{message}</span>
      </div>
    </div>
  );
}

function SensorStrap({ th }: { th: ReturnType<typeof useCards> }) {
  const { gps, imu, encoders, battery, latency, bridgeStats, cameraLive } = useRobot();
  return (
    <section className={`rounded-xl border p-4 ${th.card}`}>
      <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest ${th.title}`}><Activity className="h-4 w-4 text-amber-400" />Sensor Strap</h3>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <Metric label="GPS" value={gps.fix ? 'FIX' : 'NO FIX'} th={th} />
        <Metric label="Lat" value={gps.lat.toFixed(6)} th={th} />
        <Metric label="Lng" value={gps.lng.toFixed(6)} th={th} />
        <Metric label="Accuracy" value={`${gps.accuracy.toFixed(1)} m`} th={th} />
        <Metric label="Heading" value={`${gps.heading.toFixed(1)} deg`} th={th} />
        <Metric label="Yaw" value={`${imu.yaw.toFixed(1)} deg`} th={th} />
        <Metric label="Roll/Pitch" value={`${imu.roll.toFixed(1)} / ${imu.pitch.toFixed(1)}`} th={th} />
        <Metric label="Ticks L/R" value={`${encoders.leftTicks} / ${encoders.rightTicks}`} th={th} />
        <Metric label="RPM L/R" value={`${encoders.leftRPM.toFixed(1)} / ${encoders.rightRPM.toFixed(1)}`} th={th} />
        <Metric label="Velocity" value={`${encoders.linearVelocity.toFixed(2)} m/s`} th={th} />
        <Metric label="Odom Err" value={`${encoders.odometryError.toFixed(3)} m`} th={th} />
        <Metric label="Battery" value={`${battery.toFixed(1)}%`} th={th} />
        <Metric label="Latency" value={`${latency.toFixed(0)} ms`} th={th} />
        <Metric label="Bridge FPS" value={`${(bridgeStats?.loop_fps ?? bridgeStats?.stream_fps ?? 0).toFixed(1)}`} th={th} />
        <Metric label="Camera" value={cameraLive ? 'LIVE' : 'OFFLINE'} th={th} />
      </div>
      {bridgeStats?.camera_error ? <div className="mt-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs font-mono text-red-300">{bridgeStats.camera_error}</div> : null}
    </section>
  );
}

function WaypointMap({ height, routePositions }: { height: number | string; routePositions: [number, number][] }) {
  const { gps, waypoints, addWaypoint, updateWaypoint, deleteWaypoint, detections } = useRobot();
  const center: [number, number] = gps.fix ? [gps.lat, gps.lng] : EGYPT_CENTER;
  const sorted = [...waypoints].sort((a, b) => a.order - b.order);
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700" style={{ height }}>
      <MapContainer center={center} zoom={gps.fix ? 15 : 7} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap" />
        <MapSync center={center} />
        <MapClick onAdd={addWaypoint} />
        <Marker position={center} icon={robotIcon(gps.heading)}>
          <Popup>Robot: {center[0].toFixed(6)}, {center[1].toFixed(6)}</Popup>
        </Marker>
        {routePositions.length >= 2 && <Polyline positions={routePositions} color="#f59e0b" weight={4} opacity={0.85} dashArray="8 5" />}
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
            <Popup>Waypoint {index + 1}<br />Right-click marker to delete.</Popup>
          </Marker>
        ))}
        {detections.map((det) => (
          <Marker key={det.id} position={[det.lat, det.lng]} icon={detectionIcon(det.type)}>
            <Popup>{det.type} {(det.confidence * 100).toFixed(0)}%</Popup>
          </Marker>
        ))}
      </MapContainer>
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
    html: `<div style="width:28px;height:28px;border-radius:50%;background:#f59e0b;border:2px solid white;display:grid;place-items:center;box-shadow:0 0 12px rgba(245,158,11,.7)"><span style="transform:rotate(${heading}deg);display:block;color:#0f172a;font-weight:900">▲</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
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

function Metric({ label, value, th }: { label: string; value: string; th: ReturnType<typeof useCards> }) {
  return (
    <div className={`min-w-0 rounded-lg border p-2 ${th.panel}`}>
      <div className={`truncate text-[10px] font-mono uppercase tracking-wider ${th.label}`}>{label}</div>
      <div className={`truncate text-sm font-mono tabular-nums ${th.value}`}>{value}</div>
    </div>
  );
}

function Select({ label, value, options, onChange, th }: { label: string; value: string; options: string[]; onChange: (value: string) => void; th: ReturnType<typeof useCards> }) {
  return (
    <label className="space-y-1">
      <span className={`text-xs font-mono uppercase ${th.label}`}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${th.input}`}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
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

function DashedPreview({ color, dash, gap }: { color: string; dash: number; gap: number }) {
  return (
    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950 p-3">
      <div className="relative h-20 overflow-hidden rounded bg-slate-800">
        <div className="absolute inset-x-0 top-4 h-1 bg-white/20" />
        <div className="absolute inset-x-0 bottom-4 h-1 bg-white/20" />
        <div
          className="absolute left-0 right-0 top-1/2 h-3 -translate-y-1/2"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, ${color} 0, ${color} ${dash * 70}px, transparent ${dash * 70}px, transparent ${(dash + gap) * 70}px)`,
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
      </div>
      <div className="mt-2 text-xs font-mono text-slate-500">Expected dashed paint shape</div>
    </div>
  );
}

function clearCanvas(canvas: HTMLCanvasElement | null) {
  const ctx = canvas?.getContext('2d');
  if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}
