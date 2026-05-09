import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../api/axiosInstance";
import PageHeader from "../../components/shared/ui/PageHeader";
import DonationList from "../../components/service/blood-supply/DonationList";
import DonationForm from "../../components/service/blood-supply/DonationForm";
import ComponentsModal from "../../components/service/blood-supply/ComponentsModal";
import { showSuccess, showError } from "../../components/shared/ui/AlertBanner";

const COLLECTION_STATUSES = ["COLLECTED", "INCOMPLETE", "REJECTED"];
const INIT_FORM = {
  donorId: "",
  bagId: "",
  volumeMl: "",
  collectionDate: "",
  collectedBy: "",
  collectionStatus: "COLLECTED",
};

export default function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [components, setComponents] = useState(null);
  const [form, setForm] = useState(INIT_FORM);
  const [statusFilter, setStatusFilter] = useState("");

  const [donorStatus, setDonorStatus] = useState("idle");
  const [donorName, setDonorName] = useState("");
  const debounceRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/api/donations")
      .then((r) => {
        const d = r.data?.data;
        setDonations(Array.isArray(d) ? d : (d?.content ?? []));
      })
      .catch(() => setDonations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checkDonor = (id) => {
    if (!id) {
      setDonorStatus("idle");
      setDonorName("");
      return;
    }
    setDonorStatus("checking");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await api.get(`/api/donors/${id}`);
        const donor = r.data?.data;
        if (donor) {
          setDonorStatus("valid");
          setDonorName(
            donor.firstName
              ? `${donor.firstName} ${donor.lastName || ""}`.trim()
              : donor.name || `Donor #${id}`,
          );
        } else {
          setDonorStatus("invalid");
          setDonorName("");
        }
      } catch {
        // 404 = donor not found, 403 = no permission, 500 = server error
        // all treated as invalid — backend will also block on POST
        setDonorStatus("invalid");
        setDonorName("");
      }
    }, 600);
  };

  const handleDonorIdChange = (val) => {
    setForm((f) => ({ ...f, donorId: val }));
    checkDonor(val);
  };

  const record = async () => {
    if (!form.donorId) {
      showError("Donor ID is required");
      return;
    }
    if (donorStatus === "invalid") {
      showError("Donor ID does not exist. Please enter a valid Donor ID.");
      return;
    }
    if (donorStatus === "checking") {
      showError("Please wait — verifying Donor ID...");
      return;
    }
    if (!form.bagId) {
      showError("Bag ID is required");
      return;
    }
    try {
      await api.post("/api/donations", {
        donorId: Number(form.donorId),
        bagId: form.bagId,
        volumeMl: form.volumeMl ? Number(form.volumeMl) : undefined,
        collectionDate: form.collectionDate || undefined,
        collectedBy: form.collectedBy || undefined,
        collectionStatus: form.collectionStatus,
      });
      showSuccess("Donation recorded");
      setShowModal(false);
      setForm(INIT_FORM);
      setDonorStatus("idle");
      setDonorName("");
      load();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed to record donation");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(INIT_FORM);
    setDonorStatus("idle");
    setDonorName("");
  };

  const viewComponents = async (donationId) => {
    try {
      const r = await api.get(`/api/components/donation/${donationId}`);
      setComponents(Array.isArray(r.data?.data) ? r.data.data : []);
    } catch {
      setComponents([]);
    }
  };

  const updateStatus = async (donationId, status) => {
    try {
      await api.patch(`/api/donations/${donationId}/status`, null, {
        params: { status },
      });
      showSuccess("Status updated");
      load();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="animate-fadein">
      <PageHeader title="Donations Log">
        <button className="btn-crimson" onClick={() => setShowModal(true)}>
          + Record Donation
        </button>
      </PageHeader>

      <DonationList
        donations={donations}
        loading={loading}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onViewComponents={viewComponents}
        onStatusUpdate={updateStatus}
        collectionStatuses={COLLECTION_STATUSES}
      />

      <DonationForm
        show={showModal}
        form={form}
        onFormChange={setForm}
        donorStatus={donorStatus}
        donorName={donorName}
        onDonorIdChange={handleDonorIdChange}
        onSubmit={record}
        onClose={closeModal}
        collectionStatuses={COLLECTION_STATUSES}
      />

      <ComponentsModal
        show={!!components}
        components={components}
        onClose={() => setComponents(null)}
      />
    </div>
  );
}
