import { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import PageHeader from "../../components/shared/ui/PageHeader";
import StatCard from "../../components/shared/ui/StatCard";
import DataTable from "../../components/shared/ui/DataTable";
import StatusBadge from "../../components/shared/ui/StatusBadge";

const quickLinks = [
  { to: "/dashboard/donations", icon: "🩸", label: "Donations" },
  { to: "/dashboard/components", icon: "🧪", label: "Components" },
  { to: "/dashboard/test-results", icon: "✅", label: "Test Results" },
  { to: "/dashboard/quarantine", icon: "🚫", label: "Quarantine & Disposal" },
];

export default function LabDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDonations: 0,
    availableComponents: 0,
    pendingTests: 0,
    reactiveTests: 0,
    quarantined: 0,
    expiring: 0,
  });
  const [pendingTests, setPendingTests] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      // GET /api/donations → gateway → /api/v1/donations
      api.get("/api/donations?page=0&size=5"),
      // GET /api/components/status/AVAILABLE → gateway → /api/v1/components/status/AVAILABLE
      api.get("/api/components/status/AVAILABLE"),
      // GET /api/test-results/pending → gateway → /api/v1/test-results/pending
      api.get("/api/test-results/pending"),
      // GET /api/test-results/reactive → gateway → /api/v1/test-results/reactive
      api.get("/api/test-results/reactive"),
      // GET /api/quarantine/active → gateway → /api/v1/quarantine/active
      api.get("/api/quarantine/active"),
      // GET /api/components/expiring?days=3 → gateway → /api/v1/components/expiring?days=3
      api.get("/api/components/expiring?days=3"),
    ])
      .then(
        ([donations, available, pending, reactive, quarantined, expiring]) => {
          // Donations
          const donData = donations.value?.data?.data;
          const donList = Array.isArray(donData)
            ? donData
            : (donData?.content ?? []);
          setRecentDonations(donList.slice(0, 5));
          const donTotal = donData?.totalElements ?? donList.length;

          // Available components
          const avail = available.value?.data?.data;
          const availCount = Array.isArray(avail)
            ? avail.length
            : (avail?.content?.length ?? 0);

          // Pending tests
          const pend = pending.value?.data?.data;
          const pendList = Array.isArray(pend) ? pend : [];
          setPendingTests(pendList.slice(0, 5));

          // Reactive tests
          const react = reactive.value?.data?.data;
          const reactCount = Array.isArray(react) ? react.length : 0;

          // Quarantined
          const quar = quarantined.value?.data?.data;
          const quarCount = Array.isArray(quar) ? quar.length : 0;

          // Expiring
          const exp = expiring.value?.data?.data;
          const expCount = Array.isArray(exp) ? exp.length : 0;

          setStats({
            totalDonations: donTotal,
            availableComponents: availCount,
            pendingTests: pendList.length,
            reactiveTests: reactCount,
            quarantined: quarCount,
            expiring: expCount,
          });
        },
      )
      .finally(() => setLoading(false));
  }, []);

  const donationCols = [
    { key: "donationId", label: "ID" },
    { key: "donorId", label: "Donor ID" },
    { key: "bagId", label: "Bag ID" },
    {
      key: "collectionStatus",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
    { key: "collectionDate", label: "Date", render: (v) => v || "—" },
  ];

  const testCols = [
    { key: "testResultId", label: "ID" },
    { key: "donationId", label: "Donation ID" },
    { key: "testType", label: "Test" },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
  ];

  return (
    <div className="animate-fadein">
      <PageHeader
        title="Lab Technician Dashboard"
        subtitle="Blood Supply Service — Live Overview"
      />

      {/* Stats */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={2}>
          <StatCard
            title="Total Donations"
            value={stats.totalDonations}
            color="primary"
            icon="🩸"
          />
        </Col>
        <Col xs={6} md={2}>
          <StatCard
            title="Available Units"
            value={stats.availableComponents}
            color="success"
            icon="🧪"
          />
        </Col>
        <Col xs={6} md={2}>
          <StatCard
            title="Pending Tests"
            value={stats.pendingTests}
            color="warning"
            icon="⏳"
          />
        </Col>
        <Col xs={6} md={2}>
          <StatCard
            title="Reactive Tests"
            value={stats.reactiveTests}
            color="danger"
            icon="⚠️"
          />
        </Col>
        <Col xs={6} md={2}>
          <StatCard
            title="Quarantined"
            value={stats.quarantined}
            color="warning"
            icon="🚫"
          />
        </Col>
        <Col xs={6} md={2}>
          <StatCard
            title="Expiring (3d)"
            value={stats.expiring}
            color="danger"
            icon="⏰"
          />
        </Col>
      </Row>

      {/* Quick links */}
      <div className="glass-card p-4 mb-4">
        <h6 style={{ fontFamily: "Sora", fontWeight: 700, marginBottom: 16 }}>
          Quick Navigation
        </h6>
        <div className="d-flex gap-3 flex-wrap">
          {quickLinks.map((l) => (
            <button
              key={l.to}
              onClick={() => navigate(l.to)}
              className="btn-glass"
              style={{
                minWidth: 140,
                flexDirection: "column",
                gap: 6,
                padding: "14px 12px",
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>{l.icon}</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                {l.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Row className="g-4">
        {/* Recent Donations */}
        <Col md={6}>
          <div className="table-wrapper">
            <div
              className="table-header-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Sora",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                Recent Donations
              </span>
              <button
                className="btn-glass"
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                onClick={() => navigate("/dashboard/donations")}
              >
                View All
              </button>
            </div>
            <DataTable
              columns={donationCols}
              data={recentDonations}
              loading={loading}
            />
          </div>
        </Col>

        {/* Pending Tests */}
        <Col md={6}>
          <div className="table-wrapper">
            <div
              className="table-header-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Sora",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                Pending Test Results
              </span>
              <button
                className="btn-glass"
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                onClick={() => navigate("/dashboard/test-results")}
              >
                View All
              </button>
            </div>
            {pendingTests.length === 0 && !loading ? (
              <div
                style={{
                  padding: "20px",
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                No pending tests 🎉
              </div>
            ) : (
              <DataTable
                columns={testCols}
                data={pendingTests}
                loading={loading}
              />
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
