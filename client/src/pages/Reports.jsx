import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { exportToCSV } from '../utils/exportUtils';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Download, Calendar, DollarSign, Target, TrendingUp, Users } from 'lucide-react';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  const fetchReport = async () => {
    setLoading(true);
    try {
      let startDate = new Date();
      if (dateRange === '7d') startDate.setDate(startDate.getDate() - 7);
      else if (dateRange === '30d') startDate.setDate(startDate.getDate() - 30);
      else if (dateRange === '90d') startDate.setDate(startDate.getDate() - 90);
      else if (dateRange === 'ytd') startDate = new Date(new Date().getFullYear(), 0, 1);

      const res = await reportService.getSummary({ startDate: startDate.toISOString() });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const handleExport = () => {
    if (!data) return;
    const exportData = [
      { Section: 'KPI', Label: 'Won Revenue', Value: data.wonRevenue || 0 },
      { Section: 'KPI', Label: 'Pipeline Value', Value: data.pipelineValue || 0 },
      { Section: 'KPI', Label: 'Win Rate', Value: `${data.winRate || 0}%` },
      { Section: 'KPI', Label: 'Lead Conversion Rate', Value: `${data.conversionRate || 0}%` },
      ...(data.repPerformance || []).map((rep) => ({ Section: 'Salesperson', Label: rep.user?.name || 'Unassigned', Value: `Deals: ${rep.totalDeals}; Pipeline: ${rep.totalValue}; Won: ${rep.wonValue}` })),
      ...(data.leadsBySource || []).map((item) => ({ Section: 'Lead Source', Label: item._id || 'Unspecified', Value: item.count })),
      ...(data.dealsByStage || []).map((item) => ({ Section: 'Deal Stage', Label: item._id, Value: `Deals: ${item.count}; Value: ${item.value}` })),
      ...(data.monthlyRevenue || []).map((item) => ({ Section: 'Monthly Revenue', Label: `${item._id.year}/${item._id.month}`, Value: item.revenue }))
    ];
    exportToCSV(exportData, `sales_report_${dateRange}.csv`);
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Executive Reports & Sales Intel</h2>
          <p className="text-xs text-slate-500 mt-0.5">Performance tracking and lead conversion metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Won Revenue</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">${(data?.wonRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Active Pipeline</p>
          <p className="text-2xl font-bold text-brand-600 mt-1">${(data?.pipelineValue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Deal Win Rate</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data?.winRate || 0}%</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Lead Conversion Rate</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{data?.conversionRate || 0}%</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Sales Representative Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2.5">Representative</th>
                <th className="px-4 py-2.5">Total Deals</th>
                <th className="px-4 py-2.5">Pipeline Value</th>
                <th className="px-4 py-2.5">Won Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.repPerformance?.map((rep, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold text-slate-800">{rep.user?.name || 'Unassigned'}</td>
                  <td className="px-4 py-3 text-slate-600">{rep.totalDeals}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">${rep.totalValue?.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">${rep.wonValue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 className="text-sm font-bold mb-3">Deals by Stage</h3>{data?.dealsByStage?.map((item) => <div key={item._id} className="flex justify-between text-sm py-1"><span className="capitalize">{item._id?.replace('_', ' ')}</span><span>{item.count} · ${item.value?.toLocaleString()}</span></div>)}</div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 className="text-sm font-bold mb-3">Lead Sources</h3>{data?.leadsBySource?.map((item) => <div key={item._id} className="flex justify-between text-sm py-1"><span>{item._id || 'Unspecified'}</span><span>{item.count}</span></div>)}</div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 className="text-sm font-bold mb-3">Monthly Revenue</h3>{data?.monthlyRevenue?.map((item) => <div key={`${item._id.year}-${item._id.month}`} className="flex justify-between text-sm py-1"><span>{item._id.year}/{item._id.month}</span><span>${item.revenue?.toLocaleString()}</span></div>)}</div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 className="text-sm font-bold mb-3">Customer Growth</h3>{data?.customerGrowth?.map((item) => <div key={`${item._id.year}-${item._id.month}`} className="flex justify-between text-sm py-1"><span>{item._id.year}/{item._id.month}</span><span>{item.count} new customers</span></div>)}</div>
      </div>
    </div>
  );
};

export default Reports;
