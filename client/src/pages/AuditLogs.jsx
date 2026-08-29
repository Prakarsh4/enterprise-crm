import React, { useState, useEffect } from 'react';
import { auditLogService } from '../services/auditLogService';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ action: '', entityType: '', actor: '' });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogService.getAll({ page, limit: 15, ...filters });
      setLogs(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const columns = [
    {
      header: 'Timestamp',
      render: (row) => <span className="text-xs text-slate-500">{new Date(row.createdAt).toLocaleString()}</span>
    },
    {
      header: 'Actor',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.actor?.name || 'System'}</div>
          <div className="text-[10px] text-slate-400">{row.actor?.email}</div>
        </div>
      )
    },
    {
      header: 'Action',
      render: (row) => <Badge variant="primary">{row.action}</Badge>
    },
    { header: 'Description', accessor: 'description' }
    ,{ header: 'Entity', render: (row) => <span className="text-xs text-slate-500">{row.entityType}{row.entityId ? ` · ${row.entityId}` : ''}</span> }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Security Audit Logs</h2>
        <p className="text-xs text-slate-500 mt-0.5">Immutable system audit trail tracking workspace actions</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input placeholder="Filter action" value={filters.action} onChange={(e) => { setPage(1); setFilters({ ...filters, action: e.target.value }); }} />
        <Input placeholder="Filter entity" value={filters.entityType} onChange={(e) => { setPage(1); setFilters({ ...filters, entityType: e.target.value }); }} />
        <Input placeholder="Filter actor ID" value={filters.actor} onChange={(e) => { setPage(1); setFilters({ ...filters, actor: e.target.value }); }} />
      </div>

      <Table columns={columns} data={logs} isLoading={loading} emptyMessage="No audit records logged" />
      <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
    </div>
  );
};

export default AuditLogs;
