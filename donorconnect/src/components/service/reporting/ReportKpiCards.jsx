import { Row, Col } from 'react-bootstrap';
import StatCard from '../../shared/ui/StatCard';

export default function ReportKpiCards({ donorActivity, donationFrequency }) {
  return (
    <Row className="g-3 mb-4">
      <Col xs={6} md={3}>
        <StatCard
          title="Total Donors"
          value={donorActivity?.TOTAL ?? '—'}
          color="primary"
          icon="🫀"
        />
      </Col>
      <Col xs={6} md={3}>
        <StatCard
          title="Active Donors"
          value={donorActivity?.ACTIVE ?? '—'}
          color="success"
          icon="✅"
        />
      </Col>
      <Col xs={6} md={3}>
        <StatCard
          title="Total Donations"
          value={donationFrequency?.totalDonations ?? '—'}
          color="primary"
          icon="💉"
        />
      </Col>
      <Col xs={6} md={3}>
        <StatCard
          title="Donations This Month"
          value={donationFrequency?.thisMonth ?? '—'}
          color="warning"
          icon="📅"
        />
      </Col>
    </Row>
  );
}
