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

function DoctorPendingRequests() {
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

        const pendingRequests = (Array.isArray(response.data) ? response.data : []).filter(
          (appointment) => normalizeStatus(appointment?.status) === "pending",
        );

        setRequests(pendingRequests);
      } catch {
        if (isMounted) {
          setLoadError("Unable to load requests right now.");
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
  }, []);

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
      setActionError("Unable to approve this request right now.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <section className="profile-record-page">
      <header className="record-page-header">
        <p>Requests</p>
        <h1>Patient requests</h1>
        <span>Pending booking requests appear here so they are easy to scan.</span>
      </header>

      <div className="record-card">
        {isLoading ? (
          <div className="record-empty-state">Loading requests...</div>
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
                      <h2>{getPatientName(request)}</h2>
                      <p className="record-item-meta">
                        {request?.patient?.user?.phone_number ||
                          request?.patient?.user?.email ||
                          "Patient account"}
                      </p>
                    </div>

                    <span
                      className={`record-status-pill record-status-${normalizeStatus(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <p className="record-item-meta">
                    Request date: {request.date} | Time: {request.time}
                  </p>
                  <p className="record-item-note">
                    Appointment request waiting for the next action.
                  </p>

                  {normalizeStatus(request.status) === "pending" ? (
                    <div className="record-item-actions">
                      <button
                        type="button"
                        className="record-approve-button"
                        onClick={() => handleApprove(request.id)}
                        disabled={approvingId === request.id}
                      >
                        {approvingId === request.id ? "Approving..." : "Approve"}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="record-empty-state">
            No pending requests are waiting right now.
          </div>
        )}
      </div>
    </section>
  );
}

export default DoctorPendingRequests;
