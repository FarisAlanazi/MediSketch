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

function Appointments() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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

  return (
    <section className="profile-record-page">
      <header className="record-page-header">
        <p>{t("records.appointmentsLabel")}</p>
        <h1>{t("records.appointmentsTitle")}</h1>
        <span>{t("records.appointmentsSubtitle")}</span>
      </header>

      <div className="record-card">
        {isLoading ? (
          <div className="record-empty-state">{t("records.loadingAppointments")}</div>
        ) : loadError ? (
          <div className="record-empty-state">{loadError}</div>
        ) : appointments.length ? (
          <div className="record-list">
            {appointments.map((appointment) => (
              <article key={appointment.id} className="record-item">
                <div className="record-item-header">
                  <div>
                    <h2>{getDoctorName(appointment, t)}</h2>
                    <p className="record-item-meta">
                      {appointment?.doctor?.specialization ||
                        appointment?.doctor?.clinic_name ||
                        t("records.doctorAppointment")}
                    </p>
                  </div>

                  <span
                    className={`record-status-pill record-status-${appointment.status}`}
                  >
                    {t(`status.${String(appointment.status ?? "").toLowerCase()}`, {
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
                  {appointment?.doctor?.clinic_name || t("records.clinicNotListed")}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="record-empty-state">
            {t("records.noAppointments")}
          </div>
        )}
      </div>
    </section>
  );
}

export default Appointments;
