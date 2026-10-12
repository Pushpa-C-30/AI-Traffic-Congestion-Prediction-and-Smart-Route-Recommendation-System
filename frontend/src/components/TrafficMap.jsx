import { AlertCircle, MapPin, Route } from 'lucide-react';

const roads = [
  { id: 1, x: '12%', y: '22%', w: '35%', h: '8px', color: '#4ade80' },
  { id: 2, x: '36%', y: '28%', w: '18%', h: '8px', color: '#fbbf24' },
  { id: 3, x: '48%', y: '46%', w: '30%', h: '8px', color: '#f97316' },
  { id: 4, x: '18%', y: '50%', w: '36%', h: '8px', color: '#ef4444' },
  { id: 5, x: '52%', y: '70%', w: '25%', h: '8px', color: '#22c55e' },
];

const markers = [
  { x: '28%', y: '20%', label: 'A' },
  { x: '60%', y: '38%', label: 'B' },
  { x: '36%', y: '58%', label: 'C' },
  { x: '70%', y: '72%', label: 'D' },
];

export default function TrafficMap() {
  return (
    <div className="traffic-map-panel card">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Traffic Network</span>
          <h3>Urban traffic overview</h3>
        </div>
        <div className="legend-inline">
          <span><i className="dot green" />Free flow</span>
          <span><i className="dot yellow" />Moderate</span>
          <span><i className="dot orange" />Heavy</span>
          <span><i className="dot red" />Severe</span>
        </div>
      </div>

      <div className="traffic-map">
        <div className="map-grid" />
        {roads.map((road) => (
          <div
            key={road.id}
            className="road"
            style={{ left: road.x, top: road.y, width: road.w, height: road.h, background: road.color }}
          />
        ))}
        {markers.map((marker) => (
          <div key={marker.label} className="map-marker" style={{ left: marker.x, top: marker.y }}>
            <MapPin size={16} />
            <span>{marker.label}</span>
          </div>
        ))}
        <div className="traffic-alert-pill"><AlertCircle size={14} />7 active incidents</div>
        <div className="route-badge"><Route size={14} />Smart route active</div>
      </div>
    </div>
  );
}
