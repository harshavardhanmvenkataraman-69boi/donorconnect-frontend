import { useState, useEffect, useRef } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import api from "../../api/axiosInstance";
import PageHeader from "../../components/shared/ui/PageHeader";
import DataTable from "../../components/shared/ui/DataTable";
import StatusBadge from "../../components/shared/ui/StatusBadge";
import StatCard from "../../components/shared/ui/StatCard";
import ConfirmModal from "../../components/shared/ui/ConfirmModal";
import { showSuccess, showError } from "../../components/shared/ui/AlertBanner";

const TYPES = ["PRBC", "PLATELET", "PLASMA", "CRYO"];
const STATUSES = ["AVAILABLE", "EXPIRED", "QUARANTINE", "ISSUED", "DISPOSED"];
const BLOOD_GROUPS = ["A", "B", "AB", "O"];
const RH_FACTORS = ["POSITIVE", "NEGATIVE"];
const INIT_FORM = {
  donationId: "",
  componentType: "PRBC",
  bagNumber: "",
  volume: "",
  manufactureDate: "",
  expiryDate: "",
  bloodGroup: "",
  rhFactor: "",
};

export default function BloodComponentsPage() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState(INIT_FORM);

  // Donation ID verification
  const [donationStatus, setDonationStatus] = useState("idle");
  const debounceRef = useRef(null);

  const load = () => {
    setLoading(true);
    api
      .get("/api/components")
      .then((r) => {
        const d = r.data?.data;
        setComponents(Array.isArray(d) ? d : (d?.content ?? []));
      })
      .catch(() => setComponents([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const count = (s) => components.filter((c) => c.status === s).length;

  // Real-time donation check — GET /api/donations/{id}
  const checkDonation = (id) => {
    if (!id) {
      setDonationStatus("idle");
      return;
    }
    setDonationStatus("checking");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await api.get(`/api/donations/${id}`);
        setDonationStatus(r.data?.data ? "valid" : "invalid");
      } catch {
        setDonationStatus("invalid");
      }
    }, 600);
  };

  const handleDonationIdChange = (val) => {
    setForm((f) => ({ ...f, donationId: val }));
    checkDonation(val);
  };

  const quarantine = async (componentId) => {
    try {
      await api.post("/api/quarantine", {
        componentId,
        reason: "Manual quarantine",
      });
      showSuccess("Component quarantined");
      load();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed");
    }
  };

  const dispose = async (componentId) => {
    try {
      await api.post("/api/disposal", {
        componentId,
        disposalReason: "Manual disposal",
      });
      showSuccess("Component disposed");
      load();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed");
    }
  };

  const create = async () => {
    if (!form.donationId) {
      showError("Donation ID is required");
      return;
    }
    if (donationStatus === "invalid") {
      showError("Donation ID does not exist.");
      return;
    }
    if (donationStatus === "checking") {
      showError("Please wait — verifying Donation ID...");
      return;
    }
    if (!form.expiryDate) {
      showError("Expiry Date is required");
      return;
    }
    try {
      await api.post("/api/components", {
        donationId: Number(form.donationId),
        componentType: form.componentType,
        bagNumber: form.bagNumber || undefined,
        volume: form.volume ? Number(form.volume) : undefined,
        manufactureDate: form.manufactureDate || undefined,
        expiryDate: form.expiryDate,
        bloodGroup: form.bloodGroup || undefined,
        rhFactor: form.rhFactor || undefined,
      });
      showSuccess("Component registered");
      setShowCreate(false);
      setForm(INIT_FORM);
      setDonationStatus("idle");
      load();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed");
    }
  };

  const closeCreate = () => {
    setShowCreate(false);
    setForm(INIT_FORM);
    setDonationStatus("idle");
  };

  const handleTypeFilter = async (type) => {
    setTypeFilter(type);
    setStatusFilter("");
    if (!type) {
      load();
      return;
    }
    setLoading(true);
    try {
      const r = await api.get(`/api/components/type/${type}`);
      setComponents(Array.isArray(r.data?.data) ? r.data.data : []);
    } catch {
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = async (status) => {
    setStatusFilter(status);
    setTypeFilter("");
    if (!status) {
      load();
      return;
    }
    setLoading(true);
    try {
      const r = await api.get(`/api/components/status/${status}`);
      setComponents(Array.isArray(r.data?.data) ? r.data.data : []);
    } catch {
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const donationIndicator = () => {
    if (donationStatus === "checking")
      return { color: "#f0a500", text: "⏳ Checking..." };
    if (donationStatus === "valid")
      return { color: "#2ec27e", text: "✅ Donation found" };
    if (donationStatus === "invalid")
      return { color: "#e05260", text: "❌ Donation not found" };
    return null;
  };
  const indicator = donationIndicator();

  const columns = [
    { key: "componentId", label: "ID" },
    { key: "donationId", label: "Donation ID" },
    { key: "componentType", label: "Type" },
    { key: "bagNumber", label: "Bag No.", render: (v) => v || "—" },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: "bloodGroup",
      label: "Blood Group",
      render: (v, row) => (v ? `${v} ${row.rhFactor || ""}` : "—"),
    },
    { key: "expiryDate", label: "Expiry" },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Blood Components">
        <button className="btn-crimson" onClick={() => setShowCreate(true)}>
          + Register Component
        </button>
      </PageHeader>

      <Row className="g-3 mb-4">
        <Col xs={6} md={2}>
          <StatCard title="Total" value={components.length} color="primary" />
        </Col>
        <Col xs={6} md={2}>
          <StatCard
            title="Available"
            value={count("AVAILABLE")}
            color="success"
          />
        </Col>
        <Col xs={6} md={2}>
          <StatCard
            title="Quarantine"
            value={count("QUARANTINE")}
            color="warning"
          />
        </Col>
        <Col xs={6} md={2}>
          <StatCard title="Issued" value={count("ISSUED")} color="info" />
        </Col>
        <Col xs={6} md={2}>
          <StatCard title="Expired" value={count("EXPIRED")} color="danger" />
        </Col>
        <Col xs={6} md={2}>
          <StatCard
            title="Disposed"
            value={count("DISPOSED")}
            color="secondary"
          />
        </Col>
      </Row>

      <div className="d-flex gap-2 mb-3">
        <select
          className="form-select"
          style={{ width: 200 }}
          value={typeFilter}
          onChange={(e) => handleTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          className="form-select"
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <DataTable
          columns={columns}
          data={components}
          loading={loading}
          actions={(row) => (
            <div className="d-flex gap-2">
              {row.status === "AVAILABLE" && (
                <button
                  className="btn-icon"
                  title="Quarantine"
                  onClick={() =>
                    setConfirm({ id: row.componentId, action: "quarantine" })
                  }
                >
                  🚫
                </button>
              )}
              {row.status !== "DISPOSED" && row.status !== "ISSUED" && (
                <button
                  className="btn-icon danger"
                  title="Dispose"
                  onClick={() =>
                    setConfirm({ id: row.componentId, action: "dispose" })
                  }
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        />
      </div>

      <Modal show={showCreate} onHide={closeCreate} centered>
        <Modal.Header closeButton>
          <Modal.Title>Register Blood Component</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <label className="form-label">
                Donation ID <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${donationStatus === "valid" ? "is-valid" : donationStatus === "invalid" ? "is-invalid" : ""}`}
                value={form.donationId}
                onChange={(e) => handleDonationIdChange(e.target.value)}
                placeholder="Enter donation ID to verify"
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
                Component Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={form.componentType}
                onChange={(e) =>
                  setForm({ ...form, componentType: e.target.value })
                }
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Col>
            <Col xs={6}>
              <label className="form-label">Bag Number</label>
              <input
                type="text"
                className="form-control"
                value={form.bagNumber}
                onChange={(e) =>
                  setForm({ ...form, bagNumber: e.target.value })
                }
              />
            </Col>
            <Col xs={6}>
              <label className="form-label">Volume (ml)</label>
              <input
                type="number"
                className="form-control"
                value={form.volume}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
              />
            </Col>
            <Col xs={6}>
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={form.bloodGroup}
                onChange={(e) =>
                  setForm({ ...form, bloodGroup: e.target.value })
                }
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Col>
            <Col xs={6}>
              <label className="form-label">Rh Factor</label>
              <select
                className="form-select"
                value={form.rhFactor}
                onChange={(e) => setForm({ ...form, rhFactor: e.target.value })}
              >
                <option value="">Select</option>
                {RH_FACTORS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Col>
            <Col xs={6}>
              <label className="form-label">Manufacture Date</label>
              <input
                type="date"
                className="form-control"
                value={form.manufactureDate}
                onChange={(e) =>
                  setForm({ ...form, manufactureDate: e.target.value })
                }
              />
            </Col>
            <Col xs={6}>
              <label className="form-label">
                Expiry Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({ ...form, expiryDate: e.target.value })
                }
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={closeCreate}>
            Cancel
          </button>
          <button
            className="btn-crimson"
            onClick={create}
            disabled={
              donationStatus === "invalid" || donationStatus === "checking"
            }
            style={{
              opacity:
                donationStatus === "invalid" || donationStatus === "checking"
                  ? 0.5
                  : 1,
            }}
          >
            Register
          </button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={!!confirm}
        onHide={() => setConfirm(null)}
        title={`Confirm ${confirm?.action}`}
        message={`Are you sure you want to ${confirm?.action} this component?`}
        onConfirm={() => {
          if (confirm.action === "quarantine") quarantine(confirm.id);
          else dispose(confirm.id);
          setConfirm(null);
        }}
      />
    </div>
  );
}
