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

function DoctorAppointments() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [processingAppointmentId, setProcessingAppointmentId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAppointments = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await api.get("/appointments/");

        if (!isMounted) {
          return;
        }

        setAppointments(Array.isArray(response.data) ? response.data : []);
      } catch {
        if (isMounted) {
          setLoadError(t("records.appointmentsError"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      isMounted = false;
    };
  }, [t]); // retun whenever t changes.

  const handleStatusUpdate = async (appointmentId, nextStatus) => {
    // Handle both doctor approval and rejection through one exact appointment status updater.
    setProcessingAppointmentId(appointmentId); // Track which appointment is being updated so only its buttons show the busy state.
    setProcessingStatus(nextStatus); // Store the next requested status so the correct loading label appears on the active button.
    setActionError(""); // Clear any earlier action error before the new request starts.
    await getCSRFToken(); // Refresh the CSRF token before sending the protected appointment update request.

    try {
      await api.patch(`/appointments/${appointmentId}/`, {
        // Send the doctor action through the existing appointment patch endpoint.
        status: nextStatus, // Reuse the backend status field as the only workflow source instead of adding extra flags.
      });

      setAppointments(
        (
          currentAppointments, // Update the local appointment list only after the request succeeds.
        ) =>
          currentAppointments.map(
            (
              appointment, // Walk through the current list once so only the changed appointment is replaced.
            ) =>
              appointment.id === appointmentId // Match the exact appointment that was updated by the doctor.
                ? { ...appointment, status: nextStatus } // Store the new status so the list reflects the latest doctor action immediately.
                : appointment, // Keep all other appointments unchanged because they were not part of this action.
          ), // Finish mapping the local appointments list.
      ); // Save the refreshed appointments state after the successful patch response.
    } catch {
      setActionError(
        // Show the exact error message that matches the requested action.
        nextStatus === "accepted" // Check whether the failed action was approval.
          ? t("records.approveError") // Use the approval error message when the doctor tried to accept.
          : t("records.rejectError"), // Use the rejection error message when the doctor tried to reject.
      ); // Save the action error so the doctor sees immediate feedback.
    } finally {
      setProcessingAppointmentId(null); // Clear the active appointment id after the request completes.
      setProcessingStatus(""); // Clear the active status after the request completes.
    }
  }; // Keep one shared status updater so approval and rejection do not duplicate business flow code in the UI.

  return (
    <section className="profile-record-page">
      <header className="record-page-header">
        <p>{t("records.appointmentsLabel")}</p>
        <h1>{t("records.doctorAppointmentsTitle")}</h1>
        <span>{t("records.doctorAppointmentsSubtitle")}</span>
      </header>

      <div className="record-card">
        {isLoading ? (
          <div className="record-empty-state">
            {t("records.loadingAppointments")}
          </div>
        ) : loadError ? (
          <div className="record-empty-state">{loadError}</div>
        ) : appointments.length ? (
          <>
            {actionError ? (
              <div className="record-action-error">{actionError}</div>
            ) : null}

            <div className="record-list">
              {appointments.map((appointment) => (
                <article key={appointment.id} className="record-item">
                  <div className="record-item-header">
                    <div>
                      <h2>{getPatientName(appointment, t)}</h2>
                      <p className="record-item-meta">
                        {appointment?.patient?.user?.phone_number ||
                          appointment?.patient?.user?.email ||
                          t("records.patientAccount")}
                      </p>
                    </div>

                    <span
                      className={`record-status-pill record-status-${getAppointmentStatusTranslationKey(appointment.status)}`} // dynamic className used to change the color of the status
                    >
                      {t(
                        `status.${getAppointmentStatusTranslationKey(appointment.status)}`,
                        {
                          defaultValue: appointment.status,
                        },
                      )}
                    </span>
                  </div>

                  <p className="record-item-meta">
                    {t("records.dateTime", {
                      date: appointment.date,
                      time: appointment.time,
                    })}
                  </p>
                  <p className="record-item-note">
                    {t("records.realBookingRequest")}
                  </p>

                  {normalizeAppointmentStatus(appointment.status) ===
                  "pending" ? (
                    <div className="record-item-actions">
                      <button
                        type="button"
                        className="record-approve-button"
                        onClick={() =>
                          handleStatusUpdate(appointment.id, "accepted")
                        }
                        disabled={processingAppointmentId === appointment.id}
                      >
                        {processingAppointmentId === appointment.id &&
                        processingStatus === "accepted"
                          ? t("records.approving")
                          : t("records.approve")}
                      </button>
                      <button
                        type="button"
                        className="record-reject-button"
                        onClick={() =>
                          handleStatusUpdate(
                            appointment.id,
                            getRejectAppointmentRequestStatus(),
                          )
                        }
                        disabled={processingAppointmentId === appointment.id}
                      >
                        {processingAppointmentId === appointment.id &&
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
          <div className="record-empty-state">
            {t("records.noDoctorAppointments")}
          </div>
        )}
      </div>
    </section>
  );
}

export default DoctorAppointments;
