// client/src/components/common/Input.jsx
import React from 'react';

const Input = ({ label, error, id, type = 'text', className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-300 focus:ring-rose-400 focus:border-rose-400'
            : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
};

export default Input;