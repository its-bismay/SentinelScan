import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const HeaderAnalysisTable = ({ findings = [] }) => {
  const headersToCheck = [
    { name: 'Content-Security-Policy', category: 'content-security-policy' },
    { name: 'Strict-Transport-Security', category: 'strict-transport-security' },
    { name: 'X-Frame-Options', category: 'x-frame-options' },
    { name: 'X-Content-Type-Options', category: 'x-content-type-options' },
    { name: 'Referrer-Policy', category: 'referrer-policy' },
    { name: 'Permissions-Policy', category: 'permissions-policy' },
  ];

  const getHeaderStatus = (headerName) => {
    // Check if there is an active finding about missing this header
    const finding = findings.find(
      (f) => f.category === 'headers' && f.title.toLowerCase().includes(headerName.toLowerCase())
    );

    if (finding) {
      return {
        secure: false,
        badgeClass: 'badge-error text-error-content',
        icon: <ShieldAlert className="h-4 w-4 text-error" />,
        detail: finding.severity ? `${finding.severity.toUpperCase()} risk missing header` : 'Missing Header',
      };
    }

    return {
      secure: true,
      badgeClass: 'badge-success text-success-content',
      icon: <ShieldCheck className="h-4 w-4 text-success" />,
      detail: 'Present & Configured',
    };
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-base-content/10 bg-base-100">
      <table className="table table-sm md:table-md w-full">
        <thead>
          <tr className="bg-base-200">
            <th>Security Header</th>
            <th>Status</th>
            <th>Assessment Details</th>
          </tr>
        </thead>
        <tbody>
          {headersToCheck.map((hdr) => {
            const status = getHeaderStatus(hdr.name);
            return (
              <tr key={hdr.name} className="hover:bg-base-200/45 transition-colors">
                <td className="font-semibold">{hdr.name}</td>
                <td>
                  <span className={`badge uppercase text-3xs font-bold px-2 py-0.5 ${status.badgeClass}`}>
                    {status.secure ? 'Secure' : 'Unsecured'}
                  </span>
                </td>
                <td className="text-xs text-base-content/85 font-medium flex items-center gap-1.5 mt-1 border-none">
                  {status.icon}
                  <span>{status.detail}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HeaderAnalysisTable;
