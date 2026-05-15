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
  volume: "",
  manufactureDate: "",
  expiryDate: "",
  bloodGroup: "",
  rhFactor: "",
};

/**
 * Blood Components page.
 *
 * Component registration flow:
 *   1. User enters donation ID -> realtime verify donation exists
 *   2. On verify, we fetch /volume-info to learn:
 *        - the donation's bagId (auto-populated, read-only)
 *        - total volume / used / remaining
 *        - which component types are already used (those options are disabled)
 *        - whether the donation has a reactive test (warning banner — component
 *          will be auto-quarantined on creation)
 *   3. User picks component type + volume; volume capped at remaining.
 *   4. Submit. Backend handles duplicate-type / volume-overflow / reactive
 *      auto-quarantine — we just relay the message back to the user on error.
 */
export default function BloodComponentsPage() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState(INIT_FORM);

  // Donation verification + volume info
  const [donationStatus, setDonationStatus] = useState("idle");
  const [volumeInfo, setVolumeInfo] = useState(null);
  const [volumeInfoLoading, setVolumeInfoLoading] = useState(false);
  // Readiness: { ready: bool, reason: "CLEARED"|"INCOMPLETE"|"REACTIVE", message, missingTests?, reactiveTests? }
  const [readiness, setReadiness] = useState(null);
  const [readinessLoading, setReadinessLoading] = useState(false);
  // Prevents the duplicate-submit bug — disabled while a POST is in flight.
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef(null);

  // Quarantine modal
  const [quarantineModal, setQuarantineModal] = useState(null); // { componentId }
  const [quarantineReason, setQuarantineReason] = useState("");

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

  const checkDonation = (id) => {
    if (!id) {
      setDonationStatus("idle");
      setVolumeInfo(null);
      setReadiness(null);
      return;
    }
    setDonationStatus("checking");
    setVolumeInfo(null);
    setReadiness(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await api.get(`/api/donations/${id}`);
        if (!r.data?.data) {
          setDonationStatus("invalid");
          return;
        }
        setDonationStatus("valid");
        // Fetch volume info AND readiness in parallel.
        setVolumeInfoLoading(true);
        setReadinessLoading(true);
        const [vol, rdy] = await Promise.allSettled([
          api.get(`/api/components/donation/${id}/volume-info`),
          api.get(`/api/donations/${id}/component-readiness`),
        ]);
        if (vol.status === "fulfilled") {
          setVolumeInfo(vol.value.data?.data || null);
        } else {
          setVolumeInfo(null);
        }
        if (rdy.status === "fulfilled") {
          setReadiness(rdy.value.data?.data || null);
        } else {
          setReadiness({
            ready: false,
            reason: "ERROR",
            message: "Could not verify test readiness.",
          });
        }
        setVolumeInfoLoading(false);
        setReadinessLoading(false);
      } catch {
        setDonationStatus("invalid");
        setVolumeInfoLoading(false);
        setReadinessLoading(false);
      }
    }, 600);
  };

  const handleDonationIdChange = (val) => {
    setForm((f) => ({ ...f, donationId: val }));
    checkDonation(val);
  };

  const doQuarantine = async () => {
    if (!quarantineReason.trim()) {
      showError("Reason is required");
      return;
    }
    try {
      await api.post("/api/quarantine", {
        componentId: quarantineModal.componentId,
        reason: quarantineReason.trim(),
      });
      showSuccess("Component quarantined");
      setQuarantineModal(null);
      setQuarantineReason("");
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
    if (submitting) return; // hard-block double-click while a request is in flight
    if (!form.donationId) {
      showError("Donation ID is required");
      return;
    }
    if (donationStatus === "invalid") {
      showError("Donation ID does not exist.");
      return;
    }
    if (donationStatus === "checking" || volumeInfoLoading || readinessLoading) {
      showError("Please wait — verifying donation...");
      return;
    }
    // ---- Readiness gate (the new rule) ----
    // Tests must be complete AND non-reactive before any component can be registered.
    if (!readiness || readiness.ready !== true) {
      const msg =
        readiness?.message ||
        "Donation is not ready for component registration.";
      showError(msg);
      return;
    }
    if (!form.expiryDate) {
      showError("Expiry Date is required");
      return;
    }
    if (!form.volume || Number(form.volume) <= 0) {
      showError("Volume is required and must be positive");
      return;
    }
    if (volumeInfo && Number(form.volume) > volumeInfo.remainingVolumeMl) {
      showError(
        `Volume exceeds remaining ${volumeInfo.remainingVolumeMl}ml of donation`,
      );
      return;
    }
    if (
      volumeInfo &&
      volumeInfo.existingComponentTypes?.includes(form.componentType)
    ) {
      showError(`A ${form.componentType} already exists for this donation`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/components", {
        donationId: Number(form.donationId),
        componentType: form.componentType,
        volume: Number(form.volume),
        manufactureDate: form.manufactureDate || undefined,
        expiryDate: form.expiryDate,
        bloodGroup: form.bloodGroup || undefined,
        rhFactor: form.rhFactor || undefined,
      });
      showSuccess("Component registered and added to inventory.");
      setShowCreate(false);
      setForm(INIT_FORM);
      setDonationStatus("idle");
      setVolumeInfo(null);
      setReadiness(null);
      load();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const closeCreate = () => {
    setShowCreate(false);
    setForm(INIT_FORM);
    setDonationStatus("idle");
    setVolumeInfo(null);
    setReadiness(null);
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

  /**
   * Three banner states:
   *   - REACTIVE (red) -> registration blocked entirely
   *   - INCOMPLETE (yellow) -> wait for tests to finish
   *   - CLEARED (green) -> ready to register
   * Volume-info banner shows underneath regardless.
   */
  const renderReadinessBanner = () => {
    if (donationStatus !== "valid") return null;
    if (readinessLoading) {
      return (
        <div
          className="alert-glass mb-2"
          style={{ fontSize: "0.82rem", borderLeft: "4px solid #f0a500" }}
        >
          ⏳ Checking test readiness...
        </div>
      );
    }
    if (!readiness) return null;
    if (readiness.reason === "REACTIVE") {
      return (
        <div
          className="alert-glass danger mb-2"
          style={{ fontSize: "0.82rem" }}
        >
          <strong>🚫 Cannot register — reactive donation.</strong>{" "}
          {readiness.message}
          {readiness.reactiveTests?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              Reactive: <code>{readiness.reactiveTests.join(", ")}</code>
            </div>
          )}
          <div style={{ marginTop: 4, opacity: 0.85 }}>
            Donor has been deferred and component registration is blocked for this donation.
          </div>
        </div>
      );
    }
    if (readiness.reason === "INCOMPLETE") {
      return (
        <div
          className="alert-glass warning mb-2"
          style={{ fontSize: "0.82rem" }}
        >
          <strong>⏸ Tests not complete.</strong> {readiness.message}
          {readiness.missingTests?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              Missing: <code>{readiness.missingTests.join(", ")}</code>
            </div>
          )}
          <div style={{ marginTop: 4, opacity: 0.85 }}>
            Enter the missing test results on the Test Results page first.
          </div>
        </div>
      );
    }
    if (readiness.ready) {
      return (
        <div
          className="alert-glass success mb-2"
          style={{ fontSize: "0.82rem" }}
        >
          <strong>✅ Cleared.</strong> All 7 mandatory tests entered and
          non-reactive — ready for component registration.
        </div>
      );
    }
    return null;
  };

  const renderVolumeInfo = () => {
    if (donationStatus !== "valid") return null;
    if (volumeInfoLoading) {
      return (
        <div
          className="alert-glass mb-2"
          style={{ fontSize: "0.82rem", borderLeft: "4px solid #f0a500" }}
        >
          ⏳ Loading donation info...
        </div>
      );
    }
    if (!volumeInfo) return null;

    return (
      <>
        <div
          className="alert-glass mb-2"
          style={{
            fontSize: "0.82rem",
            borderLeft: "4px solid #6c8eef",
          }}
        >
          <div>
            <strong>Bag ID:</strong>{" "}
            <code>{volumeInfo.bagId || "—"}</code>
          </div>
          <div style={{ marginTop: 4 }}>
            <strong>Volume:</strong> {volumeInfo.remainingVolumeMl}ml remaining
            (of {volumeInfo.totalVolumeMl}ml total, {volumeInfo.usedVolumeMl}ml
            used)
          </div>
          {volumeInfo.existingComponentTypes?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <strong>Already used types:</strong>{" "}
              <code>{volumeInfo.existingComponentTypes.join(", ")}</code>
            </div>
          )}
        </div>
      </>
    );
  };

  const columns = [
    { key: "componentId", label: "ID" },
    { key: "donationId", label: "Donation ID" },
    { key: "componentType", label: "Type" },
    { key: "bagNumber", label: "Bag No.", render: (v) => v || "—" },
    { key: "volume", label: "Vol (ml)", render: (v) => v || "—" },
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

  // Component types available to pick — exclude those already used for the donation.
  const availableTypes = TYPES.filter(
    (t) => !volumeInfo?.existingComponentTypes?.includes(t),
  );
  // Ensure form.componentType is in availableTypes; if not, switch to first available.
  useEffect(() => {
    if (volumeInfo && !availableTypes.includes(form.componentType) && availableTypes.length > 0) {
      setForm((f) => ({ ...f, componentType: availableTypes[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumeInfo]);

  const registerDisabled =
    donationStatus !== "valid" ||
    volumeInfoLoading ||
    readinessLoading ||
    !volumeInfo ||
    volumeInfo.remainingVolumeMl <= 0 ||
    availableTypes.length === 0 ||
    !readiness ||
    readiness.ready !== true ||
    submitting;

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
                    setQuarantineModal({ componentId: row.componentId })
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

      {/* ===== Register Component Modal ===== */}
      <Modal show={showCreate} onHide={closeCreate} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Register Blood Component</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="alert-glass mb-3"
            style={{
              fontSize: "0.78rem",
              borderLeft: "4px solid #6c8eef",
            }}
          >
            One donation can produce multiple components of different types
            (e.g., PRBC + Plasma + Platelets), but total volume cannot exceed
            the donation's collected volume. The bag number is auto-pulled from
            the donation.
          </div>

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

            <Col xs={12}>{renderReadinessBanner()}</Col>
            <Col xs={12}>{renderVolumeInfo()}</Col>

            <Col xs={6}>
              <label className="form-label">
                Component Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={form.componentType}
                onChange={(e) =>
                  setForm({ ...form, componentType: e.target.value })
                }
                disabled={availableTypes.length === 0}
              >
                {availableTypes.length === 0 && (
                  <option>No types available</option>
                )}
                {availableTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Col>
            <Col xs={6}>
              <label className="form-label">
                Volume (ml) <span className="text-danger">*</span>
                {volumeInfo && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      marginLeft: 6,
                      opacity: 0.7,
                    }}
                  >
                    (max {volumeInfo.remainingVolumeMl})
                  </span>
                )}
              </label>
              <input
                type="number"
                className="form-control"
                value={form.volume}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
                max={volumeInfo?.remainingVolumeMl}
                min={1}
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
            disabled={registerDisabled}
            style={{
              opacity: registerDisabled ? 0.5 : 1,
              cursor: registerDisabled ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Registering..." : "Register"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ===== Quarantine Modal (with reason) ===== */}
      <Modal
        show={!!quarantineModal}
        onHide={() => {
          setQuarantineModal(null);
          setQuarantineReason("");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Quarantine Component</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: "0.85rem" }}>
            Quarantining component{" "}
            <strong>{quarantineModal?.componentId}</strong>. It will be removed
            from available inventory until a supervisor reviews it.
          </p>
          <label className="form-label">
            Reason <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            rows={2}
            value={quarantineReason}
            onChange={(e) => setQuarantineReason(e.target.value)}
            placeholder="e.g. Donor reported illness, temperature alarm, label issue"
          />
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn-glass"
            onClick={() => {
              setQuarantineModal(null);
              setQuarantineReason("");
            }}
          >
            Cancel
          </button>
          <button className="btn-crimson" onClick={doQuarantine}>
            Quarantine
          </button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={!!confirm}
        onHide={() => setConfirm(null)}
        title="Confirm Dispose"
        message="Are you sure you want to dispose this component? This is permanent."
        onConfirm={() => {
          dispose(confirm.id);
          setConfirm(null);
        }}
      />
    </div>
  );
}
