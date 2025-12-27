import React from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

/**
 * The Layout component serves as the structural wrapper for Jkeeping.
 * It ensures the Sidebar is always accessible while the AppRouter
 * injects page-specific content into the main scrollable area.
 */
const Layout = ({ children }) => {
  return (
    <div className={styles.appShell}>
      {/* Navigation sidebar remains fixed on the left */}
      <Sidebar />
      
      {/* Main content scrolls independently */}
      <main className={styles.mainContent}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;