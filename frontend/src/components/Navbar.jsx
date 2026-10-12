import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, MoonStar, SunMedium, X } from 'lucide-react';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Live Traffic', to: '/live-traffic' },
  { label: 'Predict', to: '/predict' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'About', to: '/about' },
  { label: 'History', to: '/history' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.body.classList.contains('dark-mode'));

  const toggleTheme = () => {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    document.body.classList.toggle('dark-mode', nextDarkMode);
    document.body.classList.toggle('light-mode', !nextDarkMode);
    window.localStorage.setItem('traffiq-theme', nextDarkMode ? 'dark' : 'light');
  };

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link to="/" className="brand logo">
          TRAFFIQ
        </Link>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} theme`} title={`Switch to ${darkMode ? 'light' : 'dark'} theme`}>
            {darkMode ? <SunMedium size={16} /> : <MoonStar size={16} />}
          </button>
          <Link to="/predict" className="primary-button small">
            Get Started
          </Link>
          <button className="menu-button" onClick={() => setMenuOpen((prev) => !prev)} aria-label="Menu">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
