import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Globe, Heart, ExternalLink } from 'lucide-react';


const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    {
      heading: 'Product',
      items: [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Scan History', to: '/history' },
        { label: 'Analytics', to: '/analytics' },
        { label: 'AI Copilot', to: '/assistant' },
      ],
    },
    {
      heading: 'Learn',
      items: [
        { label: 'About SentinelScan', to: '/about' },
        { label: 'How It Works', to: '/about#how-it-works' },
        { label: 'OWASP Top 10', href: 'https://owasp.org/www-project-top-ten/', external: true },
        { label: 'CWE Database', href: 'https://cwe.mitre.org/', external: true },
      ],
    },
    {
      heading: 'Security',
      items: [
        { label: 'Privacy Policy', to: '/' },
        { label: 'Responsible Disclosure', to: '/' },
        { label: 'Terms of Service', to: '/' },
      ],
    },
  ];

  return (
    <footer className="bg-base-100 border-t border-base-content/10 mt-auto">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-primary">
            <Shield className="h-6 w-6 text-primary fill-primary/20" />
            <span>Sentinel<span className="text-base-content">Scan</span></span>
          </Link>
          <p className="text-xs text-base-content/60 leading-relaxed max-w-xs">
            Enterprise-grade web application vulnerability scanning. Identify, analyze, and remediate security threats with AI-powered intelligence.
          </p>
          {/* Social links */}
          <div className="flex items-center gap-3 mt-1">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="text-xs text-base-content/50 hover:text-primary transition-colors flex items-center gap-1"
            >
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-base-content/20">·</span>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
              className="text-xs text-base-content/50 hover:text-primary transition-colors flex items-center gap-1"
            >
              Twitter <ExternalLink className="h-3 w-3" />
            </a>
          </div>

        </div>

        {/* Link columns */}
        {links.map((col) => (
          <div key={col.heading} className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/50">
              {col.heading}
            </h4>
            <ul className="flex flex-col gap-2">
              {col.items.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-base-content/70 hover:text-primary transition-colors"
                    >
                      {item.label} ↗
                    </a>
                  ) : (
                    <Link
                      to={item.to}
                      className="text-xs text-base-content/70 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-base-content/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-base-content/40">
            © {currentYear} SentinelScan. All rights reserved.
          </p>
          <p className="text-xs text-base-content/40 flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-error fill-error" /> for the security community
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-success font-semibold">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
