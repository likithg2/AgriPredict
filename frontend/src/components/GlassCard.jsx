import React, { useContext } from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-panel p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
