import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../Auth/LoginLogic";
import { useTranslation } from "react-i18next";
import {
  acceptClinicRequest,
  getClinicErrorMessage,
  getDoctorClinicRequests,
  rejectClinicRequest,
} from "../../../Components/clinic/clinicApi";
import {
  getClinicRequestClinicName,
  normalizeClinicRequestStatus,
} from "../../../utils/clinicRequestHelpers";
import "../Profile_Style/profilePages.css";

const createEmptyAvailabilityForm = () => ({
  date: "",
  time: "",
});

function DrDashboard() {
  const { t } = useTranslation();
  const [availabilityForm, setAvailabilityForm] = useState(
    createEmptyAvailabilityForm(),
  );
  const [availableTimes, setAvailableTimes] = useState([]);
  const [clinicRequests, setClinicRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClinicRequests, setIsLoadingClinicRequests] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [clinicRequestsError, setClinicRequestsError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [processingClinicRequestId, setProcessingClinicRequestId] =
    useState(null);
  const [processingClinicAction, setProcessingClinicAction] = useState("");

  const loadAvailableTimes = async (canUpdate = () => true) => {
    if (canUpdate()) {
      setIsLoading(true);
      setLoadError("");
    }

    try {
      const response = await api.get("/available/");

      if (!canUpdate()) {
        return;
      }

      const preparedTimes = Array.isArray(response.data) ? response.data : [];
      setAvailableTimes(preparedTimes);
    } catch {
      if (!canUpdate()) {
        return;
      }

      setLoadError(t("dashboard.loadError"));
    } finally {
      if (canUpdate()) {
        setIsLoading(false);
      }
    }
  };

  const loadClinicRequests = async (canUpdate = () => true) => {
    if (canUpdate()) {
      setIsLoadingClinicRequests(true);
      setClinicRequestsError("");
    }

    try {
      const response = await getDoctorClinicRequests();

      if (!canUpdate()) {
        return;
      }

      // This keeps only pending clinic requests in the doctor dashboard section.
      const pendingClinicRequests = (Array.isArray(response) ? response : [])
        .filter((request) => {
          const requestStatus = normalizeClinicRequestStatus(request?.status);
          console.log(requestStatus, "Clinic requests"); // all prev and current requests status,

          return !requestStatus || requestStatus === "pending";
        })
        .map((request) => ({
          ...request,
          clinicDisplayName: getClinicRequestClinicName(request),
        }));
      console.log(pendingClinicRequests); //an array of pending clinic reqs.

      setClinicRequests(pendingClinicRequests);
    } catch (error) {
      if (!canUpdate()) {
        return;
      }

      setClinicRequestsError(
        error?.message ||
          getClinicErrorMessage(
            error,
            "Unable to load clinic requests right now.",
          ),
      );
    } finally {
      if (canUpdate()) {
        setIsLoadingClinicRequests(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true; // canUpdate flag .
    loadAvailableTimes(() => isMounted); //run the func and pass the isMounted func as a param to check if the component is still mounted before updating state
    loadClinicRequests(() => isMounted);

    return () => {
      isMounted = false;
    };
  }, [t]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAvailabilityForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!availabilityForm.date || !availabilityForm.time) {
      toast.error(t("dashboard.emptyDateTime"));
      return;
    }

    setIsSaving(true);

    try {
      await api.post("/available/", {
        date: availabilityForm.date,
        time: availabilityForm.time,
        status: true,
      });

      setAvailabilityForm(createEmptyAvailabilityForm());
      toast.success(t("dashboard.addSuccess"));
      await loadAvailableTimes(); // get availability again to update the list with the new entry
    } catch {
      toast.error(t("dashboard.addError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClinicRequestAction = async (requestId, actionType) => {
    setProcessingClinicRequestId(requestId);
    setProcessingClinicAction(actionType);

    try {
      if (actionType === "accept") {
        await acceptClinicRequest(requestId);
        toast.success("Clinic request accepted.");
      } else {
        await rejectClinicRequest(requestId);
        toast.success("Clinic request rejected.");
      }

      // This removes the handled request so the pending list updates without reloading the whole dashboard.
      setClinicRequests(
        (currentRequests) =>
          currentRequests.filter((request) => request.id !== requestId), //create a new list without the handled req
      );
    } catch (error) {
      toast.error(
        getClinicErrorMessage(
          error,
          actionType === "accept"
            ? "Unable to accept clinic request."
            : "Unable to reject clinic request.",
        ),
      );
    } finally {
      setProcessingClinicRequestId(null);
      setProcessingClinicAction("");
    }
  };

  return (
    <section className="dashboard-page">
      <header className="dashboard-page-header">
        <p>{t("dashboard.label")}</p>
        <h1>{t("dashboard.title")}</h1>
        <span>{t("dashboard.subtitle")}</span>
      </header>

      <div className="dashboard-layout">
        <form
          className="dashboard-card dashboard-form-grid"
          onSubmit={handleSubmit}
        >
          <div>
            <h2>{t("dashboard.formTitle")}</h2>
            <p>{t("dashboard.formSubtitle")}</p>
          </div>

          <label htmlFor="availability-date">
            {t("dashboard.date")}
            <input
              type="date"
              id="availability-date"
              name="date"
              value={availabilityForm.date}
              onChange={handleChange}
            />
          </label>

          <label htmlFor="availability-time">
            {t("dashboard.time")}
            <input
              type="time"
              id="availability-time"
              name="time"
              value={availabilityForm.time}
              onChange={handleChange}
            />
          </label>

          <button
            type="submit"
            className="dashboard-submit-button"
            disabled={isSaving}
          >
            {isSaving ? t("dashboard.saving") : t("dashboard.add")}
          </button>
        </form>

        <div className="dashboard-card">
          <h2>{t("dashboard.existingTitle")}</h2>
          {isLoading ? (
            <div className="dashboard-empty-state">
              {t("dashboard.loading")}
            </div>
          ) : loadError ? (
            <div className="dashboard-empty-state">{loadError}</div>
          ) : availableTimes.length ? (
            <div className="dashboard-list">
              {availableTimes.map((slot) => (
                <article key={slot.id} className="dashboard-item">
                  <div className="dashboard-item-header">
                    <h2>
                      {slot.date} {t("dashboard.at")} {slot.time}
                    </h2>
                    <span className="dashboard-status-pill">
                      {slot.status
                        ? t("dashboard.available")
                        : t("dashboard.booked")}
                    </span>
                  </div>
                  <p className="dashboard-item-meta">{t("dashboard.listed")}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">{t("dashboard.empty")}</div>
          )}
        </div>
      </div>

      <div className="dashboard-card" style={{ marginTop: "1.25rem" }}>
        <h2>Clinic Requests</h2>
        <p>Pending clinic requests appear here.</p>

        {isLoadingClinicRequests ? (
          <div className="dashboard-empty-state">
            Loading clinic requests...
          </div>
        ) : clinicRequestsError ? (
          <div className="dashboard-empty-state">{clinicRequestsError}</div>
        ) : clinicRequests.length ? (
          <div className="dashboard-list">
            {clinicRequests.map((request) => (
              <article key={request.id} className="dashboard-item">
                <div className="dashboard-item-header">
                  <div>
                    <h2>{request.clinicDisplayName}</h2>
                    {request?.clinic?.address || request?.address ? (
                      <p className="dashboard-item-meta">
                        {request?.clinic?.address || request?.address}
                      </p>
                    ) : null}
                  </div>

                  <span className="dashboard-status-pill">Pending</span>
                </div>

                <div className="record-item-actions">
                  <button
                    type="button"
                    className="record-approve-button"
                    onClick={() =>
                      handleClinicRequestAction(request.id, "accept")
                    }
                    disabled={processingClinicRequestId === request.id}
                  >
                    {processingClinicRequestId === request.id &&
                    processingClinicAction === "accept"
                      ? "Accepting..."
                      : "Accept"}
                  </button>
                  <button
                    type="button"
                    className="record-reject-button"
                    onClick={() =>
                      handleClinicRequestAction(request.id, "reject")
                    }
                    disabled={processingClinicRequestId === request.id}
                  >
                    {processingClinicRequestId === request.id &&
                    processingClinicAction === "reject"
                      ? "Rejecting..."
                      : "Reject"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            No clinic requests are waiting right now.
          </div>
        )}
      </div>
    </section>
  );
}

export default DrDashboard;
