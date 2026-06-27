import React from 'react';
import { ShieldCheck, ShieldAlert, CircleAlert } from 'lucide-react';

const CookieAnalysisTable = ({ findings = [] }) => {
  const cookieFindings = findings.filter((f) => f.category === 'cookies');

  if (cookieFindings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-base-100 rounded-xl border border-success/15 bg-success/5">
        <ShieldCheck className="h-8 w-8 text-success mb-2" />
        <h5 className="font-bold text-success font-display">No Cookie Security Weaknesses</h5>
        <p className="text-xs text-base-content/75 max-w-sm mt-0.5">
          All cookies identified in responses set Secure, HttpOnly, and SameSite parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-base-content/10 bg-base-100">
      <table className="table table-sm w-full">
        <thead>
          <tr className="bg-base-200">
            <th>Cookie Affected</th>
            <th>Vulnerability / Attribute Issue</th>
            <th>Severity</th>
            <th>Evidence Snippet</th>
          </tr>
        </thead>
        <tbody>
          {cookieFindings.map((cf, idx) => {
            // Extract cookie name from title
            const cookieName = cf.title.match(/"([^"]+)"/) ? cf.title.match(/"([^"]+)"/)[1] : 'Unknown';
            return (
              <tr key={idx} className="hover:bg-base-200/40 transition-colors">
                <td className="font-semibold font-mono text-xs text-primary">{cookieName}</td>
                <td>
                  <div className="flex items-center gap-1.5 text-xs text-base-content/90 font-medium">
                    <CircleAlert className="h-3.5 w-3.5 text-warning flex-shrink-0" />
                    <span>{cf.title}</span>
                  </div>
                </td>
                <td className="capitalize text-3xs font-bold text-warning">{cf.severity}</td>
                <td className="font-mono text-3xs opacity-80 break-all max-w-xs">{cf.evidence}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CookieAnalysisTable;
