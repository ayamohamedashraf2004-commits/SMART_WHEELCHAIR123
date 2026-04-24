import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Play, MapPin, Clock, Route, ShieldCheck } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
// @ts-ignore
import 'leaflet/dist/leaflet.css';
// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// ── Campus Locations (hardcoded, replace with DB fetch later) ──
interface CampusLocation {
  name: string;
  lat: number;
  lng: number;
  slam_x?: number;
  slam_y?: number;
}

const CAMPUS_LOCATIONS: CampusLocation[] = [
  { name: 'Main Gate', lat: 30.0131, lng: 31.2089 },
  { name: 'Engineering Building', lat: 30.0145, lng: 31.2075 },
  { name: 'Library', lat: 30.0120, lng: 31.2100 },
  { name: 'Cafeteria', lat: 30.0138, lng: 31.2110 },
  { name: 'Medical Center', lat: 30.0115, lng: 31.2065 },
  { name: 'Sports Complex', lat: 30.0155, lng: 31.2095 },
];

const DEFAULT_CENTER: [number, number] = [30.0131, 31.2089];

// ── SLAM-to-GPS Mapping ──
// Affine transform: GPS = A * SLAM + B
// Calibrate with 2+ known reference points from your campus
const SLAM_REF_1 = { slam: { x: 0, y: 0 }, gps: { lat: 30.0131, lng: 31.2089 } };
const SLAM_REF_2 = { slam: { x: 10, y: 10 }, gps: { lat: 30.0141, lng: 31.2099 } };

const slamScale = {
  latPerX: (SLAM_REF_2.gps.lat - SLAM_REF_1.gps.lat) / (SLAM_REF_2.slam.x - SLAM_REF_1.slam.x),
  latPerY: 0,
  lngPerX: 0,
  lngPerY: (SLAM_REF_2.gps.lng - SLAM_REF_1.gps.lng) / (SLAM_REF_2.slam.y - SLAM_REF_1.slam.y),
};

function convertSlamToNav(x: number, y: number): [number, number] {
  const lat = SLAM_REF_1.gps.lat + slamScale.latPerX * (x - SLAM_REF_1.slam.x) + slamScale.latPerY * (y - SLAM_REF_1.slam.y);
  const lng = SLAM_REF_1.gps.lng + slamScale.lngPerX * (x - SLAM_REF_1.slam.x) + slamScale.lngPerY * (y - SLAM_REF_1.slam.y);
  return [lat, lng];
}

// ── Haversine distance (km) ──
function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// ── Sub-components ──
interface ClickHandlerProps { onMapClick: (lat: number, lng: number) => void; }
const ClickHandler: React.FC<ClickHandlerProps> = ({ onMapClick }) => {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
};

const FlyTo: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap();
  useEffect(() => { map.flyTo(position, 16, { duration: 1.2 }); }, [position, map]);
  return null;
};

// ── Main Component ──
const LeafletMap: React.FC = () => {
  const [wheelchairPos, setWheelchairPos] = useState<[number, number]>(DEFAULT_CENTER);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [originName, setOriginName] = useState('Main Gate');
  const [destName, setDestName] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [pathStatus, setPathStatus] = useState<'SAFE' | 'RECALCULATING'>('SAFE');

  // Distance & ETA
  const distance = destination ? haversine(wheelchairPos, destination) : 0;
  const etaMinutes = distance > 0 ? Math.ceil((distance / 3) * 60) : 0;

  // Handle destination dropdown
  const handleDestSelect = (name: string) => {
    const loc = CAMPUS_LOCATIONS.find(l => l.name === name);
    if (!loc) { setDestination(null); setDestName(''); return; }
    setDestName(name);
    const pos: [number, number] = [loc.lat, loc.lng];
    setDestination(pos);
    setFlyTarget(pos);
    setPathStatus('SAFE');
  };

  // Handle map click → set destination
  const handleMapClick = (lat: number, lng: number) => {
    if (isMoving) return;
    setDestination([lat, lng]);
    setDestName('Custom');
    setPathStatus('SAFE');
  };

  // Simulate movement
  const simulateMove = () => {
    if (!destination || isMoving) return;
    setIsMoving(true);
    setPathStatus('RECALCULATING');
    const steps = 60;
    let step = 0;
    const startLat = wheelchairPos[0];
    const startLng = wheelchairPos[1];
    const dLat = (destination[0] - startLat) / steps;
    const dLng = (destination[1] - startLng) / steps;

    const interval = setInterval(() => {
      step++;
      if (step <= steps) {
        setWheelchairPos([startLat + dLat * step, startLng + dLng * step]);
      } else {
        clearInterval(interval);
        setWheelchairPos(destination);
        setDestination(null);
        setDestName('');
        setIsMoving(false);
        setPathStatus('SAFE');
      }
    }, 50);
  };

  // ── Supabase Real-time Subscription ──
  useEffect(() => {
    const channel = supabase
      .channel('wheelchair-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wheelchair_status' },
        (payload) => {
          const { x, y } = payload.new as { x: number; y: number };
          const navPos = convertSlamToNav(x, y);
          setWheelchairPos(navPos);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'wheelchair_status' },
        (payload) => {
          const { x, y } = payload.new as { x: number; y: number };
          const navPos = convertSlamToNav(x, y);
          setWheelchairPos(navPos);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="bg-surface p-3.5 rounded-xl glow-border h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Navigation size={12} className="text-primary" />
          <h3 className="text-[9px] font-mono font-bold uppercase tracking-widest text-foreground">
            PATH_PLANNING & NAVIGATION
          </h3>
        </div>
        {destination && (
          <button
            onClick={simulateMove}
            disabled={isMoving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-primary text-[10px] font-mono font-bold hover:bg-primary/20 transition-all disabled:opacity-50"
          >
            <Play size={10} />
            {isMoving ? 'MOVING...' : 'TEST_MOVE'}
          </button>
        )}
      </div>

      {/* Origin / Destination Dropdowns */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-[8px] font-mono text-muted-foreground mb-1 block">ORIGIN</label>
          <select
            value={originName}
            onChange={(e) => setOriginName(e.target.value)}
            className="w-full h-8 px-2 bg-secondary rounded-lg text-[10px] font-mono text-foreground border-none outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
          >
            {CAMPUS_LOCATIONS.map(l => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[8px] font-mono text-muted-foreground mb-1 block">DESTINATION</label>
          <select
            value={destName}
            onChange={(e) => handleDestSelect(e.target.value)}
            className="w-full h-8 px-2 bg-secondary rounded-lg text-[10px] font-mono text-foreground border-none outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
          >
            <option value="">— Select —</option>
            {CAMPUS_LOCATIONS.map(l => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Widgets */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-background rounded-lg p-2 glow-border text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Clock size={9} className="text-primary" />
            <p className="text-[8px] font-mono text-muted-foreground">ETA</p>
          </div>
          <p className="text-sm font-mono text-primary font-bold">{etaMinutes > 0 ? `${etaMinutes} min` : '--'}</p>
        </div>
        <div className="bg-background rounded-lg p-2 glow-border text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Route size={9} className="text-primary" />
            <p className="text-[8px] font-mono text-muted-foreground">DISTANCE</p>
          </div>
          <p className="text-sm font-mono text-primary font-bold">{distance > 0 ? `${distance.toFixed(2)} km` : '--'}</p>
        </div>
        <div className="bg-background rounded-lg p-2 glow-border text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <ShieldCheck size={9} className={pathStatus === 'SAFE' ? 'text-accent' : 'text-amber-400'} />
            <p className="text-[8px] font-mono text-muted-foreground">PATH</p>
          </div>
          <p className={`text-sm font-mono font-bold ${pathStatus === 'SAFE' ? 'text-accent' : 'text-amber-400'}`}>
            {pathStatus}
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[280px] rounded-lg overflow-hidden glow-border relative z-0">
        <MapContainer
          center={wheelchairPos}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ClickHandler onMapClick={handleMapClick} />
          {flyTarget && <FlyTo position={flyTarget} />}

          <Marker position={wheelchairPos} icon={blueIcon}>
            <Popup><span className="font-mono text-xs font-bold">🦽 Wheelchair (WC-01)</span></Popup>
          </Marker>

          {destination && (
            <Marker position={destination} icon={redIcon}>
              <Popup><span className="font-mono text-xs font-bold">📍 Destination</span></Popup>
            </Marker>
          )}

          {destination && (
            <Polyline
              positions={[wheelchairPos, destination]}
              pathOptions={{ color: '#22D3EE', weight: 3, dashArray: '10, 6' }}
            />
          )}
        </MapContainer>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-background rounded-lg p-2 glow-border">
          <p className="text-[8px] font-mono text-muted-foreground mb-0.5">WHEELCHAIR_POS</p>
          <p className="text-[10px] font-mono text-primary font-bold">
            {wheelchairPos[0].toFixed(5)}, {wheelchairPos[1].toFixed(5)}
          </p>
        </div>
        <div className="bg-background rounded-lg p-2 glow-border">
          <p className="text-[8px] font-mono text-muted-foreground mb-0.5">DESTINATION</p>
          <p className="text-[10px] font-mono text-destructive font-bold">
            {destination ? `${destination[0].toFixed(5)}, ${destination[1].toFixed(5)}` : 'CLICK_MAP_TO_SET'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
