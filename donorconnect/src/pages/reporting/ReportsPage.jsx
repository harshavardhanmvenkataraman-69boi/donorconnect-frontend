import { useState } from 'react';
import ReportingDashboardPage from './ReportingDashboardPage';
import ReportPacksPage from './ReportPacksPage';

export default function ReportsPage() {
  const [tab, setTab] = useState('dashboard');

  return (
    <>
      <div className="nav-tabs-glass mb-4">
        {[
          { key: 'dashboard', label: '📊 Analytics Dashboard' },
          { key: 'packs',     label: '📋 Report Packs' },
        ].map(t => (
          <button
            key={t.key}
            className={`nav-link${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <ReportingDashboardPage />}
      {tab === 'packs'     && <ReportPacksPage />}
    </>
  );
}
