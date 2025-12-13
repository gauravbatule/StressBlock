import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import './styles/global.css';
import './styles/components.css';
import { BreathingPage } from './features/breathing/BreathingPage';
import { FocusPage } from './features/focus/FocusPage';
import { JournalPage } from './features/journal/JournalPage';
import { SleepPage } from './features/sleep/SleepPage';
import { GamesPage } from './features/games/GamesPage';

import { Dashboard } from './components/Dashboard';
import { Home, Wind, Timer, BookOpen, Moon, Brain } from 'lucide-react';

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/breathing', icon: Wind, label: 'Breathe' },
    { path: '/focus', icon: Timer, label: 'Focus' },
    { path: '/games', icon: Brain, label: 'Train' },
    { path: '/journal', icon: BookOpen, label: 'Mind' },
    { path: '/sleep', icon: Moon, label: 'Sleep' },
  ];

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '94%',
      maxWidth: '480px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 100,
      padding: '0 0.25rem',
      borderRadius: 'var(--radius-xl)',
    }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="nav-link"
            style={{
              color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
              background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              transition: 'all 0.2s ease',
              minWidth: '48px',
            }}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="app-shell">
      <main className="container" style={{ paddingTop: '1.5rem', paddingBottom: '7rem' }}>
        {/* Header */}
        <header style={{ marginBottom: isHome ? '2rem' : '1.5rem', textAlign: 'center' }}>
          <NavLink to="/">
            <h1 className="text-gradient" style={{
              fontSize: isHome ? '2.5rem' : '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              transition: 'font-size 0.3s ease'
            }}>
              StressBlock
            </h1>
          </NavLink>
          {isHome && (
            <p style={{
              color: 'var(--color-text-secondary)',
              marginTop: '0.5rem',
              fontSize: '1rem'
            }}>
              Your Mind, Reclaimed.
            </p>
          )}
        </header>

        {/* Main Content */}
        <div className="page-enter" style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/breathing" element={<BreathingPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/sleep" element={<SleepPage />} />
          </Routes>
        </div>
      </main>


      <Navigation />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
