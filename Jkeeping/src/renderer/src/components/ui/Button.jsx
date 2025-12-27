import React from 'react';
import styles from './Button.module.css';

/**
 * Button Component
 * A reusable, flexible button following the Apple design system.
 * * @param {string} variant - 'primary', 'secondary', or 'outline'
 * @param {string} size - 'sm', 'md', 'lg'
 */
const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  icon
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;