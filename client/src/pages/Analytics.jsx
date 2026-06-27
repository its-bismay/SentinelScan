import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { StatsSkeleton } from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie } from 'recharts';
import { BarChart3, AlertOctagon, TrendingUp, ShieldCheck, ShieldAlert, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/analytics');
      if (res.data?.success) {
        setData(res.data.analytics);
      }
    } catch (err) {
      toast.error('Failed to load analytics dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-base-content">Security Analytics</h2>
          <p className="text-xs text-base-content/60 mt-0.5">Fetching aggregated statistics and vulnerabilities trends...</p>
        </div>
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <div className="skeleton h-80 rounded-2xl"></div>
          <div className="skeleton h-80 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!data || data.totalScans === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-base-content">Security Analytics</h2>
          <p className="text-xs text-base-content/60 mt-0.5">Understand vulnerability vectors across all target applications.</p>
        </div>
        <EmptyState
          title="No Scanning Data Found"
          description="Submit and finish security scans on your targets to display safety analytics."
          icon={BarChart3}
        />
      </div>
    );
  }

  // Format trend data for LineChart
  const trendData = data.trend.map((t) => ({
    date: new Date(t._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Scans: t.count,
    Score: Math.round(t.avgScore),
  }));

  // Format top findings for BarChart
  const topFindingsData = data.topFindings.map((f) => ({
    name: f._id.length > 20 ? `${f._id.substring(0, 20)}...` : f._id,
    count: f.count,
    severity: f.severity,
  }));

  // Pie chart data for severity
  const severityPieData = [
    { name: 'Critical', value: data.severityTotals.critical || 0, color: '#f87171' },
    { name: 'High', value: data.severityTotals.high || 0, color: '#ef4444' },
    { name: 'Medium', value: data.severityTotals.medium || 0, color: '#fbbf24' },
    { name: 'Low', value: data.severityTotals.low || 0, color: '#60a5fa' },
    { name: 'Info', value: data.severityTotals.info || 0, color: '#9ca3af' },
  ].filter(item => item.value > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold font-display text-base-content">
          Security Analytics Dashboard
        </h2>
        <p className="text-xs text-base-content/60 mt-0.5">
          Global threat summary and vulnerability trending telemetry.
        </p>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-base-100 border border-base-content/10 p-5 flex flex-row items-center justify-between shadow-sm">
          <div>
            <span className="text-4xs uppercase tracking-widest font-bold text-base-content/50">Cumulative Audits</span>
            <h4 className="text-2xl font-black font-display text-base-content mt-1">{data.totalScans}</h4>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="card bg-base-100 border border-base-content/10 p-5 flex flex-row items-center justify-between shadow-sm">
          <div>
            <span className="text-4xs uppercase tracking-widest font-bold text-base-content/50">Average Safety Score</span>
            <h4 className="text-2xl font-black font-display text-base-content mt-1">{data.avgScore}%</h4>
          </div>
          <div className="p-3 rounded-xl bg-success/10 text-success">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="card bg-base-100 border border-base-content/10 p-5 flex flex-row items-center justify-between shadow-sm">
          <div>
            <span className="text-4xs uppercase tracking-widest font-bold text-base-content/50">Total Vulnerabilities</span>
            <h4 className="text-2xl font-black font-display text-error mt-1">
              {(data.severityTotals.critical || 0) + (data.severityTotals.high || 0) + (data.severityTotals.medium || 0)}
            </h4>
          </div>
          <div className="p-3 rounded-xl bg-error/10 text-error">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        <div className="card bg-base-100 border border-base-content/10 p-5 flex flex-row items-center justify-between shadow-sm">
          <div>
            <span className="text-4xs uppercase tracking-widest font-bold text-base-content/50">Secured Endpoints</span>
            <h4 className="text-2xl font-black font-display text-success mt-1">{data.completedScans}</h4>
          </div>
          <div className="p-3 rounded-xl bg-success/10 text-success">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Chart Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LineChart: Score Progress */}
        <div className="card bg-base-100 border border-base-content/10 p-5 shadow-sm">
          <h3 className="card-title text-sm font-bold uppercase tracking-wider text-base-content/70 mb-4">
            Security score trend (Last 30 Days)
          </h3>
          <div className="h-64">
            {trendData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-base-content/40 italic">
                Insufficient temporal metrics data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fill: 'currentColor', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'currentColor', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#2a323c', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="Score" stroke="#00d897" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* BarChart: Recurrent Findings */}
        <div className="card bg-base-100 border border-base-content/10 p-5 shadow-sm">
          <h3 className="card-title text-sm font-bold uppercase tracking-wider text-base-content/70 mb-4">
            Top Recurring Security Issues
          </h3>
          <div className="h-64">
            {topFindingsData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-base-content/40 italic">
                No security findings available to chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFindingsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'currentColor', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#2a323c', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]}>
                    {topFindingsData.map((entry, index) => {
                      const colors = { critical: '#f87171', high: '#ef4444', medium: '#fbbf24' };
                      const severity = entry.severity?.toLowerCase();
                      return <Cell key={`cell-${index}`} fill={colors[severity] || '#60a5fa'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* PieChart: Severity Distribution */}
        <div className="card bg-base-100 border border-base-content/10 p-5 shadow-sm lg:col-span-2 flex flex-col md:flex-row items-center gap-6 justify-around">
          <div className="text-center md:text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/70 mb-1">
              Global Vulnerabilities Distribution
            </h3>
            <p className="text-xs text-base-content/50 max-w-xs">
              Vulnerability counts aggregated by severity rating across all active client targets.
            </p>
            
            {/* List labels */}
            <div className="flex flex-col gap-2 mt-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-error" />
                <span>Critical / High: {(data.severityTotals.critical || 0) + (data.severityTotals.high || 0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-warning" />
                <span>Medium Risk: {data.severityTotals.medium || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-info" />
                <span>Low Risk: {data.severityTotals.low || 0}</span>
              </div>
            </div>
          </div>

          <div className="w-48 h-48 relative">
            {severityPieData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-base-content/40 italic">
                No issues found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#2a323c', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className="text-3xs uppercase tracking-widest text-base-content/50">Total</span>
              <span className="text-2xl font-black">
                {Object.values(data.severityTotals).reduce((sum, v) => sum + (v || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
