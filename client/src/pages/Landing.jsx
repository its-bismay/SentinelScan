import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShieldAlert, Globe, Zap, ChevronRight, CheckCircle2, Lock, Eye, Server, BarChart3, Brain, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Animated terminal lines
const TERMINAL_LINES = [
  { text: '[SentinelScan] Engine v2.0 initialized', color: 'text-emerald-400', delay: 0 },
  { text: '[QUEUE] Scan job #491023 dispatched → worker pool', color: 'text-primary', delay: 400 },
  { text: '[CRAWLER] Target: https://target-app.io — depth 3', color: 'text-emerald-400', delay: 900 },
  { text: '[CRAWLER] Mapped 23 endpoints · 5 forms · 8 JS bundles', color: 'text-emerald-400', delay: 1400 },
  { text: '[SCANNER] Running 10 modules in parallel...', color: 'text-blue-400', delay: 1900 },
  { text: '[HEADERS] ✖ Content-Security-Policy: MISSING', color: 'text-red-400 font-bold', delay: 2400 },
  { text: '[COOKIES] ⚠ Session cookie lacks HttpOnly + Secure', color: 'text-yellow-400', delay: 2900 },
  { text: '[SSL] ✖ Certificate expires in 4 days', color: 'text-red-400 font-bold', delay: 3400 },
  { text: '[CORS] ⚠ Wildcard origin with credentials allowed', color: 'text-yellow-400', delay: 3900 },
  { text: '[AI] Generating remediation report via Groq LLM...', color: 'text-purple-400', delay: 4400 },
  { text: '[RESULT] Score: 54/100  Grade: C  Findings: 12', color: 'text-white font-bold', delay: 4900 },
];

const AnimatedTerminal = () => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers = TERMINAL_LINES.map((line, i) =>
      setTimeout(() => setVisibleCount(i + 1), line.delay)
    );
    // Loop animation
    const loopTimer = setTimeout(() => setVisibleCount(0), 7000);
    return () => { timers.forEach(clearTimeout); clearTimeout(loopTimer); };
  }, [visibleCount === 0 ? null : undefined]); // restart when reset to 0

  useEffect(() => {
    if (visibleCount === 0) {
      const timers = TERMINAL_LINES.map((line, i) =>
        setTimeout(() => setVisibleCount(i + 1), line.delay + 500)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [visibleCount]);

  return (
    <div className="mockup-browser border border-base-content/15 bg-neutral shadow-2xl w-full max-w-xl">
      <div className="mockup-browser-toolbar">
        <div className="input border border-base-content/10 font-mono text-xs opacity-70">
          https://sentinelscan.io/audit
        </div>
      </div>
      <div className="bg-[#0d1117] p-5 font-mono text-xs leading-relaxed flex flex-col gap-1.5 h-72 overflow-hidden">
        {TERMINAL_LINES.slice(0, visibleCount).map((line, i) => (
          <div key={i} className={`${line.color} animate-fade-in`}>
            {line.text}
          </div>
        ))}
        {visibleCount > 0 && visibleCount < TERMINAL_LINES.length && (
          <span className="text-emerald-400 animate-pulse">█</span>
        )}
      </div>
    </div>
  );
};

const FEATURES = [
  { icon: Shield,      title: 'Security Headers',   desc: 'Audit CSP, HSTS, X-Frame-Options, Referrer-Policy, and Permissions-Policy for every response.' },
  { icon: Globe,       title: 'Deep Crawling',       desc: 'Recursively maps up to 100 endpoints. Finds exposed admin panels, .git repos, and backup files.' },
  { icon: Lock,        title: 'SSL/TLS Analysis',    desc: 'Validates certificate chains, expiry dates, and insecure redirect patterns on your domain.' },
  { icon: Eye,         title: 'Cookie Inspector',    desc: 'Identifies session cookies missing Secure, HttpOnly, or SameSite flags across all domains.' },
  { icon: Server,      title: 'Info Leak Detection', desc: 'Detects server version banners, stack traces, and debug comments exposed in responses.' },
  { icon: Brain,       title: 'AI Remediation',      desc: 'Groq LLM analyzes findings and generates plain-English fixes with copy-paste code snippets.' },
  { icon: BarChart3,   title: 'Risk Scoring',        desc: 'CVSS-inspired scoring with A–F letter grades and severity breakdown across all findings.' },
  { icon: Zap,         title: 'Async Pipeline',      desc: 'Scans run as background jobs — no timeouts, no blocked requests, real-time SSE progress.' },
];

const STATS = [
  { value: '10+', label: 'Scan Modules' },
  { value: '100%', label: 'Async Processing' },
  { value: 'OWASP', label: 'Top 10 Mapped' },
  { value: 'AI', label: 'Powered Reports' },
];

const Landing = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col gap-20 py-8 md:py-16">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="flex flex-col lg:flex-row gap-12 items-center justify-between">
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left max-w-xl">
          <div className="inline-flex items-center gap-2 badge badge-primary px-3 py-1.5 font-semibold uppercase tracking-wider text-xs self-center lg:self-start">
            <span className="w-2 h-2 rounded-full bg-primary-content animate-pulse" />
            Enterprise Vulnerability Scanner
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-base-content leading-[1.1]">
            Secure Your Apps<br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Before Attackers Do
            </span>
          </h1>

          <p className="text-sm md:text-base text-base-content/70 leading-relaxed">
            SentinelScan runs 10 parallel security modules against your web targets — crawling, inspecting headers, cookies, SSL, CORS, and more — then delivers AI-written remediation reports in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn btn-primary px-8 text-primary-content gap-2 shadow-lg shadow-primary/20"
            >
              Start Scanning Free
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/about" className="btn btn-outline px-8 gap-2">
              How It Works
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-2">
            {['OWASP Mapped', 'CWE Tracked', 'AI Powered', 'Free to Use'].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {badge}
              </div>
            ))}
          </div>
        </div>

        {/* Animated terminal */}
        <div className="flex-1 flex justify-center lg:justify-end w-full">
          <AnimatedTerminal />
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center justify-center p-6 bg-base-100 rounded-2xl border border-base-content/10 shadow-sm text-center gap-1">
            <span className="text-3xl font-black font-display text-primary">{s.value}</span>
            <span className="text-xs uppercase tracking-widest font-semibold text-base-content/50">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Features grid ───────────────────────────────────────────────── */}
      <section className="flex flex-col gap-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold font-display text-base-content">
            Comprehensive Security Coverage
          </h2>
          <p className="text-sm text-base-content/60 mt-2">
            Every scanner runs independently in parallel — faster results, modular design, zero single points of failure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="card bg-base-100 border border-base-content/10 shadow-sm hover:border-primary/30 hover:shadow-primary/5 hover:shadow-md transition-all duration-300 p-5 flex flex-col gap-3"
              >
                <div className="p-2.5 bg-primary/10 text-primary w-fit rounded-xl">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-base-content font-display">{feat.title}</h3>
                <p className="text-xs text-base-content/60 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold font-display text-base-content">
            From URL to Report in Minutes
          </h2>
          <p className="text-sm text-base-content/60 mt-2">
            A streamlined 4-step pipeline handles everything from target discovery to AI analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          {[
            { step: '01', title: 'Submit Target', desc: 'Enter any public URL and configure scan depth, crawl limits, and headless browser options.' },
            { step: '02', title: 'Async Crawl',   desc: 'Inngest dispatches a background worker. Playwright and Cheerio recursively map all reachable endpoints.' },
            { step: '03', title: 'Parallel Scan', desc: '10 specialized modules run concurrently — headers, cookies, SSL, CORS, directories, info leaks, and more.' },
            { step: '04', title: 'AI Report',     desc: 'Groq LLM synthesizes all findings into an executive summary with prioritized fixes and code examples.' },
          ].map((item, i) => (
            <div key={item.step} className="relative flex flex-col items-center md:items-start gap-3 p-6">
              {/* Connector line */}
              {i < 3 && (
                <div className="hidden md:block absolute top-9 left-1/2 w-full h-px bg-gradient-to-r from-primary/40 to-transparent" />
              )}
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-black text-primary font-display text-sm shrink-0 relative z-10 bg-base-300">
                {item.step}
              </div>
              <h3 className="font-bold text-base text-base-content font-display">{item.title}</h3>
              <p className="text-xs text-base-content/60 leading-relaxed text-center md:text-left">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-base-200 to-accent/10 border border-primary/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top_left,_var(--color-primary)_0%,_transparent_60%)]" />
        <div className="max-w-lg relative z-10">
          <h3 className="text-2xl md:text-3xl font-bold font-display text-base-content">
            Ready to Harden Your Stack?
          </h3>
          <p className="text-sm text-base-content/70 mt-2">
            Join developers and security teams using SentinelScan to audit their web applications against OWASP's top vulnerability patterns.
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="btn btn-primary text-primary-content px-8 shadow-lg shadow-primary/20"
          >
            Get Started Free
          </Link>
          <Link to="/about" className="btn btn-outline px-8">
            Learn More
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
