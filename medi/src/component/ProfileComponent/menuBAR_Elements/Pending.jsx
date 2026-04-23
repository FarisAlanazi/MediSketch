import { useEffect, useState } from "react";
import api from "../../../Auth/LoginLogic";
import { useTranslation } from "react-i18next";
import "../Profile_Style/profilePages.css";

const getDoctorName = (appointment, t) => {
  const fullName =
    `${appointment?.doctor?.user?.first_name ?? ""} ${
      appointment?.doctor?.user?.last_name ?? ""
    }`.trim();

  return fullName || appointment?.doctor?.user?.username || t("records.doctorFallback");
};

function Pending() {
  const { t } = useTranslation();
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPendingAppointments = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await api.get("/appointments/");

        if (!isMounted) {
          return;
        }

        const pendingOnly = (Array.isArray(response.data) ? response.data : []).filter(
          (appointment) => appointment?.status === "pending",
        );

        setPendingAppointments(pendingOnly);
      } catch {
        if (isMounted) {
          setLoadError(t("records.pendingError"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPendingAppointments();

    return () => {
      isMounted = false;
    };
  }, [t]);

  return (
    <section className="profile-record-page">
      <header className="record-page-header">
        <p>{t("records.pendingLabel")}</p>
        <h1>{t("records.pendingTitle")}</h1>
        <span>{t("records.pendingSubtitle")}</span>
      </header>

      <div className="record-card">
        {isLoading ? (
          <div className="record-empty-state">{t("records.loadingPending")}</div>
        ) : loadError ? (
          <div className="record-empty-state">{loadError}</div>
        ) : pendingAppointments.length ? (
          <div className="record-list">
            {pendingAppointments.map((appointment) => (
              <article key={appointment.id} className="record-item">
                <div className="record-item-header">
                  <div>
                    <h2>{getDoctorName(appointment, t)}</h2>
                    <p className="record-item-meta">
                      {appointment?.doctor?.specialization ||
                        appointment?.doctor?.clinic_name ||
                        t("records.pendingRequest")}
                    </p>
                  </div>

                  <span className="record-status-pill record-status-pending">
                    {t(`status.${String(appointment.status ?? "").toLowerCase()}`, {
                      defaultValue: appointment.status,
                    })}
                  </span>
                </div>

                <p className="record-item-meta">
                  {t("records.requestDateTime", {
                    date: appointment.date,
                    time: appointment.time,
                  })}
                </p>
                <p className="record-item-note">
                  {t("records.pendingWaiting")}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="record-empty-state">
            {t("records.noPending")}
          </div>
        )}
      </div>
    </section>
  );
}

export default Pending;
