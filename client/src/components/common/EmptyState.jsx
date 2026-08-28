// client/src/components/common/EmptyState.jsx
import React from 'react';
import { Layers } from 'lucide-react';

const EmptyState = ({ title = 'No records found', description = 'Get started by creating a new entry.', action }) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <Layers size={22} />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;