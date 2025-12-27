import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

// Importing our high-fidelity pages
import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';

/**
 * AppRouter Component
 * * Uses HashRouter for Electron compatibility.
 * All main routes are wrapped in the Layout component to maintain
 * a consistent sidebar and content area.
 */
const AppRouter = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Main Application Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

          {/* Fallback to Dashboard if route is not found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRouter;