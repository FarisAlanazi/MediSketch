// This imports the clinic-specific doctor card renderer.
import ClinicDoctorCard from "./ClinicDoctorCard";

function ClinicDoctorsSection({
                                  doctors,
                                  appointments = [],
                                  onUpdateAppointmentStatus,
                                  clinicName,
                                  onRemoveDoctor,
                                  onSaveAvailability,
                                  removingDoctorId,
                                  savingAvailabilityDoctorId,
                              }) {
    if (!doctors || !doctors.length) {
        return (
            <section style={{ background: "var(--white)", borderRadius: "10px", padding: "1.25rem", border: "1px solid var(--grey-200)" }}>
                <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>Clinic doctors</h2>
                <p style={{ color: "var(--grey-500)" }}>No doctors are linked to this clinic yet.</p>
            </section>
        );
    }

    return (
        <section style={{ display: "grid", gap: "1rem" }}>
            <header>
                <h2 style={{ fontSize: "1.25rem", marginBottom: "0.35rem" }}>Clinic doctors</h2>
                <p style={{ color: "var(--grey-500)" }}>Linked doctors appear here.</p>
            </header>

            {doctors.map((doctor) => {
                // Updated Filter: Check if app.doctor is the ID OR if app.doctor.id matches
                const doctorAppointments = appointments.filter((app) => {
                    const appId = app.doctor?.id || app.doctor;
                    return String(appId) === String(doctor.id);
                });

                return (
                    <ClinicDoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        clinicName={clinicName}
                        onRemoveDoctor={onRemoveDoctor}
                        onSaveAvailability={onSaveAvailability}
                        isRemoving={removingDoctorId === doctor.id}
                        isSavingAvailability={savingAvailabilityDoctorId === doctor.id}
                        appointments={doctorAppointments}
                        onUpdateAppointmentStatus={onUpdateAppointmentStatus}
                    />
                );
            })}
        </section>
    );
}

export default ClinicDoctorsSection;