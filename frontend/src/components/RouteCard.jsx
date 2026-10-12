export default function RouteCard({
  route,
  recommended = false,
  active = false,
  onViewRoute,
  onCompareRoute,
}) {
  return (
    <div className={`route-card card ${recommended ? 'recommended' : ''} ${active ? 'active' : ''}`}>
      <div className="route-header">
        <div>
          <strong>{route.name}</strong>
          {recommended && <span className="recommended-badge">Shortest road ETA</span>}
        </div>
      </div>

      <div className="route-meta">
        <span>{route.traffic == null ? route.traffic_label : `Traffic estimate: ${route.traffic}%`}</span>
        <span>Distance: {route.distance}</span>
      </div>

      <div className="route-meta">
        <span>Time: {route.time}</span>
        {route.delay ? <span>Delay: {route.delay}</span> : <span>Road-network ETA</span>}
      </div>

      {route.note && (
        <div className="route-note">
          {route.note}
        </div>
      )}

      <div className="route-actions">
        <button type="button" className="secondary-button" onClick={() => onViewRoute && onViewRoute(route)}>
          View Route
        </button>
        <button type="button" className="primary-button small" onClick={() => onCompareRoute && onCompareRoute(route)}>
          Compare Routes
        </button>
      </div>
    </div>
  );
}
