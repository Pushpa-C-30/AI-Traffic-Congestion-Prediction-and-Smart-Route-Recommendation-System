export default function StatCard({ label, value, hint, accent = 'cyan' }) {
  return (
    <div className={`card stat-card accent-${accent}`}>
      <div className="stat-top">
        <span>{label}</span>
        <span className={`chip chip-${accent}`}>{hint}</span>
      </div>
      <h3>{value}</h3>
    </div>
  );
}
