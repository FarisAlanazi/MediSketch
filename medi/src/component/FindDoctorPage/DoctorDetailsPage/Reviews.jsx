import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../Auth/LoginLogic";
import { useAuth } from "../../../context/AuthContext";
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

const formatAppointmentLabel = (appointment) => {
  const parsedDate = new Date(`${appointment.date}T${appointment.time}`);

  if (Number.isNaN(parsedDate.getTime())) {
    return `${appointment.date} at ${String(appointment.time).slice(0, 5)}`;
  }

  return parsedDate.toLocaleString(undefined, {
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
      String(appointment?.status ?? "").toLowerCase() !== "declined" &&
      !reviewedAppointmentIds.includes(String(appointment.id)),
  ); // Keep only appointments that are not declined and not already reviewed because each appointment gets one review chance.
  const hasNonDeclinedAppointments = doctorAppointments.some(
    (appointment) => String(appointment?.status ?? "").toLowerCase() !== "declined",
  ); // Check whether the patient has at least one appointment that is still review-eligible by status.

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
            String(appointment?.status ?? "").toLowerCase() !== "declined" &&
            !reviewedAppointmentIds.includes(String(appointment.id)),
        ); // Read the first reviewable appointment once so the code stays simple and avoids repeated search work.

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
        setAppointmentsError("Unable to load your appointments for feedback.");
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
  }, [doctorId, feedbackEntries, isAuthenticated, user?.user_type]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setFormStatus({
        type: "error",
        text: "Please log in before submitting feedback.",
      });
      return;
    }

    if (user?.user_type !== "patient") {
      setFormStatus({
        type: "error",
        text: "Only patient accounts can submit feedback.",
      });
      return;
    }

    if (!feedbackForm.appointment) {
      setFormStatus({
        type: "error",
        text: "Select an appointment before leaving feedback.",
      });
      return;
    }

    if (!feedbackForm.feedback.trim()) {
      setFormStatus({
        type: "error",
        text: "Please add a short review before submitting.",
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
        text: "Your feedback was submitted successfully.",
      });
      toast.success("Feedback submitted successfully!");
      onRefresh?.();
    } catch (error) {
      const safeMessage = getErrorMessage(
        error,
        "We could not submit your feedback right now.",
      );

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
          <p className="details-card-label">Feedback</p>
          <h2>Ratings and comments</h2>
        </div>

        <div className="reviews-summary-chip">
          <strong>{reviewCount ? averageRating.toFixed(1) : "0.0"}</strong>
          <span>
            {reviewCount} review{reviewCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {!isAuthenticated ? (
        <p className="feedback-auth-note">
          Log in with a patient account to leave feedback for this doctor.
        </p>
      ) : user?.user_type !== "patient" ? (
        <p className="feedback-auth-note">
          Only patient accounts can submit feedback.
        </p>
      ) : appointmentsLoading ? (
        <p className="feedback-auth-note">
          Loading your appointments for this doctor...
        </p>
      ) : appointmentsError ? (
        <p className="feedback-status feedback-status-error">
          {appointmentsError}
        </p>
      ) : eligibleAppointments.length ? (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-form-grid">
            <label className="feedback-field feedback-field-wide">
              <span>Appointment</span>
              <select
                name="appointment"
                value={feedbackForm.appointment}
                onChange={handleChange}
              >
                {eligibleAppointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {formatAppointmentLabel(appointment)}
                  </option>
                ))}
              </select>
            </label>

            <label className="feedback-field">
              <span>Rating</span>
              <select
                name="rating"
                value={feedbackForm.rating}
                onChange={handleChange}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </label>

            <label className="feedback-field feedback-field-wide">
              <span>Comment</span>
              <textarea
                name="feedback"
                rows="4"
                value={feedbackForm.feedback}
                onChange={handleChange}
                placeholder="Share a short comment about your visit."
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
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      ) : doctorAppointments.length && hasNonDeclinedAppointments ? (
        <p className="feedback-auth-note">
          Every appointment with this doctor has already been reviewed.
        </p>
      ) : (
        <p className="feedback-auth-note">
          Book an appointment with this doctor before leaving feedback.
        </p>
      )}

      {isLoading ? (
        <div className="reviewsState">Loading reviews...</div>
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
                    : "No rating"}
                </div>
              </div>

              <p className="reviewItemComment">{review.comment}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="reviewsState">No ratings or comments yet.</div>
      )}
    </section>
  );
}

export default Reviews;
