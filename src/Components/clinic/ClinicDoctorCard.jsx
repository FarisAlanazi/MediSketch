import { useState } from "react";
import ClinicDoctorAvailabilityEditor from "./ClinicDoctorAvailabilityEditor";
import ClinicDoctorAppointmentEditor from "./ClinicDoctorAppointmentEditor"; // Added this import

function ClinicDoctorCard({
                              doctor,
                              appointments, // Added this
                              onUpdateAppointmentStatus, // Added this
                              clinicName,
                              onRemoveDoctor,
                              onSaveAvailability,
                              isRemoving,
                              isSavingAvailability,
                          }) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isAppointmentOpen, setIsAppointmentOpen] = useState(false); // Added this state

    const doctorName = `${doctor?.user?.first_name ?? ""} ${doctor?.user?.last_name ?? ""}`.trim() || doctor?.user?.username || "Doctor";

    return (
        <article style={{ background: "var(--white)", borderRadius: "10px", padding: "1rem", border: "1px solid var(--grey-200)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h3 style={{ fontSize: "1.1rem" }}>{doctorName}</h3>
                    <p style={{ color: "var(--grey-600)" }}>ID: {doctor.id}</p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                    {/* Added Manage Appointments toggle */}
                    <button type="button" className="btn" onClick={() => { setIsAppointmentOpen(!isAppointmentOpen); setIsEditorOpen(false); }}>
                        {isAppointmentOpen ? "Hide Bookings" : "Manage Appointments"}
                    </button>

                    <button type="button" className="btn" onClick={() => { setIsEditorOpen(!isEditorOpen); setIsAppointmentOpen(false); }}>
                        {isEditorOpen ? "Hide availability" : "Edit availability"}
                    </button>

                    <button type="button" className="btn" onClick={() => onRemoveDoctor(doctor.id)} disabled={isRemoving} style={{ background: "var(--grey-700)" }}>
                        {isRemoving ? "Removing..." : "Remove"}
                    </button>
                </div>
            </div>

            {isEditorOpen && (
                <ClinicDoctorAvailabilityEditor doctor={doctor} onSaveAvailability={onSaveAvailability} isSaving={isSavingAvailability} />
            )}

            {/* Added the Appointments Manager view */}
            {isAppointmentOpen && (
                <ClinicDoctorAppointmentEditor
                    appointments={appointments}
                    onUpdateStatus={onUpdateAppointmentStatus}
                />
            )}
        </article>
    );
}

export default ClinicDoctorCard;