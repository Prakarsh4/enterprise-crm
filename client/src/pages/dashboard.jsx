// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardservice';
import { Users, UserCheck, DollarSign, Target, ArrowUpRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getStats();
        setData(res.data);
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  const kpis = data?.kpis || {
    totalLeads: 0,
    qualifiedLeads: 0,
    totalCustomers: 0,
    openDeals: 0,
    totalPipelineValue: 0
  };

  const statCards = [
    { title: 'Total Leads', value: kpis.totalLeads, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { title: 'Qualified Leads', value: kpis.qualifiedLeads, icon: Target, color: 'text-purple-600 bg-purple-50' },
    { title: 'Total Customers', value: kpis.totalCustomers, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Open Deals', value: kpis.openDeals, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
    {
      title: 'Pipeline Value',
      value: `$${Number(kpis.totalPipelineValue).toLocaleString()}`,
      icon: ArrowUpRight,
      color: 'text-brand-600 bg-brand-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Executive CRM Overview</h2>
        <p className="text-xs text-slate-500 mt-0.5">Real-time pipeline metrics and live operations summary</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">{card.title}</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Summary & Recent Activity Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Pipeline Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Pipeline by Stage</h3>
          <div className="space-y-3">
            {data?.stageSummary && data.stageSummary.length > 0 ? (
              data.stageSummary.map((stage) => (
                <div key={stage._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Badge variant="primary">{stage._id?.toUpperCase()}</Badge>
                    <span className="text-xs text-slate-500">{stage.count} deal(s)</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    ${Number(stage.totalValue).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No deal stage data found</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((act) => (
                <div key={act._id} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={act.completed ? 'success' : 'warning'}>{act.type.toUpperCase()}</Badge>
                      <span className="text-xs font-semibold text-slate-800">{act.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Assigned to: {act.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(act.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No recent activity logged</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;