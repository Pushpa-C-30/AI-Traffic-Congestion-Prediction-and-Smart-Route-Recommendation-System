import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAnalytics } from '../services/api';

const defaultData = {
  traffic: { hourly: [], weekly: [], weather: [], vehicle_volume: [], heatmap: [], average_speed: [], data_note: 'Analytics data is unavailable.' },
  model: { best_model: 'unavailable', metrics: {} },
};

const pieColors = ['#22d3ee', '#a78bfa', '#fbbf24', '#f97316'];
const formatPercentage = (value) => (Number.isFinite(Number(value)) ? `${(Number(value) * 100).toFixed(2)}%` : 'N/A');
const heatColor = (value) => `hsl(${120 - Math.min(100, Math.max(0, value)) * 1.2} 78% 46%)`;

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(defaultData);

  useEffect(() => {
    fetchAnalytics()
      .then(({ data }) => {
        if (!data?.traffic) return;
        const modelMetrics = data.model?.metrics;
        const selectedMetrics = modelMetrics?.[data.model?.best_model] || modelMetrics;
        setAnalytics({
          ...defaultData,
          ...data,
          traffic: { ...defaultData.traffic, ...data.traffic },
          model: { ...defaultData.model, ...data.model, metrics: selectedMetrics || defaultData.model.metrics },
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="container page-spacer">
      <div className="page-top">
        <div>
          <span className="eyebrow">Analytics Dashboard</span>
          <h1>Performance and traffic intelligence</h1>
        </div>
      </div>

      <div className="stats-grid analytics-cards">
        <div className="card stat-card"><span>Model Accuracy · Synthetic validation</span><h3>{formatPercentage(analytics.model.metrics.accuracy)}</h3></div>
        <div className="card stat-card"><span>Precision</span><h3>{formatPercentage(analytics.model.metrics.precision)}</h3></div>
        <div className="card stat-card"><span>Recall</span><h3>{formatPercentage(analytics.model.metrics.recall)}</h3></div>
        <div className="card stat-card"><span>F1 Score</span><h3>{formatPercentage(analytics.model.metrics.f1)}</h3></div>
      </div>
      <p className="analytics-data-note">{analytics.traffic.data_note || 'Traffic data source unavailable.'} Model scores are validation results from generated training data, not real-world accuracy.</p>

      <div className="chart-grid">
        <div className="card chart-tile">
          <h3>Congestion by 4-hour period</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={analytics.traffic.hourly}>
              <defs><linearGradient id="colorValue" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} /><stop offset="95%" stopColor="#22d3ee" stopOpacity={0.1} /></linearGradient></defs>
              <CartesianGrid stroke="#22314b" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#c6d0e5" />
              <YAxis stroke="#c6d0e5" tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => [`${value}%`, 'Average congestion']} />
              <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-tile">
          <h3>Weekly average congestion</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.traffic.weekly}>
              <CartesianGrid stroke="#22314b" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#c6d0e5" />
              <YAxis stroke="#c6d0e5" tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => [`${value}%`, 'Average congestion']} />
              <Bar dataKey="value" fill="#7dd3fc" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-tile">
          <h3>Average congestion by weather</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={analytics.traffic.weather} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} fill="#8884d8" paddingAngle={4}>
                {analytics.traffic.weather.map((entry, index) => <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Average congestion']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-tile">
          <h3>Vehicle volume by 4-hour period</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={analytics.traffic.vehicle_volume}>
              <CartesianGrid stroke="#22314b" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#c6d0e5" />
              <YAxis stroke="#c6d0e5" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card heatmap-block">
        <h3>Traffic heatmap </h3>
        <div className="heatmap-legend" aria-label="Traffic intensity color scale">
          <span>Lower</span>
          <span className="heatmap-legend-scale" />
          <span>Higher</span>
        </div>
        <div className="heatmap-grid">
          <div className="heatmap-row heatmap-label-row"><span />{analytics.traffic.hourly.map((slot) => <span key={slot.time}>{slot.time}</span>)}</div>
          {analytics.traffic.weekly.map((day) => (
            <div key={day.day} className="heatmap-row">
              <span>{day.day}</span>
              {analytics.traffic.hourly.map((slot) => {
                const cell = analytics.traffic.heatmap.find((entry) => entry.day === day.day && entry.time === slot.time);
                const intensity = Number(cell?.value ?? 0);
                return <span key={`${day.day}-${slot.time}`} className="heat-cell" style={{ backgroundColor: heatColor(intensity), color: intensity > 58 ? '#fff' : '#10221b' }} title={`${day.day} ${slot.time}: ${intensity}% in generated training data`}>{intensity}%</span>;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
