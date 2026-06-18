export type MapTileSource = 'osm' | 'satellite' | 'topo';
export type MapLocationSource = 'robot' | 'operator';

export type OperatorLocationLike = {
  lat: number;
  lng: number;
};

export type PrimaryMapMarker = {
  kind: 'robot' | 'operator';
  position: [number, number];
};

export const MAP_TILE_SOURCES: Record<MapTileSource, { url: string; attr: string }> = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '© OpenStreetMap',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '© Esri',
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attr: '© OpenTopoMap',
  },
};

export function getMapTileSource(source: string) {
  return MAP_TILE_SOURCES[source as MapTileSource] ?? MAP_TILE_SOURCES.osm;
}

export function resolveMapCenter({
  source,
  robotPosition,
  operatorLocation,
  fallbackCenter,
}: {
  source: MapLocationSource;
  robotPosition: [number, number] | null;
  operatorLocation: OperatorLocationLike | null;
  fallbackCenter: [number, number];
}) {
  if (source === 'operator' && operatorLocation) {
    return [operatorLocation.lat, operatorLocation.lng] as [number, number];
  }

  if (robotPosition) return robotPosition;

  return fallbackCenter;
}

export function getPrimaryMapMarker({
  source,
  robotPosition,
  operatorLocation,
}: {
  source: MapLocationSource;
  robotPosition: [number, number] | null;
  operatorLocation: OperatorLocationLike | null;
}): PrimaryMapMarker | null {
  if (source === 'operator' && operatorLocation) {
    return {
      kind: 'operator',
      position: [operatorLocation.lat, operatorLocation.lng],
    };
  }

  if (robotPosition) {
    return {
      kind: 'robot',
      position: robotPosition,
    };
  }

  return null;
}
