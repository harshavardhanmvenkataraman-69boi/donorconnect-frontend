import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/shared/ui/PageHeader';
import ReportAnalyticsDashboard from '../../components/service/reporting/ReportAnalyticsDashboard';
import { reportingApi, unwrap, triggerDownload } from './reportingApi';
import { showError } from '../../components/shared/ui/AlertBanner';

const INIT_LOADING = {
  inv: true, exp: true, donor: true, freq: true,
  waste: true, react: true, defer: true, tat: true,
  util: true, rxn: true,
};

export default function ReportingDashboardPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(INIT_LOADING);

  const fetchOne = useCallback(async (key, apiFn) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const result = unwrap(await apiFn());
      setData(prev => ({ ...prev, [key]: result }));
    } catch {
      setData(prev => ({ ...prev, [key]: null }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const fetchAll = useCallback(() => {
    fetchOne('inv',   reportingApi.inventorySnapshot);
    fetchOne('exp',   reportingApi.expiryRisk);
    fetchOne('donor', reportingApi.donorActivity);
    fetchOne('freq',  reportingApi.donationFrequency);
    fetchOne('waste', reportingApi.componentWastage);
    fetchOne('react', reportingApi.reactiveCount);
    fetchOne('defer', reportingApi.deferrals);
    fetchOne('tat',   reportingApi.tat);
    fetchOne('util',  reportingApi.utilization);
    fetchOne('rxn',   reportingApi.adverseReactions);
  }, [fetchOne]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSectionAction = async (action, type) => {
    try {
      if (action === 'download') {
        const res = await reportingApi.downloadCsv(type);
        triggerDownload(res.data, `${type}-${new Date().toISOString().slice(0, 10)}.csv`);
      } else if (action === 'downloadExcel') {
        const res = await reportingApi.downloadExcel();
        triggerDownload(res.data, `donorconnect-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
      }
    } catch {
      showError('Download failed. Please try again.');
    }
  };

  const anyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Live KPIs, trends and export-ready reports"
      >
        <button
          className="btn-glass"
          onClick={fetchAll}
          disabled={anyLoading}
          style={{ fontSize: '0.85rem' }}
        >
          {anyLoading ? 'Loading…' : '🔄 Refresh All'}
        </button>
      </PageHeader>

      <ReportAnalyticsDashboard
        loading={loading}
        donorActivity={data.donor}
        donationFrequency={data.freq}
        inventorySnapshot={data.inv}
        utilization={data.util}
        deferrals={data.defer}
        componentWastage={data.waste}
        reactiveCount={data.react}
        tat={data.tat}
        expiryRisk={data.exp}
        adverseReactions={data.rxn}
        onRefreshSection={handleSectionAction}
      />
    </div>
  );
}
