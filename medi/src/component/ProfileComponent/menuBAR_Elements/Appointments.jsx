import { useEffect, useState } from "react";
import api from "../../../Auth/LoginLogic";
import "../Profile_Style/profilePages.css";

const getDoctorName = (appointment) => {
  const fullName =
    `${appointment?.doctor?.user?.first_name ?? ""} ${
      appointment?.doctor?.user?.last_name ?? ""
    }`.trim();

  return fullName || appointment?.doctor?.user?.username || "Doctor";
};

function Appointments() {
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
          setLoadError("Unable to load appointments right now.");
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
  }, []);

  return (
    <section className="profile-record-page">
      <header className="record-page-header">
        <p>Appointments</p>
        <h1>My appointments</h1>
        <span>Review your doctor bookings in a simple readable list.</span>
      </header>

      <div className="record-card">
        {isLoading ? (
          <div className="record-empty-state">Loading appointments...</div>
        ) : loadError ? (
          <div className="record-empty-state">{loadError}</div>
        ) : appointments.length ? (
          <div className="record-list">
            {appointments.map((appointment) => (
              <article key={appointment.id} className="record-item">
                <div className="record-item-header">
                  <div>
                    <h2>{getDoctorName(appointment)}</h2>
                    <p className="record-item-meta">
                      {appointment?.doctor?.specialization ||
                        appointment?.doctor?.clinic_name ||
                        "Doctor appointment"}
                    </p>
                  </div>

                  <span
                    className={`record-status-pill record-status-${appointment.status}`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <p className="record-item-meta">
                  Date: {appointment.date} | Time: {appointment.time}
                </p>
                <p className="record-item-note">
                  {appointment?.doctor?.clinic_name || "Clinic location not listed."}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="record-empty-state">
            You do not have any appointments yet.
          </div>
        )}
      </div>
    </section>
  );
}

export default Appointments;
