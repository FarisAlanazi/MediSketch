import React from "react";

function ClinicDoctorAppointmentEditor({ appointments, onUpdateStatus }) {
    return (
        <section
            style={{
                marginTop: "0.9rem",
                padding: "0.9rem",
                border: "1px solid var(--grey-200)",
                borderRadius: "8px",
                background: "transparent",
            }}
        >
            <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
                Manage Appointments
            </h3>

            {appointments.length === 0 ? (
                <p style={{ color: "var(--grey-500)", fontSize: "0.85rem" }}>
                    No active bookings for this doctor.
                </p>
            ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {appointments.map((app) => (
                        <div
                            key={app.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.5rem",
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: "6px",
                                border: "1px solid var(--grey-200)"
                            }}
                        >
                            <div style={{ fontSize: "0.85rem" }}>
                                <p style={{ margin: 0 }}><strong>{app.patient_name}</strong></p>
                                <p style={{ margin: 0, color: "var(--grey-500)" }}>{app.date} | {app.time}</p>
                            </div>

                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                {app.status === "pending" ? (
                                    <>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => onUpdateStatus(app.id, "accepted")}
                                        >Approve</button>
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: "var(--grey-700)" }}
                                            onClick={() => onUpdateStatus(app.id, "declined")}
                                        >Decline</button>
                                    </>
                                ) : (
                                    <span style={{
                                        fontSize: "0.8rem",
                                        fontWeight: "bold",
                                        color: app.status === "accepted" ? "#10b981" : "#ef4444"
                                    }}>
                    {app.status.toUpperCase()}
                  </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ClinicDoctorAppointmentEditor;