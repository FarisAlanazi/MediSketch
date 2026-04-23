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
  const parsedDate = new Date(`${slot.date}T${slot.time}`);

  if (Number.isNaN(parsedDate.getTime())) {
    return `${slot.date} ${t("booking.at")} ${String(slot.time).slice(0, 5)}`;
  }

  return parsedDate.toLocaleString(language, {
    weekday: "short",
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
      const safeMessage = getErrorMessage(
        error,
        t("booking.submitError"),
      );

      setStatusMessage({ type: "error", text: safeMessage });
      toast.error(safeMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="details-card booking-card" onSubmit={handleSubmission}>
      <p className="details-card-label">{t("booking.label")}</p>
      <h2>{t("booking.title")}</h2>
      <p className="booking-support-text">{t("booking.subtitle")}</p>

      {!isAuthenticated ? (
        <p className="booking-auth-note">{t("booking.loginNote")}</p>
      ) : user?.user_type !== "patient" ? (
        <p className="booking-auth-note">{t("booking.patientOnly")}</p>
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
        <p className="booking-auth-note">{t("booking.empty")}</p>
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
        {isSubmitting ? t("booking.submitting") : t("booking.submit")}
      </button>
    </form>
  );
}

export default CalendarForm;
