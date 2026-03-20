import React from 'react';

const Select = ({ label, name, options, icon: Icon, value, onChange, required = false, className = '', selectClassName = '' }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group transition-all duration-300">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10 pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`pro-input ${Icon ? 'pl-11' : 'pl-4'} pr-10 appearance-none bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 w-full ${selectClassName}`}
                >
                    <option value="" disabled className="bg-slate-900">{`Select ${label}`}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-900">
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
            </div>
        </div>
    );
};

export default Select;
