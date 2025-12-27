import React from 'react';
import AppRouter from './router';
import { AppProvider } from './context/AppContext';
import './styles/globals.css';

/**
 * App.jsx - The Entry Point of Jkeeping
 * * We wrap the entire application in the AppProvider to ensure that
 * theme control and fiscal year state are accessible in every component.
 * The AppRouter then takes over to handle the Layout and Page navigation.
 */
function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;