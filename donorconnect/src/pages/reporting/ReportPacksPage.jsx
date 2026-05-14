import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/shared/ui/PageHeader';
import ReportPacksList from '../../components/service/reporting/ReportPacksList';
import { reportingApi, unwrap } from './reportingApi';
import { showSuccess, showError } from '../../components/shared/ui/AlertBanner';

const SCOPES = ['SITE', 'REGIONAL', 'NATIONAL'];

export default function ReportPacksPage() {
  const [packs, setPacks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scope, setScope]           = useState('SITE');
  const [viewingPack, setViewingPack] = useState(null);

  const loadPacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = unwrap(await reportingApi.getAllPacks());
      const content = res?.content ?? res?.data ?? (Array.isArray(res) ? res : []);
      setPacks(Array.isArray(content) ? content : []);
    } catch {
      setPacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPacks(); }, [loadPacks]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await reportingApi.generate(scope);
      showSuccess(`Report pack generated successfully (${scope})`);
      loadPacks();
    } catch {
      showError('Failed to generate report pack. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewPack = async (id) => {
    try {
      const result = unwrap(await reportingApi.getPackById(id));
      setViewingPack(result);
    } catch {
      setViewingPack({ error: 'Failed to load report pack.' });
    }
  };

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Report Packs"
        subtitle="Generated and archived report packs"
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 140, fontSize: '0.85rem', padding: '8px 12px' }}
            value={scope}
            onChange={e => setScope(e.target.value)}
          >
            {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            className="btn-crimson"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generating…' : '+ Generate Report'}
          </button>
          <button
            className="btn-glass"
            onClick={loadPacks}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </PageHeader>

      <ReportPacksList
        packs={packs}
        loading={loading}
        viewingPack={viewingPack}
        onViewPack={handleViewPack}
        onCloseModal={() => setViewingPack(null)}
      />
    </div>
  );
}
