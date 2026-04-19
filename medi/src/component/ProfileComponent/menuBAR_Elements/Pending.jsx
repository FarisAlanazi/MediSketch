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

function Pending() {
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
          setLoadError("Unable to load pending requests right now.");
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
  }, []);

  return (
    <section className="profile-record-page">
      <header className="record-page-header">
        <p>Pending</p>
        <h1>Pending appointment requests</h1>
        <span>See the requests that are still waiting for confirmation.</span>
      </header>

      <div className="record-card">
        {isLoading ? (
          <div className="record-empty-state">Loading pending requests...</div>
        ) : loadError ? (
          <div className="record-empty-state">{loadError}</div>
        ) : pendingAppointments.length ? (
          <div className="record-list">
            {pendingAppointments.map((appointment) => (
              <article key={appointment.id} className="record-item">
                <div className="record-item-header">
                  <div>
                    <h2>{getDoctorName(appointment)}</h2>
                    <p className="record-item-meta">
                      {appointment?.doctor?.specialization ||
                        appointment?.doctor?.clinic_name ||
                        "Pending request"}
                    </p>
                  </div>

                  <span className="record-status-pill record-status-pending">
                    {appointment.status}
                  </span>
                </div>

                <p className="record-item-meta">
                  Request date: {appointment.date} | Time: {appointment.time}
                </p>
                <p className="record-item-note">
                  This request has not been accepted or declined yet.
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="record-empty-state">
            No pending appointment requests are waiting right now.
          </div>
        )}
      </div>
    </section>
  );
}

export default Pending;
