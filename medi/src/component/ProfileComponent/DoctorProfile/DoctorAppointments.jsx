import { useEffect, useState } from "react";
import api, { getCSRFToken } from "../../../Auth/LoginLogic";
import { useTranslation } from "react-i18next";
import "../Profile_Style/profilePages.css";

const getPatientName = (appointment, t) => {
  const fullName =
    `${appointment?.patient?.user?.first_name ?? ""} ${
      appointment?.patient?.user?.last_name ?? ""
    }`.trim();

  return fullName || appointment?.patient?.user?.username || t("records.patientFallback");
};

const normalizeStatus = (status) => String(status ?? "").trim().toLowerCase();

function DoctorAppointments() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [approvingId, setApprovingId] = useState(null);
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
  }, [t]);

  const handleApprove = async (appointmentId) => {
    setApprovingId(appointmentId);
    setActionError("");
    await getCSRFToken();

    try {
      await api.patch(`/appointments/${appointmentId}/`, {
        status: "accepted",
      });

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: "accepted" }
            : appointment,
        ),
      );
    } catch {
      setActionError(t("records.approveError"));
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <section className="profile-record-page">
      <header className="record-page-header">
        <p>{t("records.appointmentsLabel")}</p>
        <h1>{t("records.doctorAppointmentsTitle")}</h1>
        <span>{t("records.doctorAppointmentsSubtitle")}</span>
      </header>

      <div className="record-card">
        {isLoading ? (
          <div className="record-empty-state">{t("records.loadingAppointments")}</div>
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
                      className={`record-status-pill record-status-${normalizeStatus(appointment.status)}`}
                    >
                      {t(`status.${normalizeStatus(appointment.status)}`, {
                        defaultValue: appointment.status,
                      })}
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

                  {normalizeStatus(appointment.status) === "pending" ? (
                    <div className="record-item-actions">
                      <button
                        type="button"
                        className="record-approve-button"
                        onClick={() => handleApprove(appointment.id)}
                        disabled={approvingId === appointment.id}
                      >
                        {approvingId === appointment.id
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
            {t("records.noDoctorAppointments")}
          </div>
        )}
      </div>
    </section>
  );
}

export default DoctorAppointments;
