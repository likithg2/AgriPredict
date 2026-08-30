import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', icon: Icon, className = '', ...props }) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClass} ${className}`}
      {...props}
    >
      {children}
      {Icon && <Icon size={18} />}
    </motion.button>
  );
};

export default Button;
