import React, { useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer, TileLayer, Marker, Polyline, CircleMarker, useMapEvents, Popup
} from 'react-leaflet';
import { Download, Upload, Trash2, MapPin } from 'lucide-react';
import { useRobot } from '../../context/RobotContext';

// Fix default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;

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
  const pathPositions = sortedWaypoints.map(wp => [wp.lat, wp.lng] as [number, number]);
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

function robotIcon(heading: number) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:34px;height:34px;">
        <div style="
          width:34px;height:34px;background:radial-gradient(circle,#f59e0b,#d97706);
          border-radius:50%;border:3px solid white;
          box-shadow:0 0 18px rgba(245,158,11,0.9);
          display:flex;align-items:center;justify-content:center;">
          <svg width="19" height="19" viewBox="0 0 14 14" fill="white" style="transform:rotate(${heading}deg)">
            <polygon points="7,1 11,13 7,10 3,13"/>
          </svg>
        </div>
        <div style="
          position:absolute;top:-4px;left:-4px;right:-4px;bottom:-4px;
          border-radius:50%;border:2px solid rgba(245,158,11,0.3);
          animation:ping 1.5s ease-in-out infinite;">
        </div>
      </div>`,
    iconSize: [34, 34], iconAnchor: [17, 17],
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

function headingVectorEnd(origin: [number, number], headingDeg: number, lengthM = 18): [number, number] {
  const radius = 6378137;
  const headingRad = (headingDeg * Math.PI) / 180;
  const northM = Math.cos(headingRad) * lengthM;
  const eastM = Math.sin(headingRad) * lengthM;
  const lat = origin[0] + (northM / radius) * (180 / Math.PI);
  const lng = origin[1] + (eastM / (radius * Math.cos((origin[0] * Math.PI) / 180))) * (180 / Math.PI);
  return [lat, lng];
}

function waypointIcon(index: number) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:24px;height:24px;background:#3b82f6;border:2px solid white;
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      color:white;font-size:10px;font-weight:bold;font-family:monospace;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);">${index + 1}</div>`,
    iconSize: [24, 24], iconAnchor: [12, 12],
  });
}

function MapEvents() {
  const { addWaypoint } = useRobot();
  useMapEvents({
    click(e) {
      addWaypoint(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapTab() {
  const {
    gps, waypoints, updateWaypoint, deleteWaypoint, clearWaypoints, moveWaypoint, updateWaypointHeading, importWaypoints,
    detections, mapTileSource, alignRobotFrontToHeading,
  } = useRobot();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tileSources: Record<string, { url: string; attr: string }> = {
    osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap' },
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '© Esri' },
    topo: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attr: '© OpenTopoMap' },
  };

  const tile = tileSources[mapTileSource] || tileSources.osm;

  const exportPath = useCallback(() => {
    const data = JSON.stringify({ waypoints, exported: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `robot-path-${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
  }, [waypoints]);

  const importPath = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.waypoints) importWaypoints(data.waypoints);
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [importWaypoints]);

  const sortedWaypoints = [...waypoints].sort((a, b) => a.order - b.order);
  const robotPosition: [number, number] = [gps.lat, gps.lng];
  const compassHeading = normalizeHeading(gps.heading);
  const displayHeading = alignRobotFrontToHeading ? compassHeading : gps.heading;
  const headingEnd = headingVectorEnd(robotPosition, displayHeading);
  const pathPositions = sortedWaypoints
    .map(w => [w.lat, w.lng] as [number, number]);
  const renderedPathPositions = [robotPosition, ...pathPositions];
  const headingSegments = buildHeadingSegments(robotPosition, compassHeading, sortedWaypoints);

  // Calculate total path distance
  let totalPathDist = 0;
  for (let i = 1; i < renderedPathPositions.length; i++) {
    const [la, lo] = renderedPathPositions[i - 1];
    const [lb, lob] = renderedPathPositions[i];
    const R = 6371000;
    const dlat = ((lb - la) * Math.PI) / 180;
    const dlon = ((lob - lo) * Math.PI) / 180;
    const a = Math.sin(dlat / 2) ** 2 + Math.cos((la * Math.PI) / 180) * Math.cos((lb * Math.PI) / 180) * Math.sin(dlon / 2) ** 2;
    totalPathDist += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <MapPin className="h-3.5 w-3.5 text-amber-400" />
          <span>{waypoints.length} waypoints</span>
          {pathPositions.length >= 1 && (
            <span className="text-slate-500">— {totalPathDist.toFixed(1)} m total</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportPath}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-mono transition-colors">
            <Download className="h-3.5 w-3.5" /> Export JSON
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-mono transition-colors">
            <Upload className="h-3.5 w-3.5" /> Import JSON
          </button>
          <button onClick={clearWaypoints} disabled={waypoints.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono transition-colors disabled:cursor-not-allowed disabled:opacity-40">
            <Trash2 className="h-3.5 w-3.5" /> Reset
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={importPath} />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-700/60 relative" style={{ minHeight: 420 }}>
        <MapContainer
          center={[gps.lat, gps.lng]}
          zoom={16}
          maxZoom={MAX_MAP_ZOOM}
          zoomSnap={0.25}
          style={{ height: '100%', width: '100%', minHeight: 420, background: '#1e293b' }}
          className="z-0"
        >
          <TileLayer url={tile.url} attribution={tile.attr} maxZoom={MAX_MAP_ZOOM} maxNativeZoom={MAX_NATIVE_TILE_ZOOM} />
          <MapEvents />

          {/* Robot marker */}
          <Polyline positions={[robotPosition, headingEnd]} color="#22d3ee" weight={7} opacity={0.95} />
          <Marker position={headingEnd} icon={headingArrowIcon(displayHeading)} interactive={false} />
          <Marker position={[gps.lat, gps.lng]} icon={robotIcon(displayHeading)}>
            <Popup>
              <div className="font-mono text-xs space-y-1">
                <div><b>Robot Position</b></div>
                <div>Lat: {gps.lat.toFixed(6)}</div>
                <div>Lng: {gps.lng.toFixed(6)}</div>
                <div>Compass: {compassHeading.toFixed(1)}°</div>
              </div>
            </Popup>
          </Marker>

          {/* Path polyline */}
          {renderedPathPositions.length >= 2 && (
            <Polyline
              positions={renderedPathPositions}
              color="#f59e0b"
              weight={3}
              opacity={0.8}
              dashArray="8 4"
            />
          )}

          {/* Waypoint markers */}
          {sortedWaypoints.map((wp, idx) => (
            <Marker
              key={wp.id}
              position={[wp.lat, wp.lng]}
              icon={waypointIcon(idx)}
              draggable
              eventHandlers={{
                dragend(e) {
                  const m = e.target as L.Marker;
                  const pos = m.getLatLng();
                  updateWaypoint(wp.id, pos.lat, pos.lng);
                },
                contextmenu() { deleteWaypoint(wp.id); },
              }}
            >
              <Popup>
                <div className="font-mono text-xs space-y-1 min-w-[160px]">
                  <div className="font-bold">Waypoint #{idx + 1}</div>
                  <div>Lat: {wp.lat.toFixed(6)}</div>
                  <div>Lng: {wp.lng.toFixed(6)}</div>
                  {headingSegments[idx] && (
                    <>
                      <div>Bearing: {headingSegments[idx].bearing.toFixed(1)} deg</div>
                      <div>Heading: {headingSegments[idx].heading.toFixed(1)} deg{headingSegments[idx].isOverride ? ' custom' : ''}</div>
                      <div>Turn: {headingSegments[idx].difference > 0 ? '+' : ''}{headingSegments[idx].difference.toFixed(1)} deg</div>
                      <label className="mt-1 block text-slate-500">
                        Custom heading
                        <input
                          type="number"
                          min={0}
                          max={359}
                          step={1}
                          value={wp.headingOverride ?? ''}
                          placeholder={headingSegments[idx].bearing.toFixed(0)}
                          onChange={(event) => updateWaypointHeading(wp.id, event.target.value === '' ? null : Number(event.target.value))}
                          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs"
                        />
                      </label>
                    </>
                  )}
                  <div className="mt-2 flex gap-1">
                    <button disabled={idx === 0} onClick={() => moveWaypoint(wp.id, 'up')} className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40">Up</button>
                    <button disabled={idx === sortedWaypoints.length - 1} onClick={() => moveWaypoint(wp.id, 'down')} className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40">Down</button>
                  </div>
                  <button
                    onClick={() => deleteWaypoint(wp.id)}
                    className="mt-1 flex items-center gap-1 text-red-500 hover:text-red-700 text-xs"
                  >
                    <Trash2 className="h-3 w-3" /> Delete waypoint
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Detection pins */}
          {detections.map(det => (
            <CircleMarker
              key={det.id}
              center={[det.lat, det.lng]}
              radius={6}
              color={det.type === 'pothole' ? '#f97316' : '#eab308'}
              fillColor={det.type === 'pothole' ? '#f97316' : '#eab308'}
              fillOpacity={0.8}
              weight={2}
            >
              <Popup>
                <div className="font-mono text-xs space-y-0.5">
                  <div className="font-bold capitalize">{det.type}</div>
                  <div>Conf: {(det.confidence * 100).toFixed(0)}%</div>
                  <div>{new Date(det.timestamp).toLocaleTimeString()}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[500] bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700/60 p-2.5 space-y-1.5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="text-slate-300">Robot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-slate-300">Waypoint</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-slate-300">Pothole</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="text-slate-300">Crack</span>
          </div>
        </div>

        {headingSegments.length > 0 && (
          <div className="absolute bottom-3 right-3 z-[500] max-h-44 w-64 overflow-y-auto rounded-lg border border-slate-700/60 bg-slate-900/90 p-2.5 font-mono text-xs backdrop-blur-sm">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Heading differences</div>
            {headingSegments.map((segment) => (
              <div key={segment.label} className="flex items-center justify-between gap-3 py-0.5 text-slate-300">
                <span className="truncate">{segment.label}</span>
                <span className="shrink-0 tabular-nums text-amber-300">{segment.difference > 0 ? '+' : ''}{segment.difference.toFixed(1)} deg</span>
              </div>
            ))}
          </div>
        )}

        {/* Instructions overlay */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-slate-900/85 backdrop-blur-sm rounded-lg border border-slate-700/40 px-3 py-1.5 text-xs font-mono text-slate-400 pointer-events-none">
          Click to add waypoint · Drag to move · Right-click to delete
        </div>
      </div>
    </div>
  );
}
