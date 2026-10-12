import { useState } from 'react';

const karnatakaPlaces = [
  'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar',
  'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag',
  'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara',
  'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Vijayapura', 'Yadgir',
  'Electronic City, Bengaluru', 'Whitefield, Bengaluru', 'Koramangala, Bengaluru', 'Indiranagar, Bengaluru',
  'Silk Board, Bengaluru', 'Hebbal, Bengaluru', 'MG Road, Bengaluru', 'Mangaluru', 'Hubballi', 'Dharwad',
  'Belagavi', 'Kalaburagi', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 'Udupi', 'Hassan',
];

export default function PredictionForm({ onSubmit, loading }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const now = new Date();
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    const time = [String(now.getHours()).padStart(2, '0'), String(now.getMinutes()).padStart(2, '0')].join(':');
    onSubmit({
      origin: origin.trim(),
      destination: destination.trim(),
      date,
      time,
      day: now.toLocaleDateString('en-US', { weekday: 'long' }),
      weather: 'Clear',
      temperature: 28,
      traffic_volume: 1200,
      average_speed: 30,
      holiday: false,
      accident: false,
      road_capacity: 2200,
    });
  };

  return (
    <form className="prediction-form card" onSubmit={handleSubmit}>
      <div className="grid-two">
        <label>
          <span>Starting location in Karnataka</span>
          <input name="origin" value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Area, city, or district" required minLength={2} list="karnataka-places" />
          <datalist id="karnataka-places">
            {karnatakaPlaces.map((place) => <option key={place} value={`${place}, Karnataka`} />)}
          </datalist>
        </label>
        <label>
          <span>Destination in Karnataka</span>
          <input name="destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Area, city, or district" required minLength={2} list="karnataka-places" />
        </label>
      </div>

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Predicting...' : 'PREDICT TRAFFIC'}
        </button>
      </div>
    </form>
  );
}
