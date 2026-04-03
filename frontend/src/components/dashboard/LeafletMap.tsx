import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Play, MapPin } from 'lucide-react';
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
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Default center (Cairo University area as example)
const DEFAULT_CENTER: [number, number] = [30.0131, 31.2089];

interface ClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

const ClickHandler: React.FC<ClickHandlerProps> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LeafletMap: React.FC = () => {
  const [wheelchairPos, setWheelchairPos] = useState<[number, number]>(DEFAULT_CENTER);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const animRef = useRef<number | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    if (isMoving) return;
    setDestination([lat, lng]);
  };

  const simulateMove = () => {
    if (!destination || isMoving) return;
    setIsMoving(true);

    const steps = 60;
    let step = 0;
    const startLat = wheelchairPos[0];
    const startLng = wheelchairPos[1];
    const dLat = (destination[0] - startLat) / steps;
    const dLng = (destination[1] - startLng) / steps;

    const move = () => {
      step++;
      if (step <= steps) {
        setWheelchairPos([startLat + dLat * step, startLng + dLng * step]);
        animRef.current = requestAnimationFrame(move);
      } else {
        setWheelchairPos(destination);
        setDestination(null);
        setIsMoving(false);
      }
    };

    // Use slower interval for visible movement
    const interval = setInterval(() => {
      step++;
      if (step <= steps) {
        setWheelchairPos([startLat + dLat * step, startLng + dLng * step]);
      } else {
        clearInterval(interval);
        setWheelchairPos(destination);
        setDestination(null);
        setIsMoving(false);
      }
    }, 50);
  };

  return (
    <div className="bg-surface p-3.5 rounded-xl glow-border h-full flex flex-col">
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

          {/* Wheelchair marker (blue) */}
          <Marker position={wheelchairPos} icon={blueIcon}>
            <Popup>
              <span className="font-mono text-xs font-bold">🦽 Wheelchair (WC-01)</span>
            </Popup>
          </Marker>

          {/* Destination marker (red) */}
          {destination && (
            <Marker position={destination} icon={redIcon}>
              <Popup>
                <span className="font-mono text-xs font-bold">📍 Destination</span>
              </Popup>
            </Marker>
          )}

          {/* Polyline */}
          {destination && (
            <Polyline
              positions={[wheelchairPos, destination]}
              pathOptions={{ color: '#22D3EE', weight: 3, dashArray: '10, 6' }}
            />
          )}
        </MapContainer>
      </div>

      {/* Coordinates Info */}
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
            {destination
              ? `${destination[0].toFixed(5)}, ${destination[1].toFixed(5)}`
              : 'CLICK_MAP_TO_SET'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
