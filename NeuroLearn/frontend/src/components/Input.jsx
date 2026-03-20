import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, name, type = 'text', icon: Icon, placeholder, value, onChange, required = false, className = '', inputClassName = '', minLength, maxLength, pattern, title, "data-date": dataDate }) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group transition-all duration-300">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    minLength={minLength}
                    maxLength={maxLength}
                    pattern={pattern}
                    title={title}
                    data-date={dataDate}
                    className={`pro-input ${Icon ? 'pl-11' : 'pl-4'} ${type === 'password' ? 'pr-11' : 'pr-4'} ${inputClassName}`}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Input;
