import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

// Importing our high-fidelity pages
import Dashboard from '../pages/Dashboard';
import Income from '../pages/Income';
import Expenses from '../pages/Expenses';
import Transactions from '../pages/Transactions';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import TaxPlanning from '../pages/TaxPlanning';

/**
 * AppRouter Component
 * Uses HashRouter for Electron compatibility.
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
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/tax-planning" element={<TaxPlanning />} />
          <Route path="/settings" element={<Settings />} />

          {/* Fallback to Dashboard if route is not found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRouter;