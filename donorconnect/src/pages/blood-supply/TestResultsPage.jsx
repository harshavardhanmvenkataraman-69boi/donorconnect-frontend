import { useState, useEffect, useRef } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import api from "../../api/axiosInstance";
import PageHeader from "../../components/shared/ui/PageHeader";
import DataTable from "../../components/shared/ui/DataTable";
import StatusBadge from "../../components/shared/ui/StatusBadge";
import { showSuccess, showError } from "../../components/shared/ui/AlertBanner";

const TEST_TYPES = [
  "HIV",
  "HBV",
  "HCV",
  "VDRL",
  "MALARIA",
  "NAT",
  "BLOOD_GROUP",
  "RH",
];
const INIT_FORM = {
  donationId: "",
  testType: "HIV",
  result: "",
  resultDate: "",
  enteredBy: "",
};

export default function TestResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("NON_REACTIVE");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INIT_FORM);
  const [searchId, setSearchId] = useState("");

  // Donation ID verification
  const [donationStatus, setDonationStatus] = useState("idle");
  const debounceRef = useRef(null);

  const loadByTab = async (t) => {
    setTab(t);
    setLoading(true);
    try {
      // Two clean tabs, each backed by its own endpoint.
      const endpoint =
        t === "REACTIVE"
          ? "/api/test-results/reactive"
          : "/api/test-results/non-reactive";
      const r = await api.get(endpoint);
      setResults(Array.isArray(r.data?.data) ? r.data.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadByTab("NON_REACTIVE");
  }, []);

  const searchByDonation = async () => {
    if (!searchId) return;
    setLoading(true);
    try {
      const r = await api.get(`/api/test-results/donation/${searchId}`);
      setResults(Array.isArray(r.data?.data) ? r.data.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Real-time donation check
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

  const submit = async () => {
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
    if (!form.result.trim()) {
      showError("Result is required");
      return;
    }
    try {
      await api.post("/api/test-results", {
        donationId: Number(form.donationId),
        testType: form.testType,
        result: form.result.trim(),
        resultDate: form.resultDate || undefined,
        enteredBy: form.enteredBy || undefined,
      });
      showSuccess("Test result saved");
      setShowModal(false);
      setForm(INIT_FORM);
      setDonationStatus("idle");
      loadByTab(tab);
    } catch (e) {
      showError(e?.response?.data?.message || "Failed");
    }
  };

  // ---- Bulk entry state ----
  // Bulk modal lets the lab tech enter all 7 standard tests in one go.
  // Defaults make the happy path one click: just type donationId, hit Submit.
  const BULK_DEFAULTS = {
    HIV: "Non-Reactive",
    HBV: "Non-Reactive",
    HCV: "Non-Reactive",
    VDRL: "Non-Reactive",
    MALARIA: "Non-Reactive",
    BLOOD_GROUP: "A",
    RH: "POSITIVE",
  };
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    donationId: "",
    enteredBy: "",
    results: { ...BULK_DEFAULTS },
  });
  const [bulkDonationStatus, setBulkDonationStatus] = useState("idle");
  const bulkDebounceRef = useRef(null);

  const checkBulkDonation = (id) => {
    if (!id) {
      setBulkDonationStatus("idle");
      return;
    }
    setBulkDonationStatus("checking");
    clearTimeout(bulkDebounceRef.current);
    bulkDebounceRef.current = setTimeout(async () => {
      try {
        const r = await api.get(`/api/donations/${id}`);
        setBulkDonationStatus(r.data?.data ? "valid" : "invalid");
      } catch {
        setBulkDonationStatus("invalid");
      }
    }, 500);
  };

  const submitBulk = async () => {
    if (!bulkForm.donationId) {
      showError("Donation ID is required");
      return;
    }
    if (bulkDonationStatus === "invalid") {
      showError("Donation ID does not exist.");
      return;
    }
    // All 7 result strings must be filled.
    const missing = Object.entries(bulkForm.results)
      .filter(([, v]) => !v || !v.trim())
      .map(([k]) => k);
    if (missing.length > 0) {
      showError("Fill all results. Missing: " + missing.join(", "));
      return;
    }
    try {
      const trimmed = Object.fromEntries(
        Object.entries(bulkForm.results).map(([k, v]) => [k, v.trim()]),
      );
      const reactiveCount = Object.values(trimmed).filter(
        (v) => v.toUpperCase() === "REACTIVE",
      ).length;
      await api.post("/api/test-results/bulk", {
        donationId: Number(bulkForm.donationId),
        enteredBy: bulkForm.enteredBy || undefined,
        results: trimmed,
      });
      showSuccess(
        reactiveCount > 0
          ? `All 7 tests saved (${reactiveCount} reactive — quarantine + deferral pipeline fired).`
          : "All 7 tests saved successfully.",
      );
      setShowBulkModal(false);
      setBulkForm({
        donationId: "",
        enteredBy: "",
        results: { ...BULK_DEFAULTS },
      });
      setBulkDonationStatus("idle");
      loadByTab(tab);
    } catch (e) {
      showError(e?.response?.data?.message || "Bulk submit failed");
    }
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
    setBulkForm({
      donationId: "",
      enteredBy: "",
      results: { ...BULK_DEFAULTS },
    });
    setBulkDonationStatus("idle");
  };

  const bulkIndicator = () => {
    if (bulkDonationStatus === "checking")
      return { color: "#f0a500", text: "⏳ Checking..." };
    if (bulkDonationStatus === "valid")
      return { color: "#2ec27e", text: "✅ Donation found" };
    if (bulkDonationStatus === "invalid")
      return { color: "#e05260", text: "❌ Donation not found" };
    return null;
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(INIT_FORM);
    setDonationStatus("idle");
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
    { key: "testResultId", label: "ID" },
    { key: "donationId", label: "Donation ID" },
    { key: "testType", label: "Test Type" },
    { key: "result", label: "Result", render: (v) => v || "—" },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
    { key: "enteredBy", label: "Entered By", render: (v) => v || "—" },
    { key: "resultDate", label: "Result Date", render: (v) => v || "—" },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader title="Test Results">
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-glass"
            onClick={() => setShowBulkModal(true)}
            title="Enter all 7 mandatory tests for one donation in one go"
          >
            ⚡ Enter All Tests
          </button>
          <button className="btn-crimson" onClick={() => setShowModal(true)}>
            + Enter Result
          </button>
        </div>
      </PageHeader>
      <div className="nav-tabs-glass mb-3">
        {[
          { key: "NON_REACTIVE", label: "Non-Reactive" },
          { key: "REACTIVE", label: "Reactive" },
        ].map((t) => (
          <button
            key={t.key}
            className={`nav-link${tab === t.key ? " active" : ""}`}
            onClick={() => loadByTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="d-flex gap-2 mb-3">
        <input
          type="number"
          className="form-control"
          style={{ width: 200 }}
          placeholder="Search by Donation ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button className="btn-glass" onClick={searchByDonation}>
          Search
        </button>
        <button
          className="btn-glass"
          onClick={() => {
            setSearchId("");
            loadByTab(tab);
          }}
        >
          Clear
        </button>
      </div>
      <div className="table-wrapper">
        <DataTable columns={columns} data={results} loading={loading} />
      </div>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Test Result</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="alert-glass warning mb-3"
            style={{ fontSize: "0.82rem" }}
          >
            Type <strong>"REACTIVE"</strong> as result to flag. Status is set
            automatically.
          </div>
          {form.result.trim().toUpperCase() === "REACTIVE" && (
            <div
              className="alert-glass danger mb-3"
              style={{ fontSize: "0.82rem" }}
            >
              <strong>⚠ Reactive result detected.</strong>
              <div style={{ marginTop: 4 }}>Submitting this will:</div>
              <ul style={{ marginTop: 4, marginBottom: 0, paddingLeft: 18 }}>
                <li>
                  Auto-move any existing components for donation{" "}
                  <code>{form.donationId || "—"}</code> to <strong>QUARANTINE</strong>
                </li>
                <li>
                  Block future components for this donation from entering inventory
                  (they will be auto-quarantined on registration)
                </li>
                <li>
                  Defer the donor:{" "}
                  <strong>
                    {["HIV", "HBV", "HCV", "NAT"].includes(form.testType)
                      ? "PERMANENT"
                      : ["VDRL", "MALARIA"].includes(form.testType)
                        ? "TEMPORARY"
                        : "no deferral"}
                  </strong>{" "}
                  (based on test type {form.testType})
                </li>
              </ul>
              <div style={{ marginTop: 6, opacity: 0.85 }}>
                A supervisor will later review the quarantined components in the
                Quarantine & Disposal page — they can either release (if re-test
                clears) or dispose (confirmed unsafe).
              </div>
            </div>
          )}
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
              <label className="form-label">Test Type</label>
              <select
                className="form-select"
                value={form.testType}
                onChange={(e) => setForm({ ...form, testType: e.target.value })}
              >
                {TEST_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Col>
            <Col xs={12}>
              <label className="form-label">
                Result <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder='e.g. "Non-Reactive", "REACTIVE", "A+"'
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value })}
              />
            </Col>
            <Col xs={6}>
              <label className="form-label">Result Date</label>
              <input
                type="date"
                className="form-control"
                value={form.resultDate}
                onChange={(e) =>
                  setForm({ ...form, resultDate: e.target.value })
                }
              />
            </Col>
            <Col xs={6}>
              <label className="form-label">Entered By</label>
              <input
                type="text"
                className="form-control"
                value={form.enteredBy}
                onChange={(e) =>
                  setForm({ ...form, enteredBy: e.target.value })
                }
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-glass" onClick={closeModal}>
            Cancel
          </button>
          <button
            className="btn-crimson"
            onClick={submit}
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
            Submit
          </button>
        </Modal.Footer>
      </Modal>

      {/* ====================== BULK ENTRY MODAL ====================== */}
      <Modal show={showBulkModal} onHide={closeBulkModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Enter All Tests (Bulk)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="alert-glass mb-3"
            style={{ fontSize: "0.82rem", borderLeft: "4px solid #6c8eef" }}
          >
            Enter all 7 mandatory tests for one donation in a single submission.
            Default values are pre-filled for the happy path — just type the
            donation ID and click Submit. To simulate a reactive case, change
            any field to <code>REACTIVE</code>.
          </div>

          {(() => {
            const reactiveTests = Object.entries(bulkForm.results)
              .filter(([, v]) => v && v.trim().toUpperCase() === "REACTIVE")
              .map(([k]) => k);
            if (reactiveTests.length === 0) return null;
            const hasPerm = reactiveTests.some((t) =>
              ["HIV", "HBV", "HCV", "NAT"].includes(t),
            );
            const hasTemp = reactiveTests.some((t) =>
              ["VDRL", "MALARIA"].includes(t),
            );
            return (
              <div
                className="alert-glass danger mb-3"
                style={{ fontSize: "0.82rem" }}
              >
                <strong>⚠ {reactiveTests.length} reactive result(s):</strong>{" "}
                <code>{reactiveTests.join(", ")}</code>
                <div style={{ marginTop: 4 }}>
                  Components for this donation will be auto-quarantined. Donor
                  will be{" "}
                  <strong>
                    {hasPerm
                      ? "PERMANENTLY"
                      : hasTemp
                        ? "TEMPORARILY"
                        : "NOT"}
                  </strong>{" "}
                  deferred.
                </div>
              </div>
            );
          })()}

          <Row className="g-3">
            <Col xs={12} md={8}>
              <label className="form-label">
                Donation ID <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${bulkDonationStatus === "valid" ? "is-valid" : bulkDonationStatus === "invalid" ? "is-invalid" : ""}`}
                value={bulkForm.donationId}
                onChange={(e) => {
                  setBulkForm({ ...bulkForm, donationId: e.target.value });
                  checkBulkDonation(e.target.value);
                }}
                placeholder="Enter donation ID to verify"
              />
              {bulkIndicator() && (
                <div
                  style={{
                    fontSize: "0.78rem",
                    marginTop: 4,
                    color: bulkIndicator().color,
                    fontWeight: 600,
                  }}
                >
                  {bulkIndicator().text}
                </div>
              )}
            </Col>
            <Col xs={12} md={4}>
              <label className="form-label">Entered By</label>
              <input
                type="text"
                className="form-control"
                value={bulkForm.enteredBy}
                onChange={(e) =>
                  setBulkForm({ ...bulkForm, enteredBy: e.target.value })
                }
                placeholder="Lab tech name"
              />
            </Col>

            <Col xs={12}>
              <hr style={{ opacity: 0.3, margin: "8px 0 4px" }} />
              <div
                style={{
                  fontSize: "0.78rem",
                  opacity: 0.7,
                  marginBottom: 8,
                }}
              >
                Tests — pre-filled with happy-path defaults. Change any to{" "}
                <code>REACTIVE</code> to simulate a positive result.
              </div>
            </Col>

            {Object.keys(BULK_DEFAULTS).map((testType) => {
              const v = bulkForm.results[testType] || "";
              const isReactive = v.trim().toUpperCase() === "REACTIVE";
              return (
                <Col xs={12} md={6} key={testType}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    {testType}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={
                      isReactive
                        ? {
                            borderColor: "#e05260",
                            backgroundColor: "rgba(224, 82, 96, 0.08)",
                            fontWeight: 600,
                          }
                        : {}
                    }
                    value={v}
                    onChange={(e) =>
                      setBulkForm({
                        ...bulkForm,
                        results: {
                          ...bulkForm.results,
                          [testType]: e.target.value,
                        },
                      })
                    }
                  />
                </Col>
              );
            })}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn-glass"
            onClick={() =>
              setBulkForm({
                ...bulkForm,
                results: { ...BULK_DEFAULTS },
              })
            }
            title="Reset all 7 fields back to happy-path defaults"
          >
            ↻ Reset Defaults
          </button>
          <button className="btn-glass" onClick={closeBulkModal}>
            Cancel
          </button>
          <button
            className="btn-crimson"
            onClick={submitBulk}
            disabled={
              bulkDonationStatus === "invalid" ||
              bulkDonationStatus === "checking"
            }
            style={{
              opacity:
                bulkDonationStatus === "invalid" ||
                bulkDonationStatus === "checking"
                  ? 0.5
                  : 1,
            }}
          >
            Submit All 7
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
