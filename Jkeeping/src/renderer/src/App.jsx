import { useApp } from './context/AppContext';
import './styles/globals.css';

function App() {
  const { theme, toggleTheme, fiscalYear } = useApp();

  return (
    <div className="app-container">
      <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <h1>Jkeeping {fiscalYear}</h1>
        <button onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </header>

      <main style={{ padding: '20px' }}>
        <div className="card">
          <h2>S-Corp Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome, Doctor. Your local data is secure.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;