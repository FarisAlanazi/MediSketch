import { useEffect, useState } from "react";
import api, { getCSRFToken } from "../../../Auth/LoginLogic";
import "../Profile_Style/profilePages.css";

const getPatientName = (appointment) => {
  const fullName =
    `${appointment?.patient?.user?.first_name ?? ""} ${
      appointment?.patient?.user?.last_name ?? ""
    }`.trim();

  return fullName || appointment?.patient?.user?.username || "Patient";
};

const normalizeStatus = (status) => String(status ?? "").trim().toLowerCase();

function DoctorAppointments() {
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
      setActionError("Unable to approve this appointment right now.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <section className="profile-record-page">
      <header className="record-page-header">
        <p>Appointments</p>
        <h1>Doctor appointments</h1>
        <span>See the bookings linked to your account in one simple list.</span>
      </header>

      <div className="record-card">
        {isLoading ? (
          <div className="record-empty-state">Loading appointments...</div>
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
                      <h2>{getPatientName(appointment)}</h2>
                      <p className="record-item-meta">
                        {appointment?.patient?.user?.phone_number ||
                          appointment?.patient?.user?.email ||
                          "Patient account"}
                      </p>
                    </div>

                    <span
                      className={`record-status-pill record-status-${normalizeStatus(appointment.status)}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <p className="record-item-meta">
                    Date: {appointment.date} | Time: {appointment.time}
                  </p>
                  <p className="record-item-note">
                    This appointment came from a real booking request.
                  </p>

                  {normalizeStatus(appointment.status) === "pending" ? (
                    <div className="record-item-actions">
                      <button
                        type="button"
                        className="record-approve-button"
                        onClick={() => handleApprove(appointment.id)}
                        disabled={approvingId === appointment.id}
                      >
                        {approvingId === appointment.id ? "Approving..." : "Approve"}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="record-empty-state">
            No appointments have been booked yet.
          </div>
        )}
      </div>
    </section>
  );
}

export default DoctorAppointments;
