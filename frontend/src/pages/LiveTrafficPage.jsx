import { useEffect, useState } from 'react';
import { AlertCircle, Navigation, TrendingUp } from 'lucide-react';
import TrafficMap from '../components/TrafficMap';
import StatCard from '../components/StatCard';
import AlertCard from '../components/AlertCard';
import { fetchTrafficSummary } from '../services/api';

export default function LiveTrafficPage() {
  const [summary, setSummary] = useState({
    status: 'HIGH',
    network_congestion: 72,
    active_roads: 128,
    average_speed: 31,
    incidents: 7,
  });

  useEffect(() => {
    fetchTrafficSummary().then(({ data }) => setSummary(data)).catch(() => {});
  }, []);

  return (
    <div className="container page-spacer">
      <div className="page-top">
        <div>
          <span className="eyebrow">Live Traffic</span>
          <h1>Real-time city mobility</h1>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard label="Traffic Status" value={`${summary.network_congestion}% Network Congestion`} hint="Live" accent="cyan" />
        <StatCard label="Active Roads" value={`${summary.active_roads}`} hint="Active" accent="green" />
        <StatCard label="Average Speed" value={`${summary.average_speed} km/h`} hint="Speed" accent="amber" />
        <StatCard label="Incidents" value={`${summary.incidents}`} hint="Alerts" accent="red" />
      </section>

      <TrafficMap />

      <div className="split-grid two-up">
        <div className="card mini-panel">
          <div className="panel-header small-pad">
            <div>
              <span className="eyebrow">Network Health</span>
              <h3>Major corridors</h3>
            </div>
            <TrendingUp size={18} />
          </div>
          <ul className="list-surface">
            <li><span>Silk Board</span><strong>82%</strong></li>
            <li><span>Koramangala</span><strong>76%</strong></li>
            <li><span>Whitefield</span><strong>69%</strong></li>
            <li><span>Hebbal</span><strong>58%</strong></li>
          </ul>
        </div>

        <div className="card mini-panel">
          <div className="panel-header small-pad">
            <div>
              <span className="eyebrow">Alerts</span>
              <h3>High priority</h3>
            </div>
            <AlertCircle size={18} />
          </div>
          <div className="alert-stack compact">
            <AlertCard title="Road Work" message="Flyover repair causing lane reduction." delay={14} action="Use alternative access road." />
            <AlertCard title="Waterlogging" message="Low-lying junction near Domlur has reduced friction." delay={9} action="Avoid the underpass." />
          </div>
        </div>
      </div>
    </div>
  );
}
