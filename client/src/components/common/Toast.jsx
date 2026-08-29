// client/src/components/common/Toast.jsx
import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={18} />,
    error: <AlertCircle className="text-rose-500" size={18} />,
    info: <Info className="text-brand-500" size={18} />
  };

  const bgStyles = {
    success: 'border-emerald-200 bg-white shadow-lg',
    error: 'border-rose-200 bg-white shadow-lg',
    info: 'border-brand-200 bg-white shadow-lg'
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium text-slate-800 transition-all ${bgStyles[type]}`}
    >
      {icons[type]}
      <span>{message}</span>
      <button onClick={onClose} className="ml-3 text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;