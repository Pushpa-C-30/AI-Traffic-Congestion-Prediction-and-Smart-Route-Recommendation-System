import { AlertTriangle } from 'lucide-react';

export default function AlertCard({ title, message, delay, action }) {
  return (
    <div className="alert-card card">
      <div className="alert-header">
        <AlertTriangle size={18} />
        <h4>{title}</h4>
      </div>
      <p>{message}</p>
      <div className="alert-meta">
        <span>Expected delay: +{delay} minutes</span>
        <span>Suggested action: {action}</span>
      </div>
    </div>
  );
}
