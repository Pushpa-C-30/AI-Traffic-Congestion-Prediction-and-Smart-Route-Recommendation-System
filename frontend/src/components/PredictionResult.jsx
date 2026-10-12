export default function PredictionResult({ result }) {
  if (!result) return null;

  return (
    <div className="prediction-result card">
      <div className="result-head">
        <span className="eyebrow">Model Estimate · Demo Training Data</span>
        <h3>{result.traffic_level}</h3>
      </div>

      <div className="probability-block">
        <div className="percent-value">{result.congestion_probability}%</div>
        <div className="label-sub">Model confidence, not live traffic measurement</div>
      </div>

      <div className="result-stats grid-two">
        <div>
          <span>Estimated Speed</span>
          <strong>{result.estimated_speed} km/h</strong>
        </div>
        <div>
          <span>Expected Delay</span>
          <strong>{result.expected_delay} min</strong>
        </div>
        <div>
          <span>Traffic Volume</span>
          <strong>{result.traffic_volume} veh/hr</strong>
        </div>
        <div>
          <span>Recommendation</span>
          <strong>{result.recommendation}</strong>
        </div>
      </div>

      <div className="explanation-panel">
        <h4>Why is traffic high?</h4>
        <div className="reason-grid">
          {result.reasons.map((reason) => (
            <div key={reason.label} className="reason-card">
              <div className="reason-header">
                <span>{reason.label}</span>
                <strong>+{reason.impact}%</strong>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${reason.impact}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
