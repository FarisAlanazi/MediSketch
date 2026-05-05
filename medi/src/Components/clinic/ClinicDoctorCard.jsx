// This imports local state for simple card interactions.
import { useState } from "react";
// This imports the clinic-only availability editor.
import ClinicDoctorAvailabilityEditor from "./ClinicDoctorAvailabilityEditor";
import { normalizeAppointmentStatus } from "../../utils/appointmentStatus";

// This component renders one clinic-managed doctor card.
function ClinicDoctorCard({
  doctor,
  appointments,
  clinicName,
  onRemoveDoctor,
  onSaveAvailability,
  onUpdateAppointmentStatus,
  isRemoving,
  isSavingAvailability,
  processingAppointmentId,
  processingAppointmentStatus,
  rejectAppointmentStatus,
}) {
  // This controls whether the inline availability editor is visible.
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  // This prefers the authoritative clinic relation before falling back to text.
  const doctorClinicName = doctor?.clinic?.name || doctor?.clinic_name || clinicName;
  // This keeps the doctor display name readable even when fields are missing.
  const doctorName =
    `${doctor?.user?.first_name ?? ""} ${doctor?.user?.last_name ?? ""}`.trim() ||
    doctor?.user?.username ||
    "Doctor";
  const pendingAppointments = (appointments || []).filter(
    (appointment) => normalizeAppointmentStatus(appointment?.status) === "pending",
  );

  // This confirms the unlink action before calling the backend.
  const handleRemoveClick = async () => {
    // This asks for user confirmation before unlinking the doctor.
    const didConfirmRemoval = window.confirm(
      `Remove ${doctorName} from this clinic?`,
    );
    // This stops the unlink action when the user cancels.
    if (!didConfirmRemoval) {
      return;
    }
    // This forwards the unlink request to the parent action.
    await onRemoveDoctor(doctor.id);
  };

  return (
    // This keeps the doctor card plain and easy to scan.
    <article
      style={{
        background: "var(--white)",
        borderRadius: "10px",
        boxShadow: "var(--shadow-1)",
        padding: "1rem",
        border: "1px solid var(--grey-200)",
      }}
    >
      {/* This renders the main doctor identity row. */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* This groups the doctor summary fields without decorative extras. */}
        <div style={{ display: "grid", gap: "0.35rem" }}>
          {/* This displays the doctor name prominently. */}
          <h3 style={{ fontSize: "1.1rem" }}>{doctorName}</h3>
          {/* This displays the doctor specialization when available. */}
          <p style={{ color: "var(--grey-600)" }}>
            {doctor.specialization || "Specialization not listed"}
          </p>
          {/* This renders the clinic badge only when clinic relation data exists. */}
          {doctorClinicName ? (
            <p style={{ color: "var(--primary-700)", fontSize: "0.95rem" }}>
              Clinic: {doctorClinicName}
            </p>
          ) : null}
        </div>

        {/* This renders the doctor management actions. */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* This toggles the inline availability editor. */}
          <button
            type="button"
            className="btn"
            onClick={() => setIsEditorOpen((currentValue) => !currentValue)}
          >
            {isEditorOpen ? "Hide availability" : "Edit availability"}
          </button>

          {/* This triggers the unlink action for the doctor. */}
          <button
            type="button"
            className="btn"
            onClick={handleRemoveClick}
            disabled={isRemoving}
            style={{ background: "var(--grey-700)" }}
          >
            {isRemoving ? "Removing..." : "Remove doctor"}
          </button>
        </div>
      </div>

      {/* This renders the doctor metadata as plain lines. */}
      <div style={{ display: "grid", gap: "0.3rem", marginTop: "0.9rem" }}>
        {/* This renders the doctor id line. */}
        <p style={{ color: "var(--grey-700)" }}>Doctor ID: {doctor.id}</p>
        {/* This renders the doctor city line when available. */}
        {doctor.city ? <p style={{ color: "var(--grey-700)" }}>City: {doctor.city}</p> : null}
        {/* This renders the doctor rating line when available. */}
        {doctor.rating ? <p style={{ color: "var(--grey-700)" }}>Rating: {doctor.rating}</p> : null}
      </div>

      {pendingAppointments.length ? (
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--grey-200)",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <h4 style={{ fontSize: "1rem" }}>Pending appointments</h4>
          {pendingAppointments.map((appointment) => {
            const patientName =
              `${appointment?.patient?.user?.first_name ?? ""} ${
                appointment?.patient?.user?.last_name ?? ""
              }`.trim() ||
              appointment?.patient?.user?.username ||
              "Patient";
            const isProcessing = processingAppointmentId === appointment.id;

            return (
              <div
                key={appointment.id}
                style={{
                  border: "1px solid var(--grey-200)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  display: "grid",
                  gap: "0.35rem",
                }}
              >
                <p style={{ fontWeight: 600 }}>{patientName}</p>
                <p style={{ color: "var(--grey-700)" }}>
                  {appointment.date} at {appointment.time}
                </p>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => onUpdateAppointmentStatus(appointment.id, "accepted")}
                    disabled={isProcessing}
                  >
                    {isProcessing && processingAppointmentStatus === "accepted"
                      ? "Accepting..."
                      : "Accept"}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      onUpdateAppointmentStatus(appointment.id, rejectAppointmentStatus)
                    }
                    disabled={isProcessing}
                    style={{ background: "var(--grey-700)" }}
                  >
                    {isProcessing &&
                    processingAppointmentStatus === rejectAppointmentStatus
                      ? "Declining..."
                      : "Decline"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* This renders the availability editor only when requested. */}
      {isEditorOpen ? (
        <ClinicDoctorAvailabilityEditor
          doctor={doctor}
          onSaveAvailability={onSaveAvailability}
          isSaving={isSavingAvailability}
        />
      ) : null}
    </article>
  );
}

// This exports the clinic doctor card for clinic doctor lists.
export default ClinicDoctorCard;
