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
  const [tab, setTab] = useState("ALL");
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
      if (t === "PENDING") {
        const r = await api.get("/api/test-results/pending");
        setResults(Array.isArray(r.data?.data) ? r.data.data : []);
      } else if (t === "REACTIVE") {
        const r = await api.get("/api/test-results/reactive");
        setResults(Array.isArray(r.data?.data) ? r.data.data : []);
      } else {
        const [p, rx] = await Promise.allSettled([
          api.get("/api/test-results/pending"),
          api.get("/api/test-results/reactive"),
        ]);
        const all = [
          ...(Array.isArray(p.value?.data?.data) ? p.value.data.data : []),
          ...(Array.isArray(rx.value?.data?.data) ? rx.value.data.data : []),
        ];
        setResults(
          t === "COMPLETED" ? all.filter((r) => r.status === "COMPLETED") : all,
        );
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadByTab("ALL");
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
        <button className="btn-crimson" onClick={() => setShowModal(true)}>
          + Enter Result
        </button>
      </PageHeader>
      <div className="nav-tabs-glass mb-3">
        {["ALL", "PENDING", "COMPLETED", "REACTIVE"].map((t) => (
          <button
            key={t}
            className={`nav-link${tab === t ? " active" : ""}`}
            onClick={() => loadByTab(t)}
          >
            {t}
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
    </div>
  );
}
