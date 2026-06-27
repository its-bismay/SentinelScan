import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Globe, Lock, Eye, Server, Brain, BarChart3, Zap,
  ChevronRight, Search, AlertTriangle, FileText, Cpu, Network, Cookie,
} from 'lucide-react';

const SCANNER_MODULES = [
  {
    icon: Globe,
    name: 'Web Crawler',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    description:
      'Recursively navigates your target domain using Cheerio HTML parsing, following internal links up to the configured depth. Discovers all reachable endpoints, HTML forms, and JavaScript bundles without executing JavaScript unless headless mode is active.',
    checks: ['Internal link discovery', 'Form enumeration', 'Asset mapping', 'Configurable depth & URL limits'],
  },
  {
    icon: Shield,
    name: 'Security Headers',
    color: 'text-primary',
    bg: 'bg-primary/10',
    description:
      'Issues an HTTP request to the root URL and inspects every response header. Missing or misconfigured headers are flagged with severity ratings based on OWASP guidance and real-world exploit risk.',
    checks: ['Content-Security-Policy', 'Strict-Transport-Security (HSTS)', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy'],
  },
  {
    icon: Cookie,
    name: 'Cookie Security',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    description:
      'Parses Set-Cookie response headers for all crawled URLs. Checks each cookie for missing security attributes that would allow session hijacking or cross-site attacks.',
    checks: ['HttpOnly flag', 'Secure flag (HTTPS only)', 'SameSite attribute', 'Session cookie identification'],
  },
  {
    icon: Lock,
    name: 'SSL/TLS Certificate',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    description:
      'Resolves the domain and fetches certificate metadata using Node.js TLS sockets. Validates certificate validity, expiration timeline, and whether the site enforces HTTPS redirects.',
    checks: ['Certificate expiry date', 'HTTPS redirect enforcement', 'Certificate validity', 'Expiry warning thresholds'],
  },
  {
    icon: Search,
    name: 'Robots.txt Analysis',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    description:
      'Fetches and parses the robots.txt file. Disallowed paths often reveal sensitive directory structures. Flagged paths are presented as potential attack surface information.',
    checks: ['Disallowed path enumeration', 'Sensitive directory patterns', 'Admin panel hints', 'Backup directory exposure'],
  },
  {
    icon: Eye,
    name: 'Clickjacking Detection',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    description:
      'Examines frame-busting response headers and meta tags that prevent embedding the page inside an iframe. Missing protections are flagged as medium-severity findings.',
    checks: ['X-Frame-Options header', 'CSP frame-ancestors directive', 'Frame-busting JavaScript fallback'],
  },
  {
    icon: Network,
    name: 'CORS Configuration',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    description:
      'Sends a preflight OPTIONS request with a crafted Origin header and inspects the CORS response. Wildcard origins combined with credentials are a critical misconfiguration.',
    checks: ['Access-Control-Allow-Origin: *', 'Credentials with wildcard origin', 'Reflected origin vulnerability', 'Preflight response inspection'],
  },
  {
    icon: Server,
    name: 'Directory Scanner',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    description:
      'Probes a curated list of commonly exposed administrative and sensitive paths. A 200 OK response for any of these paths indicates a potential information exposure or access control gap.',
    checks: ['/admin, /wp-admin, /phpmyadmin', '/.git, /.env, /config.php', '/backup, /dump.sql', '/api/swagger, /api-docs'],
  },
  {
    icon: AlertTriangle,
    name: 'Info Leak Detection',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    description:
      'Inspects response body text and HTTP headers for version strings, error stack traces, developer comments, and technology fingerprints that could assist an attacker in targeting exploits.',
    checks: ['Server version headers', 'X-Powered-By disclosure', 'HTML comment scanning', 'Error message detection', 'Technology fingerprinting'],
  },
  {
    icon: Cpu,
    name: 'Playwright Headless',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    description:
      'Launches a headless Chromium browser to render JavaScript-heavy single-page applications. Captures dynamically injected content, network requests, and client-side security issues that static scanners miss.',
    checks: ['SPA rendering support', 'Dynamic content scanning', 'Network request interception', 'Client-side security checks'],
  },
];

const TECH_STACK = [
  { name: 'React + Vite', desc: 'Frontend SPA' },
  { name: 'Tailwind CSS + DaisyUI', desc: 'Design system' },
  { name: 'Express.js (ESM)', desc: 'REST API' },
  { name: 'MongoDB + Mongoose', desc: 'Data persistence' },
  { name: 'Inngest', desc: 'Async job queue' },
  { name: 'Playwright', desc: 'Headless browser' },
  { name: 'Groq LLM', desc: 'AI analysis' },
  { name: 'Passport.js', desc: 'OAuth 2.0 auth' },
];

const About = () => {
  return (
    <div className="flex flex-col gap-16 py-8 md:py-12">

      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 badge badge-primary px-3 py-1.5 font-semibold uppercase tracking-wider text-xs self-center">
          <Shield className="h-3 w-3" /> About SentinelScan
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-display text-base-content">
          How SentinelScan Works
        </h1>
        <p className="text-sm md:text-base text-base-content/65 leading-relaxed">
          SentinelScan is an open-source, production-ready web application vulnerability scanner. It combines a modular scanning pipeline, asynchronous job processing, and AI-powered analysis to give developers and security teams actionable insights — fast.
        </p>
      </section>

      {/* Architecture overview */}
      <section id="how-it-works" className="flex flex-col gap-8">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-base-content text-center">
          Pipeline Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: 'Async First',
              color: 'text-primary',
              bg: 'bg-primary/10',
              desc: 'Scan jobs are dispatched as Inngest events the moment you click Submit. The HTTP response returns instantly while the scanner runs in a background worker — no timeouts, no blocking.',
            },
            {
              icon: Brain,
              title: 'AI-Augmented',
              color: 'text-violet-400',
              bg: 'bg-violet-400/10',
              desc: 'When the scan completes, the Groq Llama-3.3 70B model analyses all findings, writes an executive summary, identifies attack scenarios, and produces prioritized fix instructions with code examples.',
            },
            {
              icon: BarChart3,
              title: 'Risk Scored',
              color: 'text-success',
              bg: 'bg-success/10',
              desc: 'Each finding carries a severity rating (Critical → Info). The scoring engine aggregates them into a 0–100 security score and an A–F letter grade, giving you an instant snapshot of your security posture.',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="card bg-base-100 border border-base-content/10 p-6 flex flex-col gap-3 shadow-sm">
                <div className={`p-3 ${card.bg} ${card.color} w-fit rounded-xl`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base font-display text-base-content">{card.title}</h3>
                <p className="text-xs text-base-content/60 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Scanner modules */}
      <section className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-base-content">
            10 Specialised Security Modules
          </h2>
          <p className="text-sm text-base-content/60 mt-1 max-w-xl mx-auto">
            Each module targets a distinct attack surface. They run in parallel using <code className="text-primary text-xs">Promise.allSettled()</code> — one module failing never blocks the others.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {SCANNER_MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.name}
                className="card bg-base-100 border border-base-content/10 shadow-sm hover:border-primary/20 transition-colors"
              >
                <div className="card-body p-5 flex flex-col md:flex-row gap-5">
                  {/* Icon + number */}
                  <div className="flex items-start gap-4 md:w-64 shrink-0">
                    <span className="text-xs font-black font-display text-base-content/25 pt-0.5 w-6 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className={`p-2.5 ${mod.bg} ${mod.color} rounded-xl shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-base-content font-display">{mod.name}</h3>
                    </div>
                  </div>
                  {/* Description */}
                  <p className="text-xs text-base-content/60 leading-relaxed flex-1">{mod.description}</p>
                  {/* Checks */}
                  <div className="md:w-56 shrink-0">
                    <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-2">Checks</p>
                    <ul className="flex flex-col gap-1">
                      {mod.checks.map((check) => (
                        <li key={check} className="flex items-center gap-1.5 text-xs text-base-content/70">
                          <span className={`w-1.5 h-1.5 rounded-full ${mod.bg} ${mod.color} shrink-0`} />
                          {check}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech stack */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold font-display text-base-content text-center">Tech Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TECH_STACK.map((t) => (
            <div key={t.name} className="bg-base-100 border border-base-content/10 rounded-xl p-4 text-center flex flex-col gap-1 shadow-sm">
              <span className="font-bold text-xs text-base-content font-display">{t.name}</span>
              <span className="text-xs text-base-content/50">{t.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center flex flex-col items-center gap-4 p-10 bg-base-100 rounded-3xl border border-base-content/10 shadow-sm">
        <Shield className="h-12 w-12 text-primary" />
        <h3 className="text-2xl font-bold font-display text-base-content">Start Your First Scan</h3>
        <p className="text-sm text-base-content/60 max-w-md">
          Create a free account and scan your first target in under a minute. No credit card required.
        </p>
        <Link to="/register" className="btn btn-primary text-primary-content gap-2 px-8">
          Get Started Free <ChevronRight className="h-4 w-4" />
        </Link>
      </section>

    </div>
  );
};

export default About;
