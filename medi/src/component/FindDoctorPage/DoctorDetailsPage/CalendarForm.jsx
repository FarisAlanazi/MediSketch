import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../Auth/LoginLogic";
import { useAuth } from "../../../context/AuthContext";
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

const formatSlotLabel = (slot) => {
  const parsedDate = new Date(`${slot.date}T${slot.time}`);

  if (Number.isNaN(parsedDate.getTime())) {
    return `${slot.date} at ${String(slot.time).slice(0, 5)}`;
  }

  return parsedDate.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function CalendarForm({ doctor }) {
  const { isAuthenticated, user } = useAuth();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
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
      setSlotsLoading(false);
      setSlotsError("");
      return;
    }

    let isMounted = true;

    const loadSlots = async () => {
      setSlotsLoading(true);
      setSlotsError("");

      try {
        const response = await api.get("/available/");

        if (!isMounted) {
          return;
        }

        const doctorSlots = (Array.isArray(response.data) ? response.data : [])
          .filter(
            (slot) =>
              String(slot?.doctor) === String(doctor.id) && slot?.status === true,
          )
          .sort(
            (left, right) =>
              new Date(`${left.date}T${left.time}`) -
              new Date(`${right.date}T${right.time}`),
          );

        setAvailableSlots(doctorSlots);
        setSelectedSlotId(doctorSlots[0] ? String(doctorSlots[0].id) : "");
      } catch {
        if (!isMounted) {
          return;
        }

        setAvailableSlots([]);
        setSelectedSlotId("");
        setSlotsError("Unable to load available times right now.");
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
  }, [doctor?.id, isAuthenticated, user?.user_type]);

  const handleSubmission = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setStatusMessage({
        type: "error",
        text: "Please log in before booking an appointment.",
      });
      return;
    }

    if (user?.user_type !== "patient") {
      setStatusMessage({
        type: "error",
        text: "Only patient accounts can book appointments.",
      });
      return;
    }

    const selectedSlot = availableSlots.find(
      (slot) => String(slot.id) === String(selectedSlotId),
    );

    if (!selectedSlot) {
      setStatusMessage({
        type: "error",
        text: "Please select one of the available times.",
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

      const remainingSlots = availableSlots.filter(
        (slot) => String(slot.id) !== String(selectedSlotId),
      );

      setAvailableSlots(remainingSlots);
      setSelectedSlotId(remainingSlots[0] ? String(remainingSlots[0].id) : "");
      setStatusMessage({
        type: "success",
        text: "Your appointment request was submitted successfully.",
      });
      toast.success("Appointment booked successfully!");
    } catch (error) {
      const safeMessage = getErrorMessage(
        error,
        "We could not submit the appointment request.",
      );

      setStatusMessage({ type: "error", text: safeMessage });
      toast.error(safeMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="details-card booking-card" onSubmit={handleSubmission}>
      <p className="details-card-label">Booking</p>
      <h2>Book an appointment</h2>
      <p className="booking-support-text">
        Choose one of the doctor's available times and send a real appointment
        request.
      </p>

      {!isAuthenticated ? (
        <p className="booking-auth-note">
          Log in with a patient account to see available times and book this
          doctor.
        </p>
      ) : user?.user_type !== "patient" ? (
        <p className="booking-auth-note">
          Only patient accounts can book appointments.
        </p>
      ) : slotsLoading ? (
        <p className="booking-auth-note">Loading available times...</p>
      ) : slotsError ? (
        <p className="booking-status booking-status-error">{slotsError}</p>
      ) : availableSlots.length ? (
        <label className="booking-field">
          <span>Available time</span>
          <select
            name="slot"
            value={selectedSlotId}
            onChange={(event) => setSelectedSlotId(event.target.value)}
          >
            {availableSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {formatSlotLabel(slot)}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="booking-auth-note">
          No available times are listed for this doctor right now.
        </p>
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
          !availableSlots.length
        }
      >
        {isSubmitting ? "Submitting..." : "Book Now"}
      </button>
    </form>
  );
}

export default CalendarForm;
