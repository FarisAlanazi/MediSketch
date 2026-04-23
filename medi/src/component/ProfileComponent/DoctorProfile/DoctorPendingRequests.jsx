import { useEffect, useState } from "react";
import api, { getCSRFToken } from "../../../Auth/LoginLogic";
import { useTranslation } from "react-i18next";
import "../Profile_Style/profilePages.css";

const getPatientName = (appointment, t) => {
  const fullName = `${appointment?.patient?.user?.first_name ?? ""} ${
    appointment?.patient?.user?.last_name ?? ""
  }`.trim();

  return fullName || appointment?.patient?.user?.username || t("records.patientFallback");
};

const normalizeStatus = (status) =>
  String(status ?? "")
    .trim()
    .toLowerCase();

function DoctorPendingRequests() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [approvingId, setApprovingId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await api.get("/appointments/");

        if (!isMounted) {
          return;
        }

        const pendingRequests = (
          Array.isArray(response.data) ? response.data : []
        ).filter(
          (appointment) => normalizeStatus(appointment?.status) === "pending",
        );

        setRequests(pendingRequests);
      } catch {
        if (isMounted) {
          setLoadError(t("records.requestsError"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const handleApprove = async (requestId) => {
    setApprovingId(requestId);
    setActionError("");
    await getCSRFToken();

    try {
      await api.patch(`/appointments/${requestId}/`, {
        status: "accepted",
      });

      setRequests((currentRequests) =>
        currentRequests.filter((request) => request.id !== requestId),
      );
    } catch {
      setActionError(t("records.requestsError"));
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <section className="profile-record-page">
      <header className="record-page-header">
        <p>{t("records.requestsLabel")}</p>
        <h1>{t("records.requestsTitle")}</h1>
        <span>{t("records.requestsSubtitle")}</span>
      </header>

      <div className="record-card">
        {isLoading ? (
          <div className="record-empty-state">{t("records.loadingRequests")}</div>
        ) : loadError ? (
          <div className="record-empty-state">{loadError}</div>
        ) : requests.length ? (
          <>
            {actionError ? (
              <div className="record-action-error">{actionError}</div>
            ) : null}

            <div className="record-list">
              {requests.map((request) => (
                <article key={request.id} className="record-item">
                  <div className="record-item-header">
                    <div>
                      <h2>{getPatientName(request, t)}</h2>
                    <p className="record-item-meta">
                      {request?.patient?.user?.phone_number ||
                          request?.patient?.user?.email ||
                          t("records.patientAccount")}
                      </p>
                    </div>

                    <span
                      className={`record-status-pill record-status-${normalizeStatus(request.status)}`}
                    >
                      {t(`status.${normalizeStatus(request.status)}`, {
                        defaultValue: request.status,
                      })}
                    </span>
                  </div>

                  <p className="record-item-meta">
                    {t("records.requestDateTime", {
                      date: request.date,
                      time: request.time,
                    })}
                  </p>

                  <p className="record-item-note">
                    {t("records.requestWaiting")}
                  </p>

                  {normalizeStatus(request.status) === "pending" ? (
                    <div className="record-item-actions">
                      <button
                        type="button"
                        className="record-approve-button"
                        onClick={() => handleApprove(request.id)}
                        disabled={approvingId === request.id}
                      >
                        {approvingId === request.id
                          ? t("records.approving")
                          : t("records.approve")}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="record-empty-state">
            {t("records.noRequests")}
          </div>
        )}
      </div>
    </section>
  );
}

export default DoctorPendingRequests;
