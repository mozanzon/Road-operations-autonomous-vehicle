import React from 'react';
import { Settings, Sun, Moon, Ruler, AlertTriangle, Clock, Map, KeyRound, BrainCircuit, Gauge, Camera, Compass } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useRobot } from '../../context/RobotContext';

function Section({ title, icon, children, isDark }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; isDark: boolean;
}) {
  const card = isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm';
  const heading = isDark ? 'text-slate-200' : 'text-slate-800';
  return (
    <div className={`rounded-xl border ${card} p-5 space-y-4`}>
      <h3 className={`font-semibold text-sm uppercase tracking-widest flex items-center gap-2 ${heading}`}>
        {icon}{title}
      </h3>
      {children}
    </div>
  );
}

function PreferenceRow({ label, description, children, isDark }: {
  label: string; description?: string; children: React.ReactNode; isDark: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-2 border-b last:border-0 ${isDark ? 'border-slate-700/30' : 'border-slate-200'}`}>
      <div>
        <div className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</div>
        {description && <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ThresholdSlider({ label, value, onChange, min, max, step, unit, dangerAbove, isDark }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; unit: string; dangerAbove?: number; isDark: boolean;
}) {
  const isDanger = dangerAbove !== undefined && value >= dangerAbove;
  return (
    <div className="space-y-1.5">
      <div className={`flex justify-between text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        <span>{label}</span>
        <span className={isDanger ? 'text-red-500' : 'text-amber-500'}>{value.toFixed(step < 1 ? 2 : 0)} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full h-1.5 rounded-full cursor-pointer ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
        style={{ accentColor: isDanger ? '#ef4444' : '#f59e0b' }}
      />
    </div>
  );
}

function NumberPref({ label, value, unit, onChange, isDark }: {
  label: string; value: number; unit: string; onChange: (v: number) => void; isDark: boolean;
}) {
  return (
    <label className="space-y-1">
      <span className={`text-xs font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      <div className={`flex items-center gap-2 rounded border px-2 py-1.5 ${isDark ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-900'}`}>
        <input
          type="number"
          value={value}
          step={unit === 'px' ? 1 : 0.1}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-20 bg-transparent text-xs font-mono outline-none"
        />
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </label>
  );
}

export function PreferencesTab() {
  const { theme, toggleTheme, isDark } = useTheme();
  const {
    units, setUnits,
    gpsThreshold, setGpsThreshold,
    encoderErrorLimit, setEncoderErrorLimit,
    batteryWarning, setBatteryWarning,
    streamTimeout, setStreamTimeout,
    mapTileSource, setMapTileSource,
    selectedModelPath, setSelectedModelPath,
    tomTomApiKey, setTomTomApiKey,
    robotSpeedCap, setRobotSpeedCap,
    autoTurnSpeed, setAutoTurnSpeed,
    cameraCalibration, setCameraCalibration,
    compassOffset, setCompassOffset,
    alignRobotFrontToHeading, setAlignRobotFrontToHeading,
    imageProcessing, setImageProcessing,
  } = useRobot();

  const mapSources = [
    { value: 'osm',       label: 'OpenStreetMap'   },
    { value: 'satellite', label: 'Satellite (Esri)' },
    { value: 'topo',      label: 'Topographic'      },
  ];

  const infoBox = isDark
    ? 'text-slate-500 bg-slate-800/40 border-slate-700/30'
    : 'text-slate-500 bg-slate-100 border-slate-200';

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Appearance */}
      <Section title="Appearance" icon={<Settings className="h-4 w-4 text-amber-400" />} isDark={isDark}>
        <PreferenceRow label="Theme" description="Switch between dark and light interface" isDark={isDark}>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-mono font-semibold tracking-wider transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-600 text-amber-400 hover:bg-slate-700'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
          >
            {isDark ? <><Sun className="h-4 w-4" /> LIGHT MODE</> : <><Moon className="h-4 w-4" /> DARK MODE</>}
          </button>
        </PreferenceRow>
        <div className="flex items-center gap-3 mt-2">
          <div className={`flex-1 rounded-lg p-3 border-2 cursor-pointer transition-all ${theme === 'dark' ? 'border-amber-500 bg-slate-950' : 'border-slate-700 bg-slate-950 opacity-50'}`}
            onClick={() => theme !== 'dark' && toggleTheme()}>
            <div className="text-xs font-mono text-slate-300 text-center">
              <Moon className="h-5 w-5 mx-auto mb-1" />Dark
            </div>
          </div>
          <div className={`flex-1 rounded-lg p-3 border-2 cursor-pointer transition-all ${theme === 'light' ? 'border-amber-500 bg-white' : 'border-slate-300 bg-white opacity-50'}`}
            onClick={() => theme !== 'light' && toggleTheme()}>
            <div className="text-xs font-mono text-slate-700 text-center">
              <Sun className="h-5 w-5 mx-auto mb-1" />Light
            </div>
          </div>
        </div>
      </Section>

      {/* Units */}
      <Section title="Units" icon={<Ruler className="h-4 w-4 text-amber-400" />} isDark={isDark}>
        <PreferenceRow label="Measurement Units" description="Affects distance, speed, and velocity displays" isDark={isDark}>
          <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
            <button onClick={() => setUnits('metric')}
              className={`px-4 py-2 text-xs font-mono font-semibold tracking-wider transition-all ${
                units === 'metric'
                  ? 'bg-amber-500 text-slate-900'
                  : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}>METRIC</button>
            <button onClick={() => setUnits('imperial')}
              className={`px-4 py-2 text-xs font-mono font-semibold tracking-wider transition-all ${
                units === 'imperial'
                  ? 'bg-amber-500 text-slate-900'
                  : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}>IMPERIAL</button>
          </div>
        </PreferenceRow>
        <div className={`text-xs font-mono rounded p-3 border ${infoBox}`}>
          {units === 'metric'
            ? 'Distances in meters/km · Speeds in km/h · Weights in kg'
            : 'Distances in feet/miles · Speeds in mph · Weights in lbs'}
        </div>
      </Section>

      <Section title="Robot Motion" icon={<Gauge className="h-4 w-4 text-amber-400" />} isDark={isDark}>
        <ThresholdSlider label="Global Robot Speed Cap" value={robotSpeedCap} onChange={setRobotSpeedCap}
          min={0.05} max={1} step={0.05} unit="m/s" dangerAbove={0.7} isDark={isDark} />
        <ThresholdSlider label="Auto Heading Turn Speed" value={autoTurnSpeed} onChange={setAutoTurnSpeed}
          min={0.05} max={robotSpeedCap} step={0.05} unit="m/s" dangerAbove={Math.max(0.05, robotSpeedCap * 0.8)} isDark={isDark} />
        <div className={`text-xs font-mono rounded p-3 border ${infoBox}`}>
          Manual, semi-scripted, and autonomous commands are clamped to the global cap before PWM conversion.
        </div>
      </Section>

      <Section title="Camera Calibration" icon={<Camera className="h-4 w-4 text-amber-400" />} isDark={isDark}>
        <div className="grid grid-cols-2 gap-3">
          <NumberPref label="Height" value={cameraCalibration.heightCm} unit="cm" onChange={(heightCm) => setCameraCalibration({ heightCm })} isDark={isDark} />
          <NumberPref label="Tilt" value={cameraCalibration.tiltDeg} unit="deg" onChange={(tiltDeg) => setCameraCalibration({ tiltDeg })} isDark={isDark} />
          <NumberPref label="Horizontal FOV" value={cameraCalibration.horizontalFovDeg} unit="deg" onChange={(horizontalFovDeg) => setCameraCalibration({ horizontalFovDeg })} isDark={isDark} />
          <NumberPref label="Vertical FOV" value={cameraCalibration.verticalFovDeg} unit="deg" onChange={(verticalFovDeg) => setCameraCalibration({ verticalFovDeg })} isDark={isDark} />
          <NumberPref label="Stream Width" value={cameraCalibration.streamWidth} unit="px" onChange={(streamWidth) => setCameraCalibration({ streamWidth })} isDark={isDark} />
          <NumberPref label="Stream Height" value={cameraCalibration.streamHeight} unit="px" onChange={(streamHeight) => setCameraCalibration({ streamHeight })} isDark={isDark} />
          <NumberPref label="Front Offset" value={cameraCalibration.forwardOffsetCm} unit="cm" onChange={(forwardOffsetCm) => setCameraCalibration({ forwardOffsetCm })} isDark={isDark} />
        </div>
      </Section>

      <Section title="Compass Calibration" icon={<Compass className="h-4 w-4 text-amber-400" />} isDark={isDark}>
        <ThresholdSlider label="Compass Offset" value={compassOffset} onChange={setCompassOffset}
          min={-180} max={180} step={1} unit="deg" isDark={isDark} />
        <PreferenceRow label="Align robot front pointer" description="Rotate the map robot marker by calibrated heading" isDark={isDark}>
          <input type="checkbox" checked={alignRobotFrontToHeading} onChange={(event) => setAlignRobotFrontToHeading(event.target.checked)} />
        </PreferenceRow>
      </Section>

      <Section title="Image Processing" icon={<Camera className="h-4 w-4 text-amber-400" />} isDark={isDark}>
        <PreferenceRow label="Enable preprocessing" description="Applies UI-side brightness and contrast correction before detection" isDark={isDark}>
          <input type="checkbox" checked={imageProcessing.enabled} onChange={(event) => setImageProcessing({ enabled: event.target.checked })} />
        </PreferenceRow>
        <ThresholdSlider label="Brightness" value={imageProcessing.brightness} onChange={(brightness) => setImageProcessing({ enabled: true, brightness })}
          min={-100} max={100} step={5} unit="" isDark={isDark} />
        <ThresholdSlider label="Contrast" value={imageProcessing.contrast} onChange={(contrast) => setImageProcessing({ enabled: true, contrast })}
          min={0.2} max={3} step={0.1} unit="x" dangerAbove={2.5} isDark={isDark} />
        <ThresholdSlider label="Gamma" value={imageProcessing.gamma} onChange={(gamma) => setImageProcessing({ enabled: true, gamma })}
          min={0.2} max={3} step={0.1} unit="x" dangerAbove={2.5} isDark={isDark} />
        <PreferenceRow label="Auto normalize" description="Stretches dark or bright frames before model inference" isDark={isDark}>
          <input type="checkbox" checked={imageProcessing.autoNormalize} onChange={(event) => setImageProcessing({ enabled: true, autoNormalize: event.target.checked })} />
        </PreferenceRow>
      </Section>

      {/* Alert Thresholds */}
      <Section title="Alert Thresholds" icon={<AlertTriangle className="h-4 w-4 text-amber-400" />} isDark={isDark}>
        <ThresholdSlider label="GPS Accuracy Warning (m)" value={gpsThreshold} onChange={setGpsThreshold}
          min={1} max={20} step={0.5} unit="m" dangerAbove={12} isDark={isDark} />
        <ThresholdSlider label="Encoder Error Limit (m)" value={encoderErrorLimit} onChange={setEncoderErrorLimit}
          min={0.01} max={0.5} step={0.01} unit="m" dangerAbove={0.3} isDark={isDark} />
        <ThresholdSlider label="Battery Warning Level (%)" value={batteryWarning} onChange={setBatteryWarning}
          min={5} max={50} step={1} unit="%" dangerAbove={30} isDark={isDark} />
        <div className={`pt-1 text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          <span className="text-amber-500">⚠</span> Alerts trigger visual indicators when thresholds are exceeded.
        </div>
      </Section>

      {/* Stream Settings */}
      <Section title="Stream Settings" icon={<Clock className="h-4 w-4 text-amber-400" />} isDark={isDark}>
        <ThresholdSlider label="Stream Timeout Sensitivity (s)" value={streamTimeout} onChange={setStreamTimeout}
          min={0.5} max={10} step={0.5} unit="s" dangerAbove={8} isDark={isDark} />
        <div className={`text-xs font-mono rounded p-3 border ${infoBox}`}>
          If no data is received from a sensor stream for longer than this duration, the live indicator will switch to an error state.
        </div>
      </Section>

      {/* Model Settings */}
      <Section title="Detection Model" icon={<BrainCircuit className="h-4 w-4 text-amber-400" />} isDark={isDark}>
        <PreferenceRow label="Selected Model Path" description="Stored display path for the ONNX road damage model" isDark={isDark}>
          <input
            type="text"
            value={selectedModelPath}
            onChange={e => setSelectedModelPath(e.target.value)}
            placeholder="model/best.onnx"
            className={`w-64 border rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 ${isDark ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
          />
        </PreferenceRow>
        <div className={`text-xs font-mono rounded p-3 border ${infoBox}`}>
          Browser security still requires loading the actual ONNX file from the Operations camera panel when running local inference.
        </div>
      </Section>

      {/* Map Settings */}
      <Section title="Map Settings" icon={<Map className="h-4 w-4 text-amber-400" />} isDark={isDark}>
        <PreferenceRow label="TomTom API Key" description="Used for waypoint route calculation in Operations" isDark={isDark}>
          <div className={`flex items-center gap-2 border rounded px-3 py-2 ${isDark ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <KeyRound className="h-4 w-4 text-amber-400" />
            <input
              type="password"
              value={tomTomApiKey}
              onChange={e => setTomTomApiKey(e.target.value)}
              placeholder="TomTom key"
              className="w-56 bg-transparent text-xs font-mono outline-none"
            />
          </div>
        </PreferenceRow>
        <div className="space-y-2">
          <label className={`text-xs font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Map Tile Source</label>
          <div className="space-y-2">
            {mapSources.map(src => (
              <label key={src.value} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  mapTileSource === src.value ? 'border-amber-500 bg-amber-500' : isDark ? 'border-slate-500 group-hover:border-slate-400' : 'border-slate-400 group-hover:border-slate-600'
                }`}>
                  {mapTileSource === src.value && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                </div>
                <span className={`text-sm font-mono ${
                  mapTileSource === src.value ? 'text-amber-500' : isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-800'
                }`}>{src.label}</span>
                <input type="radio" name="mapTile" value={src.value} checked={mapTileSource === src.value}
                  onChange={() => setMapTileSource(src.value)} className="hidden" />
              </label>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
