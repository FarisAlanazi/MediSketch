import { useEffect, useState } from "react";
import api, { getCSRFToken } from "../../../Auth/LoginLogic";
import { useTranslation } from "react-i18next";
import {
  getAppointmentStatusTranslationKey,
  getRejectAppointmentRequestStatus,
  normalizeAppointmentStatus,
} from "../../../utils/appointmentStatus";
import "../Profile_Style/profilePages.css";

const getPatientName = (appointment, t) => {
  const fullName = `${appointment?.patient?.user?.first_name ?? ""} ${
    appointment?.patient?.user?.last_name ?? ""
  }`.trim();

  return (
    fullName ||
    appointment?.patient?.user?.username ||
    t("records.patientFallback")
  );
};

function DoctorPendingRequests() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState("");
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
          (appointment) =>
            normalizeAppointmentStatus(appointment?.status) === "pending",
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

  const handleStatusUpdate = async (requestId, nextStatus) => {
    //request id = the appointment id, nextStatus = the status to update to based on the doctor action (accept or reject).
    setProcessingRequestId(requestId);
    setProcessingStatus(nextStatus);
    setActionError("");
    await getCSRFToken();

    try {
      await api.patch(`/appointments/${requestId}/`, {
        //find the appointment by its id
        status: nextStatus, // change it statue to either accepted or rejected
      });

      setRequests(
        (
          currentRequests, // after updating the status, the appointment will be removed from the pending list
        ) => currentRequests.filter((request) => request.id !== requestId), //give all the pending requests except the one that was just updated
      );
    } catch {
      //
      setActionError(
        // works if error occurs during status change.
        nextStatus === "accepted" // Check whether the failed action was approval.
          ? t("records.approveError")
          : t("records.rejectError"),
      );
    } finally {
      //clearance code.
      setProcessingRequestId(null);
      setProcessingStatus("");
    }
  }; // Keep one shared updater so the pending screen does not duplicate approval and rejection logic.

  return (
    <section className="profile-record-page">
      <header className="record-page-header">
        <p>{t("records.requestsLabel")}</p>
        <h1>{t("records.requestsTitle")}</h1>
        <span>{t("records.requestsSubtitle")}</span>
      </header>

      <div className="record-card">
        {isLoading ? (
          <div className="record-empty-state">
            {t("records.loadingRequests")}
          </div>
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
                      className={`record-status-pill record-status-${getAppointmentStatusTranslationKey(request.status)} `}
                    >
                      {console.log(
                        getAppointmentStatusTranslationKey(request.status),
                      )}
                      {t(
                        `status.${getAppointmentStatusTranslationKey(request.status)}`,
                        {
                          defaultValue: request.status,
                        },
                      )}
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

                  {normalizeAppointmentStatus(request.status) === "pending" ? (
                    <div className="record-item-actions">
                      <button
                        type="button"
                        className="record-approve-button"
                        onClick={
                          () => handleStatusUpdate(request.id, "accepted") // updating function
                        }
                        disabled={processingRequestId === request.id} // prevent multiple clicks while processing the current action
                      >
                        {processingRequestId === request.id &&
                        processingStatus === "accepted"
                          ? t("records.approving")
                          : t("records.approve")}
                      </button>
                      <button
                        type="button"
                        className="record-reject-button"
                        onClick={() =>
                          // updating function
                          handleStatusUpdate(
                            request.id,
                            getRejectAppointmentRequestStatus(),
                          )
                        }
                        disabled={processingRequestId === request.id}
                      >
                        {processingRequestId === request.id &&
                        processingStatus === getRejectAppointmentRequestStatus()
                          ? t("records.rejecting")
                          : t("records.reject")}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="record-empty-state">{t("records.noRequests")}</div>
        )}
      </div>
    </section>
  );
}

export default DoctorPendingRequests;
