import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, type = "button", disabled = false, className = "", icon: Icon, variant = "primary" }) => {
    const baseClass = "flex items-center justify-center space-x-2 transition-all duration-200 outline-none";
    
    const variants = {
        primary: "pro-button-primary",
        secondary: "pro-button-secondary",
        ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg font-medium"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClass} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span className="flex items-center space-x-2">
                <span>{children}</span>
                {Icon && <Icon size={18} />}
            </span>
        </motion.button>
    );
};

export default Button;
