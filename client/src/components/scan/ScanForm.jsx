import React, { useState } from 'react';
import { Play, Settings2, Globe } from 'lucide-react';

const ScanForm = ({ onStartScan, loading }) => {
  const [url, setUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Scan options
  const [ignoreRobots, setIgnoreRobots] = useState(false);
  const [maxDepth, setMaxDepth] = useState(3);
  const [maxUrls, setMaxUrls] = useState(50);
  const [headlessScan, setHeadlessScan] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) return;
    onStartScan(url, { ignoreRobots, maxDepth, maxUrls, headlessScan });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-base-100 p-6 rounded-2xl border border-base-content/10 shadow-md">
      <div>
        <h3 className="text-lg font-bold font-display flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Start New Security Scan
        </h3>
        <p className="text-xs text-base-content/60 mt-0.5">
          Enter a web application URL to scan for vulnerabilities asynchronously.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <label className="input input-bordered flex items-center gap-2 flex-1">
          <span className="text-base-content/50 text-sm">Target URL:</span>
          <input
            type="url"
            required
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="grow bg-transparent"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`btn btn-outline ${showSettings ? 'btn-active' : ''}`}
            aria-label="Toggle Scan Config Settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          
          <button
            type="submit"
            disabled={loading || !url}
            className="btn btn-primary flex-1 md:flex-initial"
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                Scan Target
              </>
            )}
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="p-4 bg-base-200/50 rounded-xl border border-base-content/5 flex flex-col gap-4 animate-fade-in">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-base-content/70">
            Advanced Crawl & Pipeline Configuration
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Depth */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold">Max Crawl Depth</span>
              <input
                type="range"
                min="1"
                max="5"
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                className="range range-primary range-xs"
              />
              <div className="flex justify-between text-3xs px-1 text-base-content/60 font-semibold">
                <span>1 (Root only)</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5 (Deep)</span>
              </div>
            </div>

            {/* Max URLs */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold">Max Discovered URLs: {maxUrls}</span>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={maxUrls}
                onChange={(e) => setMaxUrls(Number(e.target.value))}
                className="range range-primary range-xs"
              />
              <div className="flex justify-between text-3xs px-1 text-base-content/60 font-semibold">
                <span>10</span>
                <span>30</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ignoreRobots}
                onChange={(e) => setIgnoreRobots(e.target.checked)}
                className="checkbox checkbox-primary checkbox-sm"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold">Ignore robots.txt</span>
                <span className="text-3xs text-base-content/60">Allow scanning directories blocked by robot policies</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={headlessScan}
                onChange={(e) => setHeadlessScan(e.target.checked)}
                className="checkbox checkbox-primary checkbox-sm"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold">Headless Browser Rendering</span>
                <span className="text-3xs text-base-content/60">Render client-side scripts via Playwright to extract DOM info</span>
              </div>
            </label>
          </div>
        </div>
      )}
    </form>
  );
};

export default ScanForm;
