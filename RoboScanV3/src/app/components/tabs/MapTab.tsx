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

function robotIcon(heading: number) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:28px;height:28px;">
        <div style="
          width:28px;height:28px;background:radial-gradient(circle,#f59e0b,#d97706);
          border-radius:50%;border:2px solid white;
          box-shadow:0 0 12px rgba(245,158,11,0.8);
          display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="white" style="transform:rotate(${heading}deg)">
            <polygon points="7,1 11,13 7,10 3,13"/>
          </svg>
        </div>
        <div style="
          position:absolute;top:-4px;left:-4px;right:-4px;bottom:-4px;
          border-radius:50%;border:2px solid rgba(245,158,11,0.3);
          animation:ping 1.5s ease-in-out infinite;">
        </div>
      </div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  });
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
    gps, waypoints, updateWaypoint, deleteWaypoint, importWaypoints,
    detections, mapTileSource,
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

  const pathPositions = waypoints
    .sort((a, b) => a.order - b.order)
    .map(w => [w.lat, w.lng] as [number, number]);

  // Calculate total path distance
  let totalPathDist = 0;
  for (let i = 1; i < pathPositions.length; i++) {
    const [la, lo] = pathPositions[i - 1];
    const [lb, lob] = pathPositions[i];
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
          {pathPositions.length >= 2 && (
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
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={importPath} />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-700/60 relative" style={{ minHeight: 420 }}>
        <MapContainer
          center={[gps.lat, gps.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%', minHeight: 420, background: '#1e293b' }}
          className="z-0"
        >
          <TileLayer url={tile.url} attribution={tile.attr} />
          <MapEvents />

          {/* Robot marker */}
          <Marker position={[gps.lat, gps.lng]} icon={robotIcon(gps.heading)}>
            <Popup>
              <div className="font-mono text-xs space-y-1">
                <div><b>Robot Position</b></div>
                <div>Lat: {gps.lat.toFixed(6)}</div>
                <div>Lng: {gps.lng.toFixed(6)}</div>
                <div>Heading: {gps.heading.toFixed(1)}°</div>
              </div>
            </Popup>
          </Marker>

          {/* Path polyline */}
          {pathPositions.length >= 2 && (
            <Polyline
              positions={pathPositions}
              color="#f59e0b"
              weight={3}
              opacity={0.8}
              dashArray="8 4"
            />
          )}

          {/* Waypoint markers */}
          {waypoints.sort((a, b) => a.order - b.order).map((wp, idx) => (
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

        {/* Instructions overlay */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-slate-900/85 backdrop-blur-sm rounded-lg border border-slate-700/40 px-3 py-1.5 text-xs font-mono text-slate-400 pointer-events-none">
          Click to add waypoint · Drag to move · Right-click to delete
        </div>
      </div>
    </div>
  );
}