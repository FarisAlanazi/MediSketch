import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loading from "../../Loading";
import ClinicDoctorAddForm from "./ClinicDoctorAddForm";
import ClinicDoctorsSection from "./ClinicDoctorsSection";
import {
  createClinicRequest,
  createDoctorAvailability,
  findDoctorById,
  getClinicAppointments,
  getClinicDoctors,
  getClinicErrorMessage,
  getClinicProfile,
  removeDoctorFromClinic,
  updateClinicAppointmentStatus,
  updateDoctorAvailability,
} from "./clinicApi";
import { getRejectAppointmentRequestStatus } from "../../utils/appointmentStatus";

const dashboardCardStyle = {
  background: "var(--white)",
  borderRadius: "10px",
  boxShadow: "var(--shadow-1)",
  padding: "1.25rem",
  border: "1px solid var(--grey-200)",
};

function ClinicDashboard() {
  const [clinicProfile, setClinicProfile] = useState(null);
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const [clinicAppointments, setClinicAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [removingDoctorId, setRemovingDoctorId] = useState(null);
  const [savingAvailabilityDoctorId, setSavingAvailabilityDoctorId] =
    useState(null);
  const [processingAppointmentId, setProcessingAppointmentId] = useState(null);
  const [processingAppointmentStatus, setProcessingAppointmentStatus] =
    useState("");
  const [reloadKey, setReloadKey] = useState(0); //used to refresh data after doctor add/remove/availability update

  useEffect(() => {
    let isMounted = true;

    const loadClinicWorkspace = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const [profileResponse, doctorsResponse, appointmentsResponse] =
          await Promise.all([
          getClinicProfile(), // API -> GET CLINIC PROFILE
          getClinicDoctors(), // API -> GET DOCTORS ASSOCIATED WITH THE CLINIC
          getClinicAppointments(),
        ]);

        if (!isMounted) {
          return;
        }

        setClinicProfile(profileResponse);
        setClinicDoctors(Array.isArray(doctorsResponse) ? doctorsResponse : []);
        setClinicAppointments(
          Array.isArray(appointmentsResponse) ? appointmentsResponse : [],
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          getClinicErrorMessage(error, "Unable to load clinic dashboard."),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadClinicWorkspace();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const handleSendDoctorRequest = async (doctorId) => {
    try {
      setIsAddingDoctor(true);
      await createClinicRequest(doctorId); // API -> POST NEW REQUEST TO THE DOCTOR
      toast.success("Clinic request sent.");
      return true;
    } catch (error) {
      toast.error(
        getClinicErrorMessage(error, "Unable to send clinic request."),
      );
      return false;
    } finally {
      setIsAddingDoctor(false);
    }
  };

  const handleRemoveDoctor = async (doctorId) => {
    try {
      setRemovingDoctorId(doctorId);
      await removeDoctorFromClinic(doctorId); // API -> DELETE
      toast.success("Doctor removed from clinic.");
      setReloadKey((currentValue) => currentValue + 1);
      return true;
    } catch (error) {
      toast.error(
        getClinicErrorMessage(error, "Unable to remove doctor from clinic."),
      );

      return false;
    } finally {
      setRemovingDoctorId(null);
    }
  };

  const handleSaveAvailability = async (doctorId, availabilityPayload) => {
    try {
      setSavingAvailabilityDoctorId(doctorId);
      if (availabilityPayload.slot_id) {
        await updateDoctorAvailability(doctorId, availabilityPayload.slot_id, {
          // API -> PUT (update) DOCTOR AVAILABILITY
          date: availabilityPayload.date,
          time: availabilityPayload.time,
          status: availabilityPayload.status,
        });
      } else {
        await createDoctorAvailability(doctorId, {
          // API -> POST (create) DOCTOR AVAILABILITY
          date: availabilityPayload.date,
          time: availabilityPayload.time,
          status: availabilityPayload.status,
        });
      }
      toast.success("Availability saved successfully.");
      setReloadKey((currentValue) => currentValue + 1);
      return true;
    } catch (error) {
      toast.error(
        getClinicErrorMessage(error, "Unable to save doctor availability."),
      );
      return false;
    } finally {
      setSavingAvailabilityDoctorId(null);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, nextStatus) => {
    try {
      setProcessingAppointmentId(appointmentId);
      setProcessingAppointmentStatus(nextStatus);
      await updateClinicAppointmentStatus(appointmentId, nextStatus);
      setClinicAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: nextStatus }
            : appointment,
        ),
      );
      toast.success(
        nextStatus === "accepted"
          ? "Appointment accepted."
          : "Appointment declined.",
      );
      return true;
    } catch (error) {
      toast.error(
        getClinicErrorMessage(error, "Unable to update appointment."),
      );
      return false;
    } finally {
      setProcessingAppointmentId(null);
      setProcessingAppointmentStatus("");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (loadError) {
    return (
      <section style={dashboardCardStyle}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
          Clinic dashboard
        </h2>
        <p className="alert alert-danger" style={{ marginBottom: 0 }}>
          {loadError}
        </p>
      </section>
    );
  }

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <section style={dashboardCardStyle}>
        <p style={{ color: "var(--grey-500)", marginBottom: "0.35rem" }}>
          Clinic profile
        </p>
        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          {clinicProfile?.name ||
            clinicProfile?.user?.username ||
            "Clinic dashboard"}
        </h1>
        <div
          style={{ display: "grid", gap: "0.4rem", color: "var(--grey-700)" }}
        >
          <p>Username: {clinicProfile?.user?.username || "Not available"}</p>
          <p>
            Email:{" "}
            {clinicProfile?.email ||
              clinicProfile?.user?.email ||
              "Not available"}
          </p>
          <p>Address: {clinicProfile?.address || "Not available"}</p>
        </div>
      </section>

      <section style={dashboardCardStyle}>
        <ClinicDoctorAddForm
          onResolveDoctor={findDoctorById}
          onSendRequest={handleSendDoctorRequest}
          isSubmitting={isAddingDoctor}
        />
      </section>

      <ClinicDoctorsSection
        doctors={clinicDoctors}
        appointments={clinicAppointments}
        clinicName={clinicProfile?.name || ""}
        onRemoveDoctor={handleRemoveDoctor}
        onSaveAvailability={handleSaveAvailability}
        onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
        removingDoctorId={removingDoctorId}
        savingAvailabilityDoctorId={savingAvailabilityDoctorId}
        processingAppointmentId={processingAppointmentId}
        processingAppointmentStatus={processingAppointmentStatus}
        rejectAppointmentStatus={getRejectAppointmentRequestStatus()}
      />
    </section>
  );
}

export default ClinicDashboard;
