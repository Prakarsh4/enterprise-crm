// client/src/components/common/Table.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const Table = ({ columns, data, isLoading, emptyMessage = 'No records found' }) => {
  if (isLoading) {
    return (
      <div className="py-16 flex justify-center items-center bg-white rounded-lg border border-slate-200">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200">
        <EmptyState title="No Data Available" description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75">
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIdx) => (
            <tr key={row._id || rowIdx} className="hover:bg-slate-50/80 transition-colors">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
