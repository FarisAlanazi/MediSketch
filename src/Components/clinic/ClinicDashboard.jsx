// This imports effect and state for the authenticated clinic workspace.
import { useEffect, useState } from "react";
// This imports shared toast feedback used across the frontend.
import { toast } from "react-toastify";
// This imports the existing loading indicator for async page states.
import Loading from "../../Loading";
// This imports the clinic add-doctor form.
import ClinicDoctorAddForm from "./ClinicDoctorAddForm";
// This imports the clinic doctors list section.
import ClinicDoctorsSection from "./ClinicDoctorsSection";
// This imports the axios instance for manual appointment status updates.
import api from "../../Auth/LoginLogic";
// This imports clinic API helpers and shared error extraction.
import {
    createClinicRequest,
    createDoctorAvailability,
    findDoctorById,
    getClinicDoctors,
    getClinicErrorMessage,
    getClinicProfile,
    getClinicAppointments, // NECESSARY: Added to fetch appointment data[cite: 7]
    removeDoctorFromClinic,
    updateDoctorAvailability,
} from "./clinicApi";

// This card style keeps dashboard sections aligned with shared visual tokens.
const dashboardCardStyle = {
    background: "var(--white)",
    borderRadius: "10px",
    boxShadow: "var(--shadow-1)",
    padding: "1.25rem",
    border: "1px solid var(--grey-200)",
};

// This component renders the authenticated clinic workspace.
function ClinicDashboard() {
    // This stores the authenticated clinic profile data.
    const [clinicProfile, setClinicProfile] = useState(null);
    // This stores the doctors linked to the clinic.
    const [clinicDoctors, setClinicDoctors] = useState([]);
    // NECESSARY: Added state to store appointments for the "Manage Appointments" view[cite: 7].
    const [clinicAppointments, setClinicAppointments] = useState([]);
    // This tracks the initial clinic workspace loading state.
    const [isLoading, setIsLoading] = useState(true);
    // This stores any workspace load error for the dashboard.
    const [loadError, setLoadError] = useState("");
    // This tracks the current add-doctor submit state.
    const [isAddingDoctor, setIsAddingDoctor] = useState(false);
    // This tracks which doctor is being removed right now.
    const [removingDoctorId, setRemovingDoctorId] = useState(null);
    // This tracks which doctor availability is being saved right now.
    const [savingAvailabilityDoctorId, setSavingAvailabilityDoctorId] = useState(null);
    // This retriggers dashboard loading after successful mutations.
    const [reloadKey, setReloadKey] = useState(0);

    // This loads the clinic profile, doctor list, and appointments together.
    useEffect(() => {
        // This prevents state updates after the dashboard unmounts.
        let isMounted = true;

        // This requests the clinic workspace data from the backend.
        const loadClinicWorkspace = async () => {
            // This starts the dashboard loading state for the current request cycle.
            setIsLoading(true);
            // This clears the previous dashboard load error before retrying.
            setLoadError("");

            try {
                // NECESSARY: Added getClinicAppointments() to the parallel load[cite: 7].
                const [profileResponse, doctorsResponse, appointmentsResponse] = await Promise.all([
                    getClinicProfile(),
                    getClinicDoctors(),
                    getClinicAppointments(),
                ]);

                // This stops state writes when the component is already gone.
                if (!isMounted) {
                    return;
                }

                // This stores the authenticated clinic profile for the header.
                setClinicProfile(profileResponse);
                // This stores the linked clinic doctors for the list section.
                setClinicDoctors(Array.isArray(doctorsResponse) ? doctorsResponse : []);
                // NECESSARY: Stores the fetched appointments so they can be filtered by doctor[cite: 7].
                setClinicAppointments(Array.isArray(appointmentsResponse) ? appointmentsResponse : []);
            } catch (error) {
                // This stops state writes when the component is already gone.
                if (!isMounted) {
                    return;
                }

                // This stores the clearest dashboard load error for the page.
                setLoadError(
                    getClinicErrorMessage(error, "Unable to load clinic dashboard."),
                );
            } finally {
                // This finishes the loading state only while the component is mounted.
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // This starts the clinic workspace load on mount and after mutations.
        loadClinicWorkspace();

        // This prevents state updates after unmount.
        return () => {
            isMounted = false;
        };
    }, [reloadKey]);

    // NECESSARY: Added handler to process Approve/Reject actions from the clinic dashboard[cite: 7].
    const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            // This sends the status update to the backend appointment endpoint.
            await api.patch(`/appointments/${appointmentId}/`, { status: newStatus });
            // This confirms the action to the clinic user.
            toast.success(`Appointment ${newStatus} successfully.`);
            // This triggers a refresh to update the UI status.
            setReloadKey((prev) => prev + 1);
        } catch (error) {
            toast.error(getClinicErrorMessage(error, "Failed to update appointment."));
        }
    };

    // This sends a clinic request without changing the linked-doctor list directly.
    const handleSendDoctorRequest = async (doctorId) => {
        try {
            // This marks the clinic request as active.
            setIsAddingDoctor(true);
            // This sends the request to the dedicated clinic-request endpoint.
            await createClinicRequest(doctorId);
            // This confirms the clinic request was created successfully.
            toast.success("Clinic request sent.");
            // This tells the form the request succeeded.
            return true;
        } catch (error) {
            // This shows the clearest backend clinic-request error.
            toast.error(
                getClinicErrorMessage(error, "Unable to send clinic request."),
            );
            // This tells the form the request failed.
            return false;
        } finally {
            // This ends the clinic-request submit state.
            setIsAddingDoctor(false);
        }
    };

    // This removes a doctor from the clinic and refreshes the list afterwards.
    const handleRemoveDoctor = async (doctorId) => {
        try {
            // This tracks the doctor currently being removed.
            setRemovingDoctorId(doctorId);
            // This sends the unlink request to the backend.
            await removeDoctorFromClinic(doctorId);
            // This confirms the doctor was removed from the clinic.
            toast.success("Doctor removed from clinic.");
            // This refreshes the clinic workspace after the successful mutation.
            setReloadKey((currentValue) => currentValue + 1);
            // This tells the card the action succeeded.
            return true;
        } catch (error) {
            // This shows the clearest backend remove-doctor error.
            toast.error(
                getClinicErrorMessage(error, "Unable to remove doctor from clinic."),
            );
            // This tells the card the action failed.
            return false;
        } finally {
            // This clears the active remove-doctor marker.
            setRemovingDoctorId(null);
        }
    };

    // This saves clinic-managed availability and refreshes the list afterwards.
    const handleSaveAvailability = async (doctorId, availabilityPayload) => {
        try {
            // This tracks the doctor whose availability is being saved.
            setSavingAvailabilityDoctorId(doctorId);
            // This decides between slot creation and slot update.
            if (availabilityPayload.slot_id) {
                // This sends the slot update payload using the exact backend route.
                await updateDoctorAvailability(
                    doctorId,
                    availabilityPayload.slot_id,
                    {
                        date: availabilityPayload.date,
                        time: availabilityPayload.time,
                        status: availabilityPayload.status,
                    },
                );
            } else {
                // This sends the slot create payload using the exact backend route.
                await createDoctorAvailability(doctorId, {
                    date: availabilityPayload.date,
                    time: availabilityPayload.time,
                    status: availabilityPayload.status,
                });
            }
            // This confirms the availability save succeeded.
            toast.success("Availability saved successfully.");
            // This refreshes the clinic workspace after the successful mutation.
            setReloadKey((currentValue) => currentValue + 1);
            // This tells the editor the action succeeded.
            return true;
        } catch (error) {
            // This shows the clearest backend availability error.
            toast.error(
                getClinicErrorMessage(error, "Unable to save doctor availability."),
            );
            // This tells the editor the action failed.
            return false;
        } finally {
            // This clears the active availability save marker.
            setSavingAvailabilityDoctorId(null);
        }
    };

    // This keeps the loading UI aligned with the existing app pattern.
    if (isLoading) {
        return <Loading />;
    }

    // This renders a clear dashboard load error when one exists.
    if (loadError) {
        return (
            <section style={dashboardCardStyle}>
                {/* This titles the load error state clearly. */}
                <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
                    Clinic dashboard
                </h2>
                {/* This displays the actual workspace load error. */}
                <p className="alert alert-danger" style={{ marginBottom: 0 }}>
                    {loadError}
                </p>
            </section>
        );
    }

    return (
        // This arranges the clinic dashboard sections in a simple stacked layout.
        <section style={{ display: "grid", gap: "1rem" }}>
            {/* This renders the clinic profile summary card. */}
            <section style={dashboardCardStyle}>
                {/* This introduces the clinic profile area. */}
                <p style={{ color: "var(--grey-500)", marginBottom: "0.35rem" }}>
                    Clinic profile
                </p>
                {/* This shows the current clinic display name. */}
                <h1 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
                    {clinicProfile?.name || clinicProfile?.user?.username || "Clinic dashboard"}
                </h1>
                {/* This keeps the clinic identity details as simple text rows. */}
                <div style={{ display: "grid", gap: "0.4rem", color: "var(--grey-700)" }}>
                    {/* This shows the clinic username in a plain line. */}
                    <p>Username: {clinicProfile?.user?.username || "Not available"}</p>
                    {/* This shows the clinic email in a plain line. */}
                    <p>Email: {clinicProfile?.email || clinicProfile?.user?.email || "Not available"}</p>
                    {/* This shows the clinic address in a plain line. */}
                    <p>Address: {clinicProfile?.address || "Not available"}</p>
                </div>
            </section>

            {/* This renders the add-doctor form in its own dashboard card. */}
            <section style={dashboardCardStyle}>
                <ClinicDoctorAddForm
                    onResolveDoctor={findDoctorById}
                    onSendRequest={handleSendDoctorRequest}
                    isSubmitting={isAddingDoctor}
                />
            </section>

            {/* This renders the linked doctor management section. */}
            <ClinicDoctorsSection
                doctors={clinicDoctors}
                appointments={clinicAppointments} // NECESSARY: Passed to section for filtering[cite: 1]
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus} // NECESSARY: Passed to section[cite: 1]
                clinicName={clinicProfile?.name || ""}
                onRemoveDoctor={handleRemoveDoctor}
                onSaveAvailability={handleSaveAvailability}
                removingDoctorId={removingDoctorId}
                savingAvailabilityDoctorId={savingAvailabilityDoctorId}
            />
        </section>
    );
}

// This exports the clinic dashboard for authenticated clinic users.
export default ClinicDashboard;