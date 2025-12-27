import React from 'react';
import styles from './StatCard.module.css';

const StatCard = ({ title, value, trend, subtitle }) => (
  <div className={styles.card}>
    <h4 className={styles.title}>{title}</h4>
    <div className={styles.value}>{value}</div>
    <div className={styles.meta}>
      <span className={trend >= 0 ? styles.positive : styles.negative}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </span>
      <span className={styles.subtitle}>{subtitle}</span>
    </div>
  </div>
);

export default StatCard;