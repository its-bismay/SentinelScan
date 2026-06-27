import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useScans } from '../hooks/useScans';
import axiosClient from '../api/axiosClient';
import SecurityScoreGauge from '../components/ui/SecurityScoreGauge';
import SeverityBadge from '../components/ui/SeverityBadge';
import VulnerabilityCard from '../components/findings/VulnerabilityCard';
import HeaderAnalysisTable from '../components/findings/HeaderAnalysisTable';
import CookieAnalysisTable from '../components/findings/CookieAnalysisTable';
import ReportViewer from '../components/reports/ReportViewer';
import { Shield, Sparkles, ChevronLeft, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ScanDetails = () => {
  const { id } = useParams();
  const { getScanDetails, loading, error } = useScans();
  const [scan, setScan] = useState(null);
  
  // Tabs: 'findings' | 'headers' | 'cookies' | 'ai-report'
  const [activeTab, setActiveTab] = useState('findings');
  
  // AI report state
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchScan = async () => {
    try {
      const data = await getScanDetails(id);
      if (data) {
        setScan(data);
        // Load report if scan is completed
        if (data.status === 'completed') {
          fetchReport();
        }
      }
    } catch (err) {
      toast.error('Failed to load scan details');
    }
  };

  const fetchReport = async () => {
    setLoadingReport(true);
    try {
      const res = await axiosClient.get(`/reports/${id}`);
      if (res.data?.success) {
        setReport(res.data.report);
      }
    } catch (err) {
      // It's normal for a report to not exist initially
    } finally {
      setLoadingReport(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    const loadToast = toast.loading('Running LLM pipeline to build AI report fixes...');
    try {
      const res = await axiosClient.post(`/reports/generate/${id}`);
      if (res.data?.success) {
        setReport(res.data.report);
        toast.success('AI Security Report compiled successfully!', { id: loadToast });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report', { id: loadToast });
    } finally {
      setGeneratingReport(false);
    }
  };

  useEffect(() => {
    fetchScan();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="alert alert-error flex gap-2 justify-between">
        <div className="flex gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{error || 'Scan not found.'}</span>
        </div>
        <Link to="/dashboard" className="btn btn-xs btn-outline">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Link to="/history" className="btn btn-ghost btn-xs gap-1 opacity-70 hover:opacity-100 p-0">
          <ChevronLeft className="h-4 w-4" />
          Back to Scan History
        </Link>
        <button onClick={fetchScan} className="btn btn-outline btn-xs gap-1.5 self-end md:self-auto">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Details
        </button>
      </div>

      {/* Hero Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col gap-4 justify-between bg-base-100 p-6 rounded-2xl border border-base-content/10 shadow-sm glass-panel">
          <div>
            <span className="text-3xs uppercase tracking-widest text-primary font-bold">Target Audit Summary</span>
            <h2 className="text-xl md:text-2xl font-black font-display text-base-content truncate mt-1">
              {scan.targetUrl}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`badge uppercase text-3xs font-semibold ${
                scan.status === 'completed' ? 'badge-success' : 'badge-neutral'
              }`}>
                {scan.status}
              </span>
              <span className="text-xs text-base-content/60">
                Created: {new Date(scan.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-base-200/50 p-3 rounded-xl border border-base-content/5 text-center">
              <span className="text-4xs uppercase tracking-widest text-base-content/50 font-bold block">Critical Risk</span>
              <span className="text-xl font-bold text-error mt-0.5">{scan.criticalCount || 0}</span>
            </div>
            <div className="bg-base-200/50 p-3 rounded-xl border border-base-content/5 text-center">
              <span className="text-4xs uppercase tracking-widest text-base-content/50 font-bold block">High Risk</span>
              <span className="text-xl font-bold text-red-400 mt-0.5">{scan.highCount || 0}</span>
            </div>
            <div className="bg-base-200/50 p-3 rounded-xl border border-base-content/5 text-center">
              <span className="text-4xs uppercase tracking-widest text-base-content/50 font-bold block">Medium Risk</span>
              <span className="text-xl font-bold text-warning mt-0.5">{scan.mediumCount || 0}</span>
            </div>
            <div className="bg-base-200/50 p-3 rounded-xl border border-base-content/5 text-center">
              <span className="text-4xs uppercase tracking-widest text-base-content/50 font-bold block">Low/Info</span>
              <span className="text-xl font-bold text-info mt-0.5">{(scan.lowCount || 0) + (scan.infoCount || 0)}</span>
            </div>
          </div>
        </div>

        <div className="h-full">
          <SecurityScoreGauge score={scan.score} grade={scan.grade} size="7.5rem" />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-box bg-base-100 p-1 rounded-xl border border-base-content/5 w-full overflow-x-auto flex-nowrap whitespace-nowrap">
        <button
          onClick={() => setActiveTab('findings')}
          className={`tab flex-1 font-semibold text-xs md:text-sm py-2 rounded-lg transition-colors ${
            activeTab === 'findings' ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content/75'
          }`}
        >
          Vulnerabilities ({scan.findings?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`tab flex-1 font-semibold text-xs md:text-sm py-2 rounded-lg transition-colors ${
            activeTab === 'headers' ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content/75'
          }`}
        >
          Security Headers
        </button>
        <button
          onClick={() => setActiveTab('cookies')}
          className={`tab flex-1 font-semibold text-xs md:text-sm py-2 rounded-lg transition-colors ${
            activeTab === 'cookies' ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content/75'
          }`}
        >
          Cookies
        </button>
        <button
          onClick={() => setActiveTab('ai-report')}
          className={`tab flex-1 font-semibold text-xs md:text-sm py-2 rounded-lg transition-colors gap-1.5 flex items-center justify-center ${
            activeTab === 'ai-report' ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content/75'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Assessment Report
        </button>
      </div>

      {/* Tab Panel Renderings */}
      <div className="flex flex-col gap-4 min-h-[250px]">
        {activeTab === 'findings' && (
          <div className="flex flex-col gap-3">
            {(!scan.findings || scan.findings.length === 0) ? (
              <div className="flex flex-col items-center justify-center p-8 bg-base-100 rounded-xl border border-base-content/5 text-center">
                <CheckCircle className="h-10 w-10 text-success mb-2" />
                <h4 className="font-bold text-success font-display">Scan Target Clean</h4>
                <p className="text-xs text-base-content/60 max-w-sm mt-0.5">
                  No automated crawler vulnerability signatures matched this target domain!
                </p>
              </div>
            ) : (
              scan.findings.map((f, idx) => <VulnerabilityCard key={f._id || idx} finding={f} />)
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <HeaderAnalysisTable findings={scan.findings} />
        )}

        {activeTab === 'cookies' && (
          <CookieAnalysisTable findings={scan.findings} />
        )}

        {activeTab === 'ai-report' && (
          <div className="flex flex-col gap-4">
            {report ? (
              <ReportViewer
                report={report}
                targetUrl={scan.targetUrl}
                findings={scan.findings}
                score={scan.score}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-10 bg-base-100 rounded-xl border border-base-content/5 text-center">
                <Sparkles className="h-10 w-10 text-primary mb-3 animate-pulse" />
                <h4 className="font-bold text-base-content font-display">Generate AI Audit Remediation</h4>
                <p className="text-xs text-base-content/60 max-w-md mt-1 mb-6 leading-relaxed">
                  Analyze scan findings with our Groq AI Engine to generate detailed risk impact reports and tailored, production-ready fix configurations.
                </p>
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport || scan.status !== 'completed'}
                  className="btn btn-primary text-primary-content gap-2"
                >
                  {generatingReport ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Build AI Security Report
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanDetails;
