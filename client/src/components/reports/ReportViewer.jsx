import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, FileJson, FileText, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const ReportViewer = ({ report, targetUrl, findings = [], score }) => {
  const reportRef = useRef(null);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    const loadToast = toast.loading('Compiling and generating PDF report...');
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(width / imgWidth, height / imgHeight);
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`SentinelScan_Report_${targetUrl.replace(/https?:\/\//, '').replace(/\//g, '_')}.pdf`);
      toast.success('PDF report downloaded successfully!', { id: loadToast });
    } catch (err) {
      toast.error('Failed to generate PDF report', { id: loadToast });
    }
  };

  const downloadJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ targetUrl, score, findings, report }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `SentinelScan_Export_${targetUrl.replace(/https?:\/\//, '').replace(/\//g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('JSON export downloaded successfully!');
    } catch (err) {
      toast.error('Failed to export JSON');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Action Controls */}
      <div className="flex justify-end gap-2">
        <button onClick={downloadJSON} className="btn btn-outline btn-sm gap-1.5">
          <FileJson className="h-4 w-4" />
          <span>Export JSON</span>
        </button>
        <button onClick={downloadPDF} className="btn btn-primary btn-sm gap-1.5 text-primary-content">
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Report Canvas */}
      <div 
        ref={reportRef} 
        className="bg-base-100 p-6 md:p-8 rounded-2xl border border-base-content/10 shadow-lg text-base-content max-w-4xl mx-auto w-full glass-panel"
      >
        {/* Document Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-base-content/10 mb-6 gap-4">
          <div>
            <span className="text-3xs uppercase tracking-widest text-primary font-bold">Security Assessment Report</span>
            <h1 className="text-xl md:text-2xl font-black font-display tracking-tight text-base-content mt-1">
              SentinelScan Executive Audit
            </h1>
            <p className="text-xs text-base-content/60 mt-1">
              Target application URL: <strong className="font-mono text-primary">{targetUrl}</strong>
            </p>
          </div>
          <div className="bg-base-200/50 px-4 py-2 rounded-xl border border-base-content/5 text-center">
            <span className="text-4xs uppercase tracking-widest font-semibold block text-base-content/50">Overall Score</span>
            <span className="text-lg md:text-xl font-bold font-display">{score}/100</span>
          </div>
        </div>

        {/* AI report content */}
        <div className="prose prose-sm md:prose-base max-w-none text-base-content/95 prose-headings:font-display prose-headings:font-bold prose-headings:text-base-content prose-strong:text-base-content prose-code:font-mono prose-code:text-primary prose-a:text-primary leading-relaxed flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-primary font-semibold text-sm border-b border-base-content/5 pb-2">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Security Assistant Summary</span>
          </div>
          <ReactMarkdown className="markdown-body">
            {report?.aiAnalysis || 'No intelligence analysis exists for this scan.'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;
