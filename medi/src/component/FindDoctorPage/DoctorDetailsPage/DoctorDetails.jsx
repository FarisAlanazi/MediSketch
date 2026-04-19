import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../Auth/LoginLogic";
import fallbackDoctorImg from "../../../assets/doctor-with-his-arms-crossed-white-background.jpg";
import CalendarForm from "./CalendarForm";
import LocationCard from "./LocationCard";
import Reviews from "./Reviews";
import "./detailsStyles/styles.css";
import { toast } from "react-toastify";

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number.parseFloat(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const getDoctorName = (doctor) =>
  `${doctor?.user?.first_name ?? ""} ${doctor?.user?.last_name ?? ""}`.trim();

const getDoctorLocation = (doctor) =>
  doctor?.clinic_name?.trim?.() ||
  doctor?.clinic_name ||
  doctor?.user?.address?.trim?.() ||
  doctor?.user?.address ||
  "Location not listed";

const getDoctorBio = (doctor) =>
  doctor?.about_me?.trim?.() ||
  doctor?.about_me ||
  "No biography has been added yet.";

const extractFeedbackDoctorKeys = (feedback) =>
  [
    feedback?.doctor,
    feedback?.doctor_id,
    feedback?.doctor?.id,
    feedback?.doctor?.user,
    feedback?.doctor?.user?.id,
  ]
    .filter(Boolean)
    .map((value) => String(value));

const extractFeedbackRating = (feedback) =>
  parseNumber(
    feedback?.rating ??
      feedback?.rate ??
      feedback?.score ??
      feedback?.stars ??
      feedback?.value,
  );

const extractFeedbackComment = (feedback) =>
  String(
    feedback?.comment ??
      feedback?.content ??
      feedback?.message ??
      feedback?.feedback ??
      "",
  ).trim();

const extractFeedbackDate = (feedback) =>
  feedback?.created_at ??
  feedback?.created ??
  feedback?.date ??
  feedback?.updated_at ??
  null;

const extractReviewerName = (feedback) =>
  feedback?.user?.username ??
  feedback?.patient?.username ??
  feedback?.reviewer?.username ??
  feedback?.username ??
  feedback?.user_name ??
  feedback?.name ??
  "Anonymous reviewer";

const formatReviewDate = (value) => {
  if (!value) {
    return "Date unavailable";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

async function fetchDoctorDetails(routeId) {
  try {
    const detailResponse = await api.get(`/doctors/${routeId}/`); //eg, /doctors/5
    return detailResponse.data;
  } catch (err) {
    // const listResponse = await api.get("/doctors/");

    // // The routed id can be either the doctor record id or the nested user id in this backend.
    // const matchedDoctor = listResponse.data.find(
    //   (doctor) =>
    //     String(doctor?.id) === String(routeId) ||
    //     String(doctor?.user?.id) === String(routeId),
    // );

    // if (!matchedDoctor) {
    //   throw detailError;
    // }

    // return matchedDoctor;
    toast.error("Unable to load doctor details. Please try again later.");
    throw err;
  }
}

function DoctorDetails() {
  const { id } = useParams();
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState("");

  //TO REFRESH REVIEWS AFTER SENDING A REVIEW FORM:

  const refreshFeedbacks = async (canUpdate = () => true) => {
    //canupdate callback func is to check the component mounted or not. just to avoid isssues like memory leak or updating unmounted component.
    if (canUpdate()) {
      // check if component is still mounted before updating state
      setFeedbackLoading(true);
      setFeedbackError("");
    }

    try {
      const feedbackResponse = await api.get("/feedbacks/"); // fetch all feedbacks from the backend

      if (!canUpdate()) {
        //check whether mounted or not before updating state
        return;
      }

      setFeedbacks(
        Array.isArray(feedbackResponse.data) ? feedbackResponse.data : [], // ensure we have an array of elements to work with , either way empty array
      );
    } catch (error) {
      if (!canUpdate()) {
        return;
      }

      setFeedbacks([]);
      setFeedbackError("Unable to load reviews right now.");
    } finally {
      if (canUpdate()) {
        setFeedbackLoading(false); // only update loading state if component is still mounted
      }
    }
  };

  // LOAD DOCTOR DETAILS ON THE PAGE.

  useEffect(() => {
    let isMounted = true;

    const loadDoctorPage = async () => {
      setDoctorLoading(true);
      setDoctorError("");

      try {
        const doctorResponse = await fetchDoctorDetails(id); //fetch doctor details is a func above to deal with fetching doctor based on id.

        if (!isMounted) {
          return;
        }

        setDoctorDetails(doctorResponse);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setDoctorError("Unable to load this doctor right now.");
        setDoctorDetails(null);
      } finally {
        if (isMounted) {
          setDoctorLoading(false);
        }
      }

      await refreshFeedbacks(() => isMounted); // load feedbacks after doctor details are loaded, and pass the isMounted check to avoid state updates if component unmounts during the async operation.
    };

    loadDoctorPage();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const doctorFeedbacks = useMemo(() => {
    //
    if (!doctorDetails) {
      return [];
    }

    // Feedback records can point at either the doctor row or the nested user row, so we normalize both ids.
    const doctorKeys = [doctorDetails.id, doctorDetails.user?.id, id]
      .filter(Boolean)
      .map((value) => String(value));

    return feedbacks.filter((feedback) =>
      extractFeedbackDoctorKeys(feedback).some((feedbackKey) =>
        doctorKeys.includes(feedbackKey),
      ),
    );
  }, [doctorDetails, feedbacks, id]);

  const normalizedReviews = useMemo(
    () =>
      doctorFeedbacks.map((feedback, index) => ({
        id: feedback?.id ?? `review-${index}`,
        reviewerName: extractReviewerName(feedback),
        rating: extractFeedbackRating(feedback),
        comment:
          extractFeedbackComment(feedback) ||
          "No written comment was provided.",
        dateLabel: formatReviewDate(extractFeedbackDate(feedback)),
      })),
    [doctorFeedbacks],
  );

  const ratingSummary = useMemo(() => {
    const validRatings = doctorFeedbacks
      .map((feedback) => extractFeedbackRating(feedback))
      .filter(Number.isFinite);

    if (!validRatings.length) {
      return { average: 0, count: 0 };
    }

    const averageRating =
      validRatings.reduce((total, rating) => total + rating, 0) /
      validRatings.length;

    return {
      average: Number(averageRating.toFixed(1)),
      count: validRatings.length,
    };
  }, [doctorFeedbacks]);

  if (doctorLoading) {
    return (
      <section className="doctor-details-page">
        <div className="doctor-details-shell">
          <div className="doctor-status-card">Loading doctor details...</div>
        </div>
      </section>
    );
  }

  if (doctorError || !doctorDetails) {
    return (
      <section className="doctor-details-page">
        <div className="doctor-details-shell">
          <div className="doctor-status-card doctor-status-error">
            {doctorError || "Doctor details are unavailable."}
          </div>
        </div>
      </section>
    );
  }

  const doctorName = getDoctorName(doctorDetails);
  const doctorLocation = getDoctorLocation(doctorDetails);

  return (
    <section className="doctor-details-page">
      <div className="doctor-details-shell">
        <div className="doctor-details-grid">
          <main className="doctor-details-main">
            <section className="details-card doctor-hero-card">
              <div className="doctor-hero-layout">
                <div className="doctor-hero-image-shell">
                  <img
                    src={fallbackDoctorImg}
                    alt={doctorName}
                    className="doctor-hero-image"
                  />
                </div>

                <div className="doctor-hero-content">
                  {doctorDetails.specialization ? (
                    <p className="doctor-specialization-badge">
                      {doctorDetails.specialization}
                    </p>
                  ) : null}

                  <h1>{doctorName || "Doctor profile"}</h1>
                  <p className="doctor-location-line">{doctorLocation}</p>

                  <div className="doctor-meta-grid">
                    <div className="doctor-meta-chip">
                      <span>Experience</span>
                      <strong>
                        {doctorDetails.years_of_experience ?? "N/A"} years
                      </strong>
                    </div>

                    <div className="doctor-meta-chip">
                      <span>Gender</span>
                      <strong>{doctorDetails.gender || "Not specified"}</strong>
                    </div>

                    <div className="doctor-meta-chip">
                      <span>Consultation Fee</span>
                      <strong>
                        {doctorDetails.price !== null &&
                        doctorDetails.price !== undefined
                          ? `$${doctorDetails.price}`
                          : "Unavailable"}
                      </strong>
                    </div>

                    <div className="doctor-meta-chip">
                      <span>Average Rating</span>
                      <strong>
                        {ratingSummary.count
                          ? `${ratingSummary.average} / 5`
                          : "No ratings yet"}
                      </strong>
                    </div>
                  </div>

                  <div className="doctor-summary-text">
                    <h2>About</h2>
                    <p>{getDoctorBio(doctorDetails)}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="doctor-insights-grid">
              <LocationCard
                doctorName={doctorName}
                locationLabel={doctorLocation}
                latitude={doctorDetails.lititude ?? doctorDetails.latitude}
                longitude={doctorDetails.langitude ?? doctorDetails.longitude}
              />

              <article className="details-card rating-summary-card">
                <p className="details-card-label">Rating Summary</p>
                <h2>
                  {ratingSummary.count
                    ? ratingSummary.average.toFixed(1)
                    : "0.0"}
                </h2>
                <p className="rating-stars">
                  {ratingSummary.count ? "★★★★★" : "No ratings yet"}
                </p>
                <p className="rating-review-count">
                  {ratingSummary.count} review
                  {ratingSummary.count === 1 ? "" : "s"}
                </p>
              </article>
            </div>

            <Reviews
              doctor={doctorDetails}
              doctorId={doctorDetails.id}
              feedbackEntries={doctorFeedbacks}
              reviews={normalizedReviews}
              averageRating={ratingSummary.average}
              reviewCount={ratingSummary.count}
              isLoading={feedbackLoading}
              errorMessage={feedbackError}
              onRefresh={refreshFeedbacks}
            />
          </main>

          <aside className="doctor-details-sidebar">
            <CalendarForm doctor={doctorDetails} />
          </aside>
        </div>
      </div>
    </section>
  );
}

export default DoctorDetails;
