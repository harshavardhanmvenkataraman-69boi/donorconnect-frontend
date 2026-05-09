import { Modal, Row, Col } from "react-bootstrap";

export default function DonationForm({
  show,
  form,
  onFormChange,
  donorStatus,
  donorName,
  onDonorIdChange,
  onSubmit,
  onClose,
  collectionStatuses,
}) {
  const donorIndicator = () => {
    if (donorStatus === "checking")
      return { color: "#f0a500", text: "⏳ Checking..." };
    if (donorStatus === "valid")
      return { color: "#2ec27e", text: `✅ ${donorName}` };
    if (donorStatus === "invalid")
      return { color: "#e05260", text: "❌ Donor not found" };
    return null;
  };

  const indicator = donorIndicator();

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Record Donation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          className="alert-glass warning mb-3"
          style={{ fontSize: "0.82rem" }}
        >
          Donor must exist in the system and have a <strong>BOOKED</strong>{" "}
          appointment.
        </div>
        <Row className="g-3">
          <Col xs={12}>
            <label className="form-label">
              Donor ID <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className={`form-control ${
                donorStatus === "valid"
                  ? "is-valid"
                  : donorStatus === "invalid"
                    ? "is-invalid"
                    : ""
              }`}
              value={form.donorId}
              onChange={(e) => onDonorIdChange(e.target.value)}
              placeholder="Enter donor ID to verify"
            />
            {indicator && (
              <div
                style={{
                  fontSize: "0.78rem",
                  marginTop: 4,
                  color: indicator.color,
                  fontWeight: 600,
                }}
              >
                {indicator.text}
              </div>
            )}
          </Col>
          <Col xs={12}>
            <label className="form-label">
              Bag ID <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. BAG-2024-001"
              value={form.bagId}
              onChange={(e) => onFormChange({ ...form, bagId: e.target.value })}
            />
          </Col>
          <Col xs={6}>
            <label className="form-label">Volume (ml)</label>
            <input
              type="number"
              className="form-control"
              value={form.volumeMl}
              onChange={(e) =>
                onFormChange({ ...form, volumeMl: e.target.value })
              }
            />
          </Col>
          <Col xs={6}>
            <label className="form-label">Collection Date</label>
            <input
              type="date"
              className="form-control"
              value={form.collectionDate}
              onChange={(e) =>
                onFormChange({ ...form, collectionDate: e.target.value })
              }
            />
          </Col>
          <Col xs={6}>
            <label className="form-label">Collected By</label>
            <input
              type="text"
              className="form-control"
              value={form.collectedBy}
              onChange={(e) =>
                onFormChange({ ...form, collectedBy: e.target.value })
              }
            />
          </Col>
          <Col xs={6}>
            <label className="form-label">Collection Status</label>
            <select
              className="form-select"
              value={form.collectionStatus}
              onChange={(e) =>
                onFormChange({ ...form, collectionStatus: e.target.value })
              }
            >
              {collectionStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn-glass" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-crimson"
          onClick={onSubmit}
          disabled={donorStatus === "invalid" || donorStatus === "checking"}
          style={{
            opacity:
              donorStatus === "invalid" || donorStatus === "checking" ? 0.5 : 1,
          }}
        >
          Record
        </button>
      </Modal.Footer>
    </Modal>
  );
}
