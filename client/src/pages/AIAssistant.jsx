import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { useScans } from '../hooks/useScans';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Sparkles, AlertTriangle, ShieldCheck, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

const AIAssistant = () => {
  const { getScansList } = useScans();
  const [scans, setScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const fetchScans = async () => {
    try {
      const res = await getScansList();
      if (res?.success) {
        const completed = res.scans.filter(s => s.status === 'completed');
        setScans(completed);
        if (completed.length > 0) {
          setSelectedScanId(completed[0]._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load completed scans');
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  useEffect(() => {
    if (selectedScanId) {
      const found = scans.find(s => s._id === selectedScanId);
      setSelectedScan(found || null);
      // Reset chat history when scan context changes
      setChatHistory([]);
    }
  }, [selectedScanId, scans]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim() || !selectedScanId || sending) return;

    const userMessage = { role: 'user', content: question };
    setChatHistory((prev) => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion('');
    setSending(true);

    try {
      const res = await axiosClient.post('/reports/analyze', {
        scanId: selectedScanId,
        question: currentQuestion,
        chatHistory: chatHistory,
      });

      if (res.data?.success) {
        setChatHistory((prev) => [...prev, { role: 'assistant', content: res.data.answer }]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI Assistant failed to reply');
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Error: Failed to reach security intelligence network.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-base-content flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" />
            SentinelScan AI Copilot
          </h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            Query security remediation guides, request config snippets, and dissect vulnerabilities.
          </p>
        </div>

        {/* Scan Selector */}
        <div className="flex items-center gap-2 bg-base-100 p-2 rounded-xl border border-base-content/5 w-full md:w-auto">
          <span className="text-xs font-semibold text-base-content/60 whitespace-nowrap">Context target:</span>
          <select
            className="select select-bordered select-sm flex-1 md:flex-initial"
            value={selectedScanId}
            onChange={(e) => setSelectedScanId(e.target.value)}
            aria-label="Select scan context for AI assistant"
          >
            {scans.length === 0 ? (
              <option value="">No completed scans</option>
            ) : (
              scans.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.targetUrl.replace(/https?:\/\//, '')} ({s.score}%)
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {scans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-base-100 rounded-2xl border border-base-content/10 text-center">
          <AlertTriangle className="h-10 w-10 text-warning mb-2" />
          <h4 className="font-bold text-base-content font-display">No Completed Scans Available</h4>
          <p className="text-xs text-base-content/60 max-w-sm mt-0.5 mb-6">
            The AI Copilot needs scan details and findings from a finished scan to help with questions.
          </p>
          <button onClick={() => window.location.href = '/dashboard'} className="btn btn-primary text-primary-content btn-sm">
            Launch scan
          </button>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          {/* Left panel: selected scan overview metrics */}
          <div className="lg:col-span-1 bg-base-100 p-4 rounded-2xl border border-base-content/10 flex flex-col gap-4 overflow-y-auto glass-panel">
            <h3 className="font-bold text-xs uppercase tracking-wider text-base-content/60 flex items-center gap-1">
              <Terminal className="h-4 w-4" />
              <span>Target Specs</span>
            </h3>

            {selectedScan && (
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-base-200/50 rounded-xl border border-base-content/5">
                  <div className="text-4xs uppercase tracking-widest text-base-content/50 font-bold">Safety Level</div>
                  <div className="text-lg font-bold font-display mt-0.5 text-primary">{selectedScan.score}/100 ({selectedScan.grade})</div>
                </div>

                <div className="p-3 bg-base-200/50 rounded-xl border border-base-content/5 flex flex-col gap-2">
                  <div className="text-4xs uppercase tracking-widest text-base-content/50 font-bold">Issues Distribution</div>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-error">Critical</span>
                      <span>{selectedScan.criticalCount || 0}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-red-400">High</span>
                      <span>{selectedScan.highCount || 0}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-warning">Medium</span>
                      <span>{selectedScan.mediumCount || 0}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-info">Low</span>
                      <span>{selectedScan.lowCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-base-200/50 rounded-xl border border-base-content/5 flex flex-col gap-1">
                  <div className="text-4xs uppercase tracking-widest text-base-content/50 font-bold">Scope suggestions</div>
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      onClick={() => setQuestion(`Explain the critical findings in ${selectedScan.targetUrl.replace(/https?:\/\//, '')}`)}
                      className="btn btn-ghost btn-xs text-left justify-start hover:bg-base-200"
                    >
                      💡 Explain critical findings
                    </button>
                    <button
                      onClick={() => setQuestion('Show me how to fix the missing Content-Security-Policy header.')}
                      className="btn btn-ghost btn-xs text-left justify-start hover:bg-base-200"
                    >
                      💡 CSP header fix template
                    </button>
                    <button
                      onClick={() => setQuestion('How can I secure session cookies against cross-site scripting?')}
                      className="btn btn-ghost btn-xs text-left justify-start hover:bg-base-200"
                    >
                      💡 Secure session cookies
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Chat Container */}
          <div className="lg:col-span-3 flex flex-col h-full bg-base-100 rounded-2xl border border-base-content/10 shadow-sm overflow-hidden">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-base-200/20">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Bot className="h-12 w-12 text-primary/60 mb-2 animate-bounce" />
                  <h4 className="font-bold text-base-content font-display">SentinelScan Security Chat</h4>
                  <p className="text-xs text-base-content/60 max-w-sm mt-1">
                    Ask me questions about findings, remediation steps, or configuration patches for the selected scan.
                  </p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}>
                    <div className="chat-image avatar">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-base-300">
                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                      </div>
                    </div>
                    <div className={`chat-bubble text-sm leading-relaxed p-3 ${
                      msg.role === 'user' ? 'chat-bubble-primary text-primary-content' : 'chat-bubble-neutral text-neutral-content'
                    }`}>
                    <div className="prose prose-sm max-w-none text-inherit">
                        <ReactMarkdown
                          components={{
                            code: ({node, inline, children, ...props}) => (
                              inline
                                ? <code className="font-mono text-primary bg-base-300 px-1 rounded text-xs" {...props}>{children}</code>
                                : <pre className="bg-base-300 rounded-lg p-3 overflow-x-auto text-xs"><code className="font-mono" {...props}>{children}</code></pre>
                            ),
                            a: ({node, children, ...props}) => (
                              <a className="underline text-primary" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="chat chat-start">
                  <div className="chat-image avatar">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-base-300">
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="chat-bubble chat-bubble-neutral text-sm flex gap-2 items-center">
                    <span className="loading loading-dots loading-sm"></span>
                    <span className="text-xs opacity-75 font-semibold">Consulting threat intelligence network...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-base-300 border-t border-base-content/10 flex gap-2">
              <input
                type="text"
                placeholder="Ask about vulnerabilities, HSTS headers, SSL config..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={sending}
                className="input input-bordered flex-1 text-sm bg-base-100"
              />
              <button type="submit" disabled={sending || !question.trim()} className="btn btn-primary text-primary-content">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
