import { useState } from 'react';
import PredictionForm from '../components/PredictionForm';
import PredictionResult from '../components/PredictionResult';
import RouteCard from '../components/RouteCard';
import { fetchRouteAlternatives, predictTraffic } from '../services/api';

export default function PredictPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [routeError, setRouteError] = useState('');
  const [predictionError, setPredictionError] = useState('');
  const [routeView, setRouteView] = useState('detail');
  const [selectedRoute, setSelectedRoute] = useState(null);

  const handlePredict = async (payload) => {
    setLoading(true);
    setResult(null);
    setRoutes([]);
    setRouteError('');
    setPredictionError('');
    const { origin, destination, ...predictionContext } = payload;
    const [predictionResponse, routeResponse] = await Promise.allSettled([
      predictTraffic({ ...predictionContext, location: origin }),
      fetchRouteAlternatives({ origin, destination }),
    ]);

    if (predictionResponse.status === 'fulfilled') {
      setResult(predictionResponse.value.data);
    }
    if (routeResponse.status === 'fulfilled') {
      const availableRoutes = routeResponse.value.data.routes.map((route) => ({
        ...route,
        traffic: null,
        traffic_label: 'Live traffic unavailable',
        distance: `${route.distance_km} km`,
        time: `${route.duration_minutes} min`,
        delay: null,
        note: `Road-network route from ${routeResponse.value.data.origin} to ${routeResponse.value.data.destination}. ETA does not include live congestion.`,
      }));
      setRoutes(availableRoutes);
      setSelectedRoute(availableRoutes[0] || null);
    } else {
      setRouteError(routeResponse.reason.response?.data?.detail || 'Could not calculate routes. Check the place names and internet connection.');
    }
    if (predictionResponse.status === 'rejected') {
      console.error(predictionResponse.reason);
      setPredictionError('The model prediction is unavailable right now. Route distance and ETA may still be shown below.');
    }
    setLoading(false);
  };

  const showRouteResult = (route, view) => {
    setSelectedRoute(route);
    setRouteView(view);
    requestAnimationFrame(() => document.getElementById('route-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div className="container page-spacer">
      <div className="page-top">
        <div>
          <span className="eyebrow">AI Traffic Prediction</span>
          <h1>Predict congestion before you leave</h1>
        </div>
      </div>

      <div className="predict-layout">
        <PredictionForm onSubmit={handlePredict} loading={loading} />
        <PredictionResult result={result} />
      </div>

      {predictionError && <p className="route-error" role="alert">{predictionError}</p>}
      {routeError && <p className="route-error" role="alert">{routeError}</p>}

      {routes.length > 0 && (
        <section id="route-results" className="route-recommendations">
          <div className="section-header">
            <div>
              <span className="eyebrow">OpenStreetMap road routing</span>
              <h2>Route alternatives</h2>
              <p className="route-data-note">Road-network distances and estimated times. Live congestion data is not connected.</p>
            </div>
          </div>
          <div className="route-list recommendation-route-list">
            {routes.map((route, index) => (
              <RouteCard
                key={route.name}
                route={route}
                recommended={index === 0}
                active={selectedRoute?.name === route.name}
                onViewRoute={(item) => showRouteResult(item, 'detail')}
                onCompareRoute={(item) => showRouteResult(item, 'compare')}
              />
            ))}
          </div>
          {selectedRoute && (
            <div className="card route-result-panel" aria-live="polite">
              <span className="eyebrow">{routeView === 'compare' ? 'Route comparison' : 'Route details'}</span>
              <h3>{routeView === 'compare' ? `Compare ${routes.length} available alternatives` : selectedRoute.name}</h3>
              {routeView === 'detail' ? (
                <>
                  <p>{selectedRoute.note}</p>
                  <div className="route-focus-metrics">
                    <span>Distance: {selectedRoute.distance}</span>
                    <span>Road-network ETA: {selectedRoute.time}</span>
                    <span>{selectedRoute.traffic_label}</span>
                  </div>
                </>
              ) : (
                <div className="route-insight-grid">
                  {routes.map((route) => (
                    <div key={route.name} className="route-insight-card">
                      <strong>{route.name}</strong>
                      <span>Distance: {route.distance}</span>
                      <span>Road-network ETA: {route.time}</span>
                      <span>{route.traffic_label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
