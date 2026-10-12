import { useEffect, useState } from 'react';
import { ArrowRight, CloudRain, Gauge, Route, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AlertCard from '../components/AlertCard';
import StatCard from '../components/StatCard';
import TrafficMap from '../components/TrafficMap';
import { fetchTrafficSummary } from '../services/api';

const defaultStats = [
  { label: 'Traffic Status', value: '72% Network Congestion', hint: 'Live', accent: 'cyan' },
  { label: 'Active Roads', value: '128', hint: 'Roads', accent: 'green' },
  { label: 'Average Speed', value: '31 km/h', hint: 'Speed', accent: 'amber' },
  { label: 'Incidents', value: '7', hint: 'Alerts', accent: 'red' },
];

export default function LandingPage() {
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    fetchTrafficSummary()
      .then(({ data }) => {
        setStats([
          { label: 'Traffic Status', value: `${data.network_congestion}% Network Congestion`, hint: 'Live', accent: 'cyan' },
          { label: 'Active Roads', value: String(data.active_roads), hint: 'Roads', accent: 'green' },
          { label: 'Average Speed', value: `${data.average_speed} km/h`, hint: 'Speed', accent: 'amber' },
          { label: 'Incidents', value: String(data.incidents), hint: 'Alerts', accent: 'red' },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="container">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">AI Traffic Intelligence</span>
          <h1>Predict Traffic Before You Travel.</h1>
          <p>
            AI-powered traffic intelligence that predicts congestion, analyzes road patterns,
            and recommends smarter travel decisions.
          </p>
          <div className="cta-row">
            <Link to="/predict" className="primary-button">
              Predict Traffic <ArrowRight size={16} />
            </Link>
            <Link to="/analytics" className="secondary-button">
              Explore Analytics
            </Link>
          </div>
          <div className="hero-metrics">
            <div>
              <strong>4.9/5</strong>
              <span>Decision confidence</span>
            </div>
            <div>
              <strong>18 min</strong>
              <span>Median delay reduction</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <TrafficMap />
        </div>
      </section>

      <section className="stats-grid">
        {stats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} hint={item.hint} accent={item.accent} />
        ))}
      </section>

      <section className="feature-row">
        <div className="feature-card card">
          <Sparkles size={18} />
          <h3>AI Forecasting</h3>
          <p>Predict congestion probabilities using real traffic patterns and weather factors.</p>
        </div>
        <div className="feature-card card">
          <Gauge size={18} />
          <h3>Live Monitoring</h3>
          <p>Track active roads, incidents, and network health across the city in real-time.</p>
        </div>
        <div className="feature-card card">
          <Route size={18} />
          <h3>Smart Routes</h3>
          <p>Compare route options and automatically recommend the fastest low-congestion path.</p>
        </div>
        <div className="feature-card card">
          <CloudRain size={18} />
          <h3>Weather Impact</h3>
          <p>See how rainfall, storms, and conditions influence traffic intensity.</p>
        </div>
      </section>

      <section className="alert-stack card landing-alerts">
          <AlertCard
            title="Traffic Alert"
            message="Heavy congestion detected around Silk Board."
            delay={18}
            action="Consider an alternate route."
          />
          <AlertCard
            title="Weather Alert"
            message="Rainfall is increasing delays in central corridors."
            delay={11}
            action="Leave 15 minutes earlier."
          />
      </section>
    </div>
  );
}
