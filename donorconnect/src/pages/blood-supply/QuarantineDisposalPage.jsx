import { useState, useEffect, useRef } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import api from "../../api/axiosInstance";
import PageHeader from "../../components/shared/ui/PageHeader";
import DataTable from "../../components/shared/ui/DataTable";
import StatusBadge from "../../components/shared/ui/StatusBadge";
import ConfirmModal from "../../components/shared/ui/ConfirmModal";
import { showSuccess, showError } from "../../components/shared/ui/AlertBanner";

// Component-ID-based modal forms.
const INIT_Q = { componentId: "", reason: "", startDate: "" };
const INIT_D = {
  componentId: "",
  disposalReason: "",
  witness: "",
  notes: "",
  disposalDate: "",
};

/**
 * Quarantine & Disposal page.
 *
 * Two tabs:
 *   - Quarantine: list of active/historical quarantine actions.
 *     Each active row has Release and Dispose actions.
 *   - Disposals: list of all disposal records (audit log).
 *
 * Both forms verify the Component ID in real time before allowing submit.
 */
export default function QuarantineDisposalPage() {
  const [tab, setTab] = useState("quarantine");
  const [quarantines, setQuarantines] = useState([]);
  const [disposals, setDisposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [qForm, setQForm] = useState(INIT_Q);
  const [dForm, setDForm] = useState(INIT_D);
  const [confirmDispose, setConfirmDispose] = useState(null); // qaId being disposed from quarantine tab

  // Component ID verification (used by both quarantine + disposal forms)
  const [componentStatus, setComponentStatus] = useState("idle");
  const debounceRef = useRef(null);

  const loadQ = () => {
    setLoading(true);
    api
      .get("/api/quarantine")
      .then((r) => {
        const d = r.data?.data;
        setQuarantines(Array.isArray(d) ? d : (d?.content ?? []));
      })
      .catch(() => setQuarantines([]))
      .finally(() => setLoading(false));
  };

  const loadD = () => {
    api
      .get("/api/disposal")
      .then((r) => {
        const d = r.data?.data;
        setDisposals(Array.isArray(d) ? d : (d?.content ?? []));
      })
      .catch(() => setDisposals([]));
  };

  useEffect(() => {
    loadQ();
    loadD();
  }, []);

  const checkComponent = (id) => {
    if (!id) {
      setComponentStatus("idle");
      return;
    }
    setComponentStatus("checking");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await api.get(`/api/components/${id}`);
        setComponentStatus(r.data?.data ? "valid" : "invalid");
      } catch {
        setComponentStatus("invalid");
      }
    }, 600);
  };

  const closeModal = () => {
    setShowModal(false);
    setQForm(INIT_Q);
    setDForm(INIT_D);
    setComponentStatus("idle");
  };

  const release = async (qaId) => {
    try {
      await api.patch(`/api/quarantine/${qaId}/release`);
      showSuccess("Released back to AVAILABLE");
      loadQ();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed");
    }
  };

  const disposeFromQuarantine = async (qa) => {
    try {
      await api.post("/api/disposal", {
        componentId: qa.componentId,
        disposalReason: "Confirmed unsafe from quarantine review",
        witness: "supervisor",
      });
      showSuccess("Component disposed");
      loadQ();
      loadD();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed");
    }
  };

  const addQ = async () => {
    if (!qForm.componentId) {
      showError("Component ID is required");
      return;
    }
    if (componentStatus === "invalid") {
      showError("Component ID does not exist.");
      return;
    }
    if (componentStatus === "checking") {
      showError("Please wait — verifying Component ID...");
      return;
    }
    if (!qForm.reason.trim()) {
      showError("Reason is required");
      return;
    }
    try {
      await api.post("/api/quarantine", {
        componentId: Number(qForm.componentId),
        reason: qForm.reason.trim(),
        startDate: qForm.startDate || undefined,
      });
      showSuccess("Component quarantined");
      closeModal();
      loadQ();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed");
    }
  };

  const addD = async () => {
    if (!dForm.componentId) {
      showError("Component ID is required");
      return;
    }
    if (componentStatus === "invalid") {
      showError("Component ID does not exist.");
      return;
    }
    if (componentStatus === "checking") {
      showError("Please wait — verifying Component ID...");
      return;
    }
    try {
      await api.post("/api/disposal", {
        componentId: Number(dForm.componentId),
        disposalReason: dForm.disposalReason || undefined,
        witness: dForm.witness || undefined,
        notes: dForm.notes || undefined,
        disposalDate: dForm.disposalDate || undefined,
      });
      showSuccess("Disposal recorded — component marked DISPOSED");
      closeModal();
      loadD();
      loadQ();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed");
    }
  };

  const componentIndicator = () => {
    if (componentStatus === "checking")
      return { color: "#f0a500", text: "⏳ Checking..." };
    if (componentStatus === "valid")
      return { color: "#2ec27e", text: "✅ Component found" };
    if (componentStatus === "invalid")
      return { color: "#e05260", text: "❌ Component not found" };
    return null;
  };
  const indicator = componentIndicator();

  const qCols = [
    { key: "qaId", label: "ID" },
    { key: "componentId", label: "Component ID" },
    { key: "reason", label: "Reason" },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
    { key: "startDate", label: "Start Date", render: (v) => v || "—" },
    { key: "releasedDate", label: "Resolved Date", render: (v) => v || "—" },
  ];
  const dCols = [
    { key: "disposalId", label: "ID" },
    { key: "componentId", label: "Component ID" },
    { key: "disposalReason", label: "Reason", render: (v) => v || "—" },
    { key: "disposalDate", label: "Disposal Date", render: (v) => v || "—" },
    { key: "witness", label: "Witness", render: (v) => v || "—" },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
  ];

  const submitDisabled =
    componentStatus === "invalid" || componentStatus === "checking";

  return (
    <div className="animate-fadein">
      <PageHeader title="Quarantine & Disposal">
        <button
          className="btn-crimson"
          onClick={() => {
            setShowModal(true);
          }}
        >
          + {tab === "quarantine" ? "Add Quarantine" : "Record Disposal"}
        </button>
      </PageHeader>

      <div
        className="alert-glass mb-3"
        style={{ fontSize: "0.82rem", borderLeft: "4px solid #6c8eef" }}
      >
        Quarantine holds a component aside while it's reviewed. From here a
        supervisor can either <strong>Release</strong> it back to AVAILABLE
        (e.g., after a re-test cleared it) or <strong>Dispose</strong> it
        (confirmed unsafe). Reactive donations automatically place their
        components in quarantine — no manual action needed.
      </div>

      <div className="nav-tabs-glass mb-3">
        {[
          ["quarantine", "Quarantine"],
          ["disposals", "Disposals"],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`nav-link${tab === k ? " active" : ""}`}
            onClick={() => setTab(k)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        {tab === "quarantine" && (
          <DataTable
            columns={qCols}
            data={quarantines}
            loading={loading}
            actions={(row) =>
              row.status === "QUARANTINED" ? (
                <div className="d-flex gap-2">
                  <button
                    className="btn-glass"
                    title="Release back to AVAILABLE"
                    onClick={() => release(row.qaId)}
                  >
                    Release
                  </button>
                  <button
                    className="btn-icon danger"
                    title="Dispose (confirmed unsafe)"
                    onClick={() => setConfirmDispose(row)}
                  >
                    🗑 Dispose
                  </button>
                </div>
              ) : null
            }
          />
        )}
        {tab === "disposals" && (
          <DataTable columns={dCols} data={disposals} loading={false} />
        )}
      </div>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {tab === "quarantine" ? "Add Quarantine" : "Record Disposal"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tab === "quarantine" && (
            <Row className="g-3">
              <Col xs={12}>
                <label className="form-label">
                  Component ID <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${componentStatus === "valid" ? "is-valid" : componentStatus === "invalid" ? "is-invalid" : ""}`}
                  value={qForm.componentId}
                  onChange={(e) => {
                    setQForm({ ...qForm, componentId: e.target.value });
                    checkComponent(e.target.value);
                  }}
                  placeholder="Enter component ID to verify"
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
                  Reason <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={qForm.reason}
                  onChange={(e) =>
                    setQForm({ ...qForm, reason: e.target.value })
                  }
                  placeholder="e.g. Donor reported illness after donation, equipment malfunction, etc."
                />
              </Col>
              <Col xs={12}>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={qForm.startDate}
                  onChange={(e) =>
                    setQForm({ ...qForm, startDate: e.target.value })
                  }
                />
              </Col>
            </Row>
          )}
          {tab === "disposals" && (
            <Row className="g-3">
              <Col xs={12}>
                <label className="form-label">
                  Component ID <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${componentStatus === "valid" ? "is-valid" : componentStatus === "invalid" ? "is-invalid" : ""}`}
                  value={dForm.componentId}
                  onChange={(e) => {
                    setDForm({ ...dForm, componentId: e.target.value });
                    checkComponent(e.target.value);
                  }}
                  placeholder="Enter component ID to verify"
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
                <label className="form-label">Disposal Reason</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={dForm.disposalReason}
                  onChange={(e) =>
                    setDForm({ ...dForm, disposalReason: e.target.value })
                  }
                />
              </Col>
              <Col xs={6}>
                <label className="form-label">Disposal Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dForm.disposalDate}
                  onChange={(e) =>
                    setDForm({ ...dForm, disposalDate: e.target.value })
                  }
                />
              </Col>
              <Col xs={6}>
                <label className="form-label">Witness</label>
                <input
                  type="text"
                  className="form-control"
                  value={dForm.witness}
                  onChange={(e) =>
                    setDForm({ ...dForm, witness: e.target.value })
                  }
                />
              </Col>
              <Col xs={12}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={dForm.notes}
                  onChange={(e) =>
                    setDForm({ ...dForm, notes: e.target.value })
                  }
                />
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={closeModal}>
            Cancel
          </button>
          <button
            className="btn-crimson"
            onClick={tab === "quarantine" ? addQ : addD}
            disabled={submitDisabled}
            style={{ opacity: submitDisabled ? 0.5 : 1 }}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={!!confirmDispose}
        onHide={() => setConfirmDispose(null)}
        title="Confirm Disposal"
        message={`Dispose component ${confirmDispose?.componentId}? This is permanent and creates an audit record.`}
        onConfirm={() => {
          disposeFromQuarantine(confirmDispose);
          setConfirmDispose(null);
        }}
      />
    </div>
  );
}
