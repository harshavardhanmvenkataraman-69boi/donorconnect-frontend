import { useState, useEffect, useRef } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import api from "../../api/axiosInstance";
import PageHeader from "../../components/shared/ui/PageHeader";
import DataTable from "../../components/shared/ui/DataTable";
import StatusBadge from "../../components/shared/ui/StatusBadge";
import { showSuccess, showError } from "../../components/shared/ui/AlertBanner";

const INIT_Q = { componentId: "", reason: "", startDate: "" };
const INIT_R = { donationId: "", componentId: "", reason: "", noticeDate: "" };
const INIT_D = {
  componentId: "",
  disposalReason: "",
  witness: "",
  notes: "",
  disposalDate: "",
};

export default function QuarantineRecallPage() {
  const [tab, setTab] = useState("quarantine");
  const [quarantines, setQuarantines] = useState([]);
  const [recalls, setRecalls] = useState([]);
  const [disposals, setDisposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [qForm, setQForm] = useState(INIT_Q);
  const [rForm, setRForm] = useState(INIT_R);
  const [dForm, setDForm] = useState(INIT_D);

  // Component ID verification (used for quarantine and disposal)
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
  const loadR = () => {
    api
      .get("/api/recalls")
      .then((r) => {
        const d = r.data?.data;
        setRecalls(Array.isArray(d) ? d : (d?.content ?? []));
      })
      .catch(() => setRecalls([]));
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
    loadR();
    loadD();
  }, []);

  // Real-time component check — GET /api/components/{id}
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
    setRForm(INIT_R);
    setDForm(INIT_D);
    setComponentStatus("idle");
  };

  const release = async (qaId) => {
    try {
      await api.patch(`/api/quarantine/${qaId}/release`);
      showSuccess("Released");
      loadQ();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed");
    }
  };

  const closeRecall = async (recallId) => {
    try {
      await api.patch(`/api/recalls/${recallId}/close`);
      showSuccess("Recall closed");
      loadR();
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

  const addR = async () => {
    if (!rForm.reason.trim()) {
      showError("Reason is required");
      return;
    }
    if (!rForm.donationId && !rForm.componentId) {
      showError("At least Donation ID or Component ID is required");
      return;
    }
    try {
      await api.post("/api/recalls", {
        donationId: rForm.donationId ? Number(rForm.donationId) : undefined,
        componentId: rForm.componentId ? Number(rForm.componentId) : undefined,
        reason: rForm.reason.trim(),
        noticeDate: rForm.noticeDate || undefined,
      });
      showSuccess("Recall issued");
      closeModal();
      loadR();
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
      showSuccess("Disposal recorded");
      closeModal();
      loadD();
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
    { key: "releasedDate", label: "Released Date", render: (v) => v || "—" },
  ];
  const rCols = [
    { key: "recallId", label: "ID" },
    { key: "donationId", label: "Donation ID", render: (v) => v || "—" },
    { key: "componentId", label: "Component ID", render: (v) => v || "—" },
    { key: "reason", label: "Reason" },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
    { key: "noticeDate", label: "Notice Date", render: (v) => v || "—" },
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

  const addLabel =
    tab === "quarantine"
      ? "+ Add Quarantine"
      : tab === "recalls"
        ? "+ Issue Recall"
        : "+ Record Disposal";

  const isComponentTab = tab === "quarantine" || tab === "disposals";
  const submitDisabled =
    isComponentTab &&
    (componentStatus === "invalid" || componentStatus === "checking");

  return (
    <div className="animate-fadein">
      <PageHeader title="Quarantine, Recalls & Disposal">
        <button
          className="btn-crimson"
          onClick={() => {
            setComponentStatus("idle");
            setShowModal(true);
          }}
        >
          {addLabel}
        </button>
      </PageHeader>
      <div className="nav-tabs-glass mb-4">
        {["quarantine", "recalls", "disposals"].map((t) => (
          <button
            key={t}
            className={`nav-link${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
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
                <button className="btn-glass" onClick={() => release(row.qaId)}>
                  Release
                </button>
              ) : null
            }
          />
        )}
        {tab === "recalls" && (
          <DataTable
            columns={rCols}
            data={recalls}
            loading={false}
            actions={(row) =>
              row.status === "OPEN" ? (
                <button
                  className="btn-glass"
                  onClick={() => closeRecall(row.recallId)}
                >
                  Close
                </button>
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
            {tab === "quarantine"
              ? "Add Quarantine"
              : tab === "recalls"
                ? "Issue Recall Notice"
                : "Record Disposal"}
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
          {tab === "recalls" && (
            <Row className="g-3">
              <Col xs={6}>
                <label className="form-label">Donation ID</label>
                <input
                  type="number"
                  className="form-control"
                  value={rForm.donationId}
                  onChange={(e) =>
                    setRForm({ ...rForm, donationId: e.target.value })
                  }
                />
              </Col>
              <Col xs={6}>
                <label className="form-label">Component ID</label>
                <input
                  type="number"
                  className="form-control"
                  value={rForm.componentId}
                  onChange={(e) =>
                    setRForm({ ...rForm, componentId: e.target.value })
                  }
                />
              </Col>
              <Col xs={12}>
                <label className="form-label">
                  Reason <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={rForm.reason}
                  onChange={(e) =>
                    setRForm({ ...rForm, reason: e.target.value })
                  }
                />
              </Col>
              <Col xs={12}>
                <label className="form-label">Notice Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={rForm.noticeDate}
                  onChange={(e) =>
                    setRForm({ ...rForm, noticeDate: e.target.value })
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
            onClick={
              tab === "quarantine" ? addQ : tab === "recalls" ? addR : addD
            }
            disabled={submitDisabled}
            style={{ opacity: submitDisabled ? 0.5 : 1 }}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
