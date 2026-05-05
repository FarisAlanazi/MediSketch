import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../Auth/LoginLogic";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import "./detailsStyles/styles.css";

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error?.response?.data === "string") {
    return error.response.data;
  }

  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  return fallbackMessage;
};

const formatSlotLabel = (slot, language, t) => {
  //booking calendar.
  const parsedDate = new Date(`${slot.date}T${slot.time}`);

  if (Number.isNaN(parsedDate.getTime())) {
    return `${slot.date} ${t("booking.at")} ${String(slot.time).slice(0, 5)}`; //edge case where the date still readable.
  }

  return parsedDate.toLocaleString(language, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function CalendarForm({ doctor }) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [
    hasUpcomingAppointmentWithDoctor,
    setHasUpcomingAppointmentWithDoctor,
  ] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    if (!doctor?.id || !isAuthenticated || user?.user_type !== "patient") {
      setAvailableSlots([]);
      setSelectedSlotId("");
      setHasUpcomingAppointmentWithDoctor(false);
      setSlotsLoading(false);
      setSlotsError("");
      return;
    }

    let isMounted = true;

    const loadSlots = async () => {
      setSlotsLoading(true);
      setSlotsError("");

      try {
        const [slotsResponse, appointmentsResponse] = await Promise.all([
          api.get("/available/"),
          api.get("/appointments/"),
        ]);

        if (!isMounted) {
          return;
        }

        const doctorSlots = //show the avilable slots for the doc
          (Array.isArray(slotsResponse.data) ? slotsResponse.data : [])
            .filter(
              (slot) =>
                String(slot?.doctor) === String(doctor.id) &&
                slot?.status === true, //available slots only.
            )
            .sort(
              //sort the slots based on the date and time.
              (left, right) =>
                new Date(`${left.date}T${left.time}`) -
                new Date(`${right.date}T${right.time}`),
            );

        const appointments = Array.isArray(appointmentsResponse.data) //check the appointments already booked appointments contains {DOCTOR AND PATIENT}
          ? appointmentsResponse.data
          : Array.isArray(appointmentsResponse.data?.results)
            ? appointmentsResponse.data.results
            : [];

        const activeStatuses = ["pending", "accepted"];

        const now = new Date();

        const hasUpcomingAppointment = appointments.some((appointment) => {
          //appointments where the book appointments resides.
          const appointmentDoctorId =
            appointment?.doctor?.id ?? appointment?.doctor;

          const appointmentStatus = String(
            //check on the status. if the appointment is accepted or pending it will be shown as upcoming.
            appointment?.status ?? "",
          ).toLowerCase();

          if (
            String(appointmentDoctorId) !== String(doctor.id) ||
            !activeStatuses.includes(appointmentStatus)
          ) {
            return false;
          } //an edge case, check if the appointment does not belong to the doc OR the appointment has not initiated or pending.

          const appointmentDateTime = new Date(
            `${appointment.date}T${appointment.time}`,
          );

          if (Number.isNaN(appointmentDateTime.getTime())) {
            return false;
          }

          return appointmentDateTime > now;
        });

        setAvailableSlots(doctorSlots);
        setSelectedSlotId(doctorSlots[0] ? String(doctorSlots[0].id) : ""); // AUTO SELECT THE FIRST AVAILABLE SLOT IF EXISTS.
        setHasUpcomingAppointmentWithDoctor(hasUpcomingAppointment); //save wather the user has an upcoming appointment with the doctor to prevent multiple bookings.
      } catch {
        if (!isMounted) {
          return;
        }

        setAvailableSlots([]);
        setSelectedSlotId("");
        setHasUpcomingAppointmentWithDoctor(false);
        setSlotsError(t("booking.loadError"));
      } finally {
        if (isMounted) {
          setSlotsLoading(false);
        }
      }
    };

    loadSlots();

    return () => {
      isMounted = false;
    };
  }, [doctor?.id, isAuthenticated, t, user?.user_type]);

  const handleSubmission = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setStatusMessage({
        type: "error",
        text: t("booking.loginBeforeBooking"),
      });
      return;
    }

    if (user?.user_type !== "patient") {
      setStatusMessage({
        type: "error",
        text: t("booking.patientOnly"),
      });
      return;
    }

    if (hasUpcomingAppointmentWithDoctor) {
      setStatusMessage({
        type: "error",
        text: t("booking.upcomingAppointmentWithDoctor"),
      });
      return;
    }

    const selectedSlot = availableSlots.find(
      (slot) => String(slot.id) === String(selectedSlotId),
    );

    if (!selectedSlot) {
      setStatusMessage({
        type: "error",
        text: t("booking.selectTime"),
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: "", text: "" });

    try {
      await api.post("/appointments/", {
        doctor: doctor.id,
        date: selectedSlot.date,
        time: selectedSlot.time,
      });

      setHasUpcomingAppointmentWithDoctor(true);
      const remainingSlots = availableSlots.filter(
        (slot) => String(slot.id) !== String(selectedSlotId),
      );

      setAvailableSlots(remainingSlots);
      setSelectedSlotId(remainingSlots[0] ? String(remainingSlots[0].id) : "");
      setStatusMessage({
        type: "success",
        text: t("booking.success"),
      });
      toast.success(t("booking.successToast"));
    } catch (error) {
      const safeMessage = getErrorMessage(error, t("booking.submitError"));

      setStatusMessage({ type: "error", text: safeMessage });
      toast.error(safeMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(availableSlots, "  available slots");

  return (
    <form className="details-card booking-card" onSubmit={handleSubmission}>
      <p className="details-card-label">{t("booking.label")}</p>
      <h2>{t("booking.title")}</h2>
      <p className="booking-support-text">{t("booking.subtitle")}</p>

      {!isAuthenticated ? (
        <p className="booking-auth-note">{t("booking.loginNote")} </p>
      ) : user?.user_type !== "patient" ? (
        <p className="booking-auth-note">{t("booking.patientOnly")}</p>
      ) : hasUpcomingAppointmentWithDoctor ? (
        <p className="booking-auth-note">
          {t("booking.upcomingAppointmentWithDoctor")}
        </p>
      ) : slotsLoading ? (
        <p className="booking-auth-note">{t("booking.loading")}</p>
      ) : slotsError ? (
        <p className="booking-status booking-status-error">{slotsError}</p>
      ) : availableSlots.length ? (
        <label className="booking-field">
          <span>{t("booking.fieldLabel")}</span>

          <select
            name="slot"
            value={selectedSlotId}
            onChange={(event) => setSelectedSlotId(event.target.value)}
          >
            {availableSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {formatSlotLabel(slot, i18n.language, t)}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="booking-auth-note">{t("booking.empty")} </p>
      )}

      {statusMessage.text ? (
        <p className={`booking-status booking-status-${statusMessage.type}`}>
          {statusMessage.text}
        </p>
      ) : null}

      <button
        type="submit"
        className="booking-submit-button"
        disabled={
          isSubmitting ||
          !isAuthenticated ||
          user?.user_type !== "patient" ||
          slotsLoading ||
          hasUpcomingAppointmentWithDoctor ||
          !availableSlots.length
        }
      >
        {isSubmitting ? t("booking.submitting") : t("booking.submit")}
      </button>
    </form>
  );
}

export default CalendarForm;
