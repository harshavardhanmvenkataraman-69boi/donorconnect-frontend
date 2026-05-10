import { Modal } from "react-bootstrap";
import DataTable from "../../shared/ui/DataTable";
import StatusBadge from "../../shared/ui/StatusBadge";

export default function DonationList({
  donations,
  loading,
  statusFilter,
  onStatusFilterChange,
  onViewComponents,
  onStatusUpdate,
  collectionStatuses,
}) {
  const filtered = statusFilter
    ? donations.filter((d) => d.collectionStatus === statusFilter)
    : donations;

  const columns = [
    { key: "donationId", label: "ID" },
    { key: "donorId", label: "Donor ID" },
    { key: "bagId", label: "Bag ID" },
    { key: "volumeMl", label: "Volume (ml)", render: (v) => v ?? "—" },
    { key: "collectedBy", label: "Collected By", render: (v) => v || "—" },
    {
      key: "collectionStatus",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: "collectionDate",
      label: "Collection Date",
      render: (v) => v || "—",
    },
  ];

  return (
    <div className="table-wrapper">
      <div className="d-flex gap-2 mb-3">
        <select
          className="form-select"
          style={{ width: 220 }}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          {collectionStatuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        actions={(row) => (
          <div className="d-flex gap-2 align-items-center">
            <button
              className="btn-glass"
              onClick={() => onViewComponents(row.donationId)}
            >
              Components
            </button>
            <select
              className="form-select form-select-sm"
              style={{ width: 145 }}
              value={row.collectionStatus}
              onChange={(e) => onStatusUpdate(row.donationId, e.target.value)}
            >
              {collectionStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      />
    </div>
  );
}
