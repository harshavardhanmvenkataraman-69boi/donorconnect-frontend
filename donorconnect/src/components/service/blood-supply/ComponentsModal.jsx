import { Modal } from "react-bootstrap";
import StatusBadge from "../../shared/ui/StatusBadge";

export default function ComponentsModal({ show, components, onClose }) {
  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Blood Components</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!components?.length ? (
          <p style={{ color: "var(--text-muted)" }}>No components found.</p>
        ) : (
          <table className="table-glass w-100">
            <thead>
              <tr>
                <th>Component ID</th>
                <th>Type</th>
                <th>Bag No.</th>
                <th>Status</th>
                <th>Expiry</th>
                <th>Blood Group</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.componentId}>
                  <td>{c.componentId}</td>
                  <td>{c.componentType}</td>
                  <td>{c.bagNumber || "—"}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>{c.expiryDate || "—"}</td>
                  <td>
                    {c.bloodGroup ? `${c.bloodGroup} ${c.rhFactor || ""}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn-glass" onClick={onClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
}
