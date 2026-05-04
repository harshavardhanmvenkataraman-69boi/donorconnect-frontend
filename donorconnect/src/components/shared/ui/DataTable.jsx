import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export default function DataTable({ columns = [], data = [], loading = false, actions }) {
  if (loading) return <LoadingSpinner />;
  if (!data.length) return <EmptyState />;
  return (
    <div className="table-scroll">
      <table className="table-glass w-100">
        <thead>
          <tr>
            {columns.map(c => <th key={c.key}>{c.label}</th>)}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map(c => (
                <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}</td>
              ))}
              {actions && <td>{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
