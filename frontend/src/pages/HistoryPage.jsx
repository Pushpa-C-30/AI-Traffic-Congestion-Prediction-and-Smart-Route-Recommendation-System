import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { fetchHistory } from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchHistory()
      .then(({ data }) => {
        setHistory(data);
        setLoadError('');
      })
      .catch(() => setLoadError('Could not load saved prediction history.'));
  }, []);

  const filtered = history.filter((item) =>
    item.location.toLowerCase().includes(search.toLowerCase()) || item.predicted_level.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container page-spacer">
      <div className="page-top">
        <div>
          <span className="eyebrow">Prediction History</span>
          <h1>Traffic forecast records</h1>
        </div>
      </div>

      <div className="card history-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search location or level" />
        </div>
        <button className="secondary-button">Filter</button>
        <button className="secondary-button">Sort</button>
      </div>

      <div className="card history-table-wrap">
        {loadError && <p role="alert">{loadError}</p>}
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Location</th>
              <th>Predicted Level</th>
              <th>Congestion</th>
              <th>Delay</th>
              <th>Weather</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={`${row.date}-${row.location}`}>
                <td>{row.date}</td>
                <td>{row.location}</td>
                <td>{row.predicted_level}</td>
                <td>{row.congestion_percent}%</td>
                <td>{row.estimated_delay} min</td>
                <td>{row.weather}</td>
                <td><button type="button" className="table-button" onClick={() => setSelectedRecord(row)}>View Details</button></td>
              </tr>
            ))}
            {filtered.length === 0 && !loadError && (
              <tr>
                <td colSpan="7" className="history-empty">No saved predictions yet. Run a prediction and it will appear here.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRecord && (
        <div className="history-dialog-backdrop" onClick={() => setSelectedRecord(null)}>
          <section
            className="history-dialog card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panel-header">
              <div>
                <span className="eyebrow">Prediction Record</span>
                <h3 id="history-dialog-title">{selectedRecord.location}</h3>
              </div>
              <button type="button" className="icon-button" onClick={() => setSelectedRecord(null)} aria-label="Close details">
                <X size={18} />
              </button>
            </div>
            <dl className="history-detail-grid">
              <div><dt>Date</dt><dd>{selectedRecord.date || 'Not recorded'}</dd></div>
              <div><dt>Predicted traffic</dt><dd>{selectedRecord.predicted_level || 'Not recorded'}</dd></div>
              <div><dt>Congestion probability</dt><dd>{selectedRecord.congestion_percent ?? 'Not recorded'}{selectedRecord.congestion_percent != null ? '%' : ''}</dd></div>
              <div><dt>Estimated delay</dt><dd>{selectedRecord.estimated_delay != null ? `${selectedRecord.estimated_delay} min` : 'Not recorded'}</dd></div>
              <div><dt>Weather</dt><dd>{selectedRecord.weather || 'Not recorded'}</dd></div>
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}
