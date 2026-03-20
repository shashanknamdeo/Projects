import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, delay = 0, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`pro-card p-4 md:p-5 ${hover ? 'hover:shadow-md hover:border-slate-300' : ''} ${className}`}
            onClick={onClick}
        >
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
};

export default Card;
