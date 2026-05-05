// This imports the clinic-specific doctor card renderer.
import ClinicDoctorCard from "./ClinicDoctorCard";

// This component renders the clinic doctor list only.
function ClinicDoctorsSection({
  doctors,
  appointments,
  clinicName,
  onRemoveDoctor,
  onSaveAvailability,
  onUpdateAppointmentStatus,
  removingDoctorId,
  savingAvailabilityDoctorId,
  processingAppointmentId,
  processingAppointmentStatus,
  rejectAppointmentStatus,
}) {
  // This renders a clear empty state when the clinic has no linked doctors.
  if (!doctors.length) {
    return (
      <section
        style={{
          background: "var(--white)",
          borderRadius: "10px",
          boxShadow: "var(--shadow-1)",
          padding: "1.25rem",
          border: "1px solid var(--grey-200)",
        }}
      >
        {/* This titles the empty clinic doctor section. */}
        <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
          Clinic doctors
        </h2>
        {/* This explains why the list is currently empty. */}
        <p style={{ color: "var(--grey-500)", lineHeight: 1.6 }}>
          No doctors are linked to this clinic yet.
        </p>
      </section>
    );
  }

  return (
    // This wraps the linked doctor cards in a simple stacked section.
    <section style={{ display: "grid", gap: "1rem" }}>
      {/* This titles the clinic doctor list. */}
      <header>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.35rem" }}>
          Clinic doctors
        </h2>
        {/* This describes the management actions available in the list. */}
        <p style={{ color: "var(--grey-500)", lineHeight: 1.6 }}>
          Linked doctors appear here.
        </p>
      </header>

      {/* This maps each linked doctor to the clinic-specific card. */}
      {doctors.map((doctor) => (
        <ClinicDoctorCard
          key={doctor.id}
          doctor={doctor}
          appointments={appointments.filter(
            (appointment) => appointment?.doctor?.id === doctor.id,
          )}
          clinicName={clinicName}
          onRemoveDoctor={onRemoveDoctor}
          onSaveAvailability={onSaveAvailability}
          onUpdateAppointmentStatus={onUpdateAppointmentStatus}
          isRemoving={removingDoctorId === doctor.id}
          isSavingAvailability={savingAvailabilityDoctorId === doctor.id}
          processingAppointmentId={processingAppointmentId}
          processingAppointmentStatus={processingAppointmentStatus}
          rejectAppointmentStatus={rejectAppointmentStatus}
        />
      ))}
    </section>
  );
}

// This exports the clinic doctor list renderer for the dashboard.
export default ClinicDoctorsSection;
