import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../Auth/LoginLogic";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { isAcceptedAppointmentStatus } from "../../../utils/appointmentStatus";
import "./detailsStyles/reviews.css";

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error?.response?.data === "string") {
    return error.response.data;
  }

  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  return fallbackMessage;
};

const formatAppointmentLabel = (appointment, language, t) => {
  const parsedDate = new Date(`${appointment.date}T${appointment.time}`);

  if (Number.isNaN(parsedDate.getTime())) {
    return `${appointment.date} ${t("reviews.at")} ${String(appointment.time).slice(0, 5)}`;
  }

  return parsedDate.toLocaleString(language, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function Reviews({
  doctorId,
  feedbackEntries,
  reviews,
  averageRating,
  reviewCount,
  isLoading,
  errorMessage,
  onRefresh,
}) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [feedbackForm, setFeedbackForm] = useState({
    appointment: "",
    rating: "5",
    feedback: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState({
    type: "",
    text: "",
  });
  const reviewedAppointmentIds = (feedbackEntries ?? []).map((feedbackEntry) =>
    String(feedbackEntry?.appointment),
  ); // Build a simple list of already-reviewed appointment ids so the same appointment cannot be reviewed twice.
  const eligibleAppointments = doctorAppointments.filter(
    (appointment) =>
      isAcceptedAppointmentStatus(appointment?.status) &&
      !reviewedAppointmentIds.includes(String(appointment.id)),
  ); // Keep only accepted appointments that are not already reviewed because the frontend rating flow must depend on acceptance.
  const hasAcceptedAppointments = doctorAppointments.some((appointment) =>
    isAcceptedAppointmentStatus(appointment?.status),
  ); // Check whether the patient has any accepted appointment with this doctor before showing the review form state.

  const handleChange = (event) => {
    setFeedbackForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    if (!doctorId || !isAuthenticated || user?.user_type !== "patient") {
      setDoctorAppointments([]);
      setAppointmentsLoading(false);
      setAppointmentsError("");
      setFeedbackForm((currentForm) => ({
        ...currentForm,
        appointment: "",
      }));
      return;
    }

    let isMounted = true;

    const loadAppointments = async () => {
      setAppointmentsLoading(true);
      setAppointmentsError("");

      try {
        const response = await api.get("/appointments/");

        if (!isMounted) {
          return;
        }

        const matchedAppointments = (
          Array.isArray(response.data) ? response.data : []
        )
          .filter(
            (appointment) =>
              String(appointment?.doctor?.id) === String(doctorId),
          )
          .sort(
            (left, right) =>
              new Date(`${right.date}T${right.time}`) -
              new Date(`${left.date}T${left.time}`),
          );
        const firstEligibleAppointment = matchedAppointments.find(
          (appointment) =>
            isAcceptedAppointmentStatus(appointment?.status) &&
            !reviewedAppointmentIds.includes(String(appointment.id)),
        ); // Read the first accepted reviewable appointment once so the code stays simple and avoids repeated search work.

        setDoctorAppointments(matchedAppointments);
        setFeedbackForm((currentForm) => ({
          ...currentForm,
          appointment: firstEligibleAppointment
            ? String(firstEligibleAppointment.id)
            : "",
        })); // Preselect the first reviewable appointment so the user does not need extra clicks when one exists.
      } catch {
        if (!isMounted) {
          return;
        }

        setDoctorAppointments([]);
        setAppointmentsError(t("reviews.appointmentsError"));
      } finally {
        if (isMounted) {
          setAppointmentsLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      isMounted = false;
    };
  }, [doctorId, feedbackEntries, isAuthenticated, t, user?.user_type]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setFormStatus({
        type: "error",
        text: t("reviews.loginBeforeFeedback"),
      });
      return;
    }

    if (user?.user_type !== "patient") {
      setFormStatus({
        type: "error",
        text: t("reviews.patientOnly"),
      });
      return;
    }

    if (!feedbackForm.appointment) {
      setFormStatus({
        type: "error",
        text: t("reviews.selectAppointment"),
      });
      return;
    }

    if (!feedbackForm.feedback.trim()) {
      setFormStatus({
        type: "error",
        text: t("reviews.addReview"),
      });
      return;
    }

    setIsSubmitting(true);
    setFormStatus({ type: "", text: "" });

    try {
      await api.post("/feedbacks/", {
        appointment: Number(feedbackForm.appointment),
        doctor: doctorId,
        rating: Number(feedbackForm.rating),
        feedback: feedbackForm.feedback.trim(),
      });

      setFeedbackForm((currentForm) => ({
        ...currentForm,
        rating: "5",
        feedback: "",
      }));
      setFormStatus({
        type: "success",
        text: t("reviews.success"),
      });
      toast.success(t("reviews.successToast"));
      onRefresh?.();
    } catch (error) {
      const safeMessage = getErrorMessage(error, t("reviews.submitError"));

      setFormStatus({ type: "error", text: safeMessage });
      toast.error(safeMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="details-card reviews-card">
      <div className="details-section-heading">
        <div>
          <p className="details-card-label">{t("reviews.label")}</p>
          <h2>{t("reviews.title")}</h2>
        </div>

        <div className="reviews-summary-chip">
          <strong>{reviewCount ? averageRating.toFixed(1) : "0.0"}</strong>
          <span>{t("doctorDetails.reviewsCount", { count: reviewCount })}</span>
        </div>
      </div>

      {!isAuthenticated ? (
        <p className="feedback-auth-note">{t("reviews.loginNote")}</p>
      ) : user?.user_type !== "patient" ? (
        <p className="feedback-auth-note">{t("reviews.patientOnly")}</p>
      ) : appointmentsLoading ? (
        <p className="feedback-auth-note">{t("reviews.loadingAppointments")}</p>
      ) : appointmentsError ? (
        <p className="feedback-status feedback-status-error">
          {appointmentsError}
        </p>
      ) : eligibleAppointments.length ? (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-form-grid">
            <label className="feedback-field feedback-field-wide">
              <span>{t("reviews.appointment")}</span>
              <select
                name="appointment"
                value={feedbackForm.appointment}
                onChange={handleChange}
              >
                {eligibleAppointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {formatAppointmentLabel(appointment, i18n.language, t)}
                  </option>
                ))}
              </select>
            </label>

            <label className="feedback-field">
              <span>{t("reviews.rating")}</span>
              <select
                name="rating"
                value={feedbackForm.rating}
                onChange={handleChange}
              >
                <option value="5">5 - {t("reviews.excellent")}</option>
                <option value="4">4 - {t("reviews.veryGood")}</option>
                <option value="3">3 - {t("reviews.good")}</option>
                <option value="2">2 - {t("reviews.fair")}</option>
                <option value="1">1 - {t("reviews.poor")}</option>
              </select>
            </label>

            <label className="feedback-field feedback-field-wide">
              <span>{t("reviews.comment")}</span>
              <textarea
                name="feedback"
                rows="4"
                value={feedbackForm.feedback}
                onChange={handleChange}
                placeholder={t("reviews.commentPlaceholder")}
              />
            </label>
          </div>

          {formStatus.text ? (
            <p className={`feedback-status feedback-status-${formStatus.type}`}>
              {formStatus.text}
            </p>
          ) : null}

          <button
            type="submit"
            className="feedback-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("reviews.submitting") : t("reviews.submit")}
          </button>
        </form>
      ) : doctorAppointments.length && hasAcceptedAppointments ? (
        <p className="feedback-auth-note">{t("reviews.allReviewed")}</p>
      ) : doctorAppointments.length ? (
        <p className="feedback-auth-note">{t("reviews.acceptedOnly")}</p>
      ) : (
        <p className="feedback-auth-note">{t("reviews.bookFirst")}</p>
      )}

      {isLoading ? (
        <div className="reviewsState">{t("reviews.loadingReviews")}</div>
      ) : errorMessage ? (
        <div className="reviewsState reviewsStateError">{errorMessage}</div>
      ) : reviews.length ? (
        <div className="reviewsList">
          {reviews.map((review) => (
            <article key={review.id} className="reviewItem">
              <div className="reviewItemHeader">
                <div>
                  <h3>{review.reviewerName}</h3>
                  {review.dateLabel ? <p>{review.dateLabel}</p> : null}
                </div>

                <div className="reviewItemRating">
                  {Number.isFinite(review.rating)
                    ? `${review.rating.toFixed(1)} / 5`
                    : t("doctorDetails.noRatingValue")}
                </div>
              </div>

              <p className="reviewItemComment">{review.comment}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="reviewsState">
          {t("doctorDetails.noRatingsOrComments")}
        </div>
      )}
    </section>
  );
}

export default Reviews;
