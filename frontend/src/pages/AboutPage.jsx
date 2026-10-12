import { Activity, BrainCircuit, Cpu, Route, Zap } from 'lucide-react';

const steps = [
  'Traffic data is collected from simulated records and historical trends.',
  'The model preprocesses the data and encodes categorical variables.',
  'Algorithms compare their performance and choose the best model.',
  'Explainability identifies the top reasons behind each forecast.',
];

export default function AboutPage() {
  return (
    <div className="container page-spacer about-page">
      <div className="page-top">
        <div>
          <span className="eyebrow">About TRAFFIQ</span>
          <h1>Smart-city AI for better mobility decisions</h1>
        </div>
      </div>

      <section className="about-grid">
        <div className="card about-card">
          <h3>Project Overview</h3>
          <p>
            TRAFFIQ is designed to help commuters, planners, and city agencies predict congestion,
            understand why traffic is rising, and choose the fastest possible route.
          </p>
        </div>
        <div className="card about-card">
          <h3>How AI Works</h3>
          <p>
            The system learns from historical traffic conditions, vehicle volumes, weather, peak-hour patterns,
            and incident data to estimate future congestion levels.
          </p>
        </div>
      </section>

      <section className="card pipeline-card">
        <h3>Machine Learning Pipeline</h3>
        <div className="pipeline-steps">
          {steps.map((step, index) => (
            <div key={step} className="pipeline-step">
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-row about-features">
        <div className="feature-card card">
          <BrainCircuit size={18} />
          <h3>ML Models</h3>
          <p>Random Forest, Decision Tree, and Gradient Boosting are tested and compared.</p>
        </div>
        <div className="feature-card card">
          <Cpu size={18} />
          <h3>Explainability</h3>
          <p>Feature importance helps explain why congestion is predicted to rise.</p>
        </div>
        <div className="feature-card card">
          <Route size={18} />
          <h3>Route Logic</h3>
          <p>Alternatives are ranked using travel delay, volume, and current traffic conditions.</p>
        </div>
        <div className="feature-card card">
          <Zap size={18} />
          <h3>Future scope</h3>
          <p>Ready for Google Maps, Mapbox, CCTV, IoT sensors, and real-time APIs.</p>
        </div>
      </section>
    </div>
  );
}
