import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/shared/ui/PageHeader';
import DataTable from '../../components/shared/ui/DataTable';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    const toArray = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (payload?.content && Array.isArray(payload.content)) return payload.content;
      return [];
    };
    api.get('/api/v1/audit-logs')
      .then(r => setLogs(toArray(r.data?.data ?? r.data)))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);
  const exportCSV = () => {
    const header = 'ID,User,Role,Action,Resource,Details,Timestamp\n';
    const rows = logs.map(l => `${l.auditId},${l.userName},${l.userRole},"${l.action}","${l.resource || ''}","${(l.metadata || '').replace(/"/g, '""')}",${l.timestamp}`).join('\n');
    const blob = new Blob([header+rows], {type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'audit-logs.csv'; a.click();
  };
  const columns = [
    { key:'auditId', label:'ID' },
    { key:'userName', label:'User' },
    { key:'userRole', label:'Role' },
    { key:'action', label:'Action' },
    { key:'resource', label:'Resource' },
    { key:'timestamp', label:'Timestamp', render: v => v ? new Date(v).toLocaleString() : '—' },
  ];
  return (
    <div className="animate-fadein">
      <PageHeader title="Audit Logs" subtitle="System activity trail">
        <button className="btn-glass" onClick={exportCSV}>📥 Export CSV</button>
      </PageHeader>
      <div className="table-wrapper"><DataTable columns={columns} data={logs} loading={loading} /></div>
    </div>
  );
}
