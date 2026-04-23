import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../Auth/LoginLogic";
import fallbackDoctorImg from "../../../assets/doctor-with-his-arms-crossed-white-background.jpg";
import CalendarForm from "./CalendarForm";
import LocationCard from "./LocationCard";
import Reviews from "./Reviews";
import "./detailsStyles/styles.css";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

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
  "";

const getDoctorBio = (doctor) =>
  doctor?.about_me?.trim?.() ||
  doctor?.about_me ||
  "";

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
  "";

const formatReviewDate = (value, language) => {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleDateString(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

async function fetchDoctorDetails(routeId, t) {
  try {
    const detailResponse = await api.get(`/doctors/${routeId}/`);
    return detailResponse.data;
  } catch (err) {
    const listResponse = await api.get("/doctors/");
    const matchedDoctor = (Array.isArray(listResponse.data) ? listResponse.data : []).find(
      (doctor) =>
        String(doctor?.id ?? "") === String(routeId) ||
        String(doctor?.user?.id ?? "") === String(routeId),
    );

    if (matchedDoctor) {
      return matchedDoctor;
    }

    toast.error(t("doctorDetails.loadToastError"));
    throw err;
  }
}

function DoctorDetails() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState("");

  const refreshFeedbacks = async (canUpdate = () => true) => {
    if (canUpdate()) {
      setFeedbackLoading(true);
      setFeedbackError("");
    }

    try {
      const feedbackResponse = await api.get("/feedbacks/");

      if (!canUpdate()) {
        return;
      }

      setFeedbacks(
        Array.isArray(feedbackResponse.data) ? feedbackResponse.data : [],
      );
    } catch (error) {
      if (!canUpdate()) {
        return;
      }

      setFeedbacks([]);
      setFeedbackError(t("reviews.loadReviewsError"));
    } finally {
      if (canUpdate()) {
        setFeedbackLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadDoctorPage = async () => {
      setDoctorLoading(true);
      setDoctorError("");

      try {
        const doctorResponse = await fetchDoctorDetails(id, t);

        if (!isMounted) {
          return;
        }

        setDoctorDetails(doctorResponse);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setDoctorError(t("doctorDetails.loadError"));
        setDoctorDetails(null);
      } finally {
        if (isMounted) {
          setDoctorLoading(false);
        }
      }

      await refreshFeedbacks(() => isMounted);
    };

    loadDoctorPage();

    return () => {
      isMounted = false;
    };
  }, [id, t]);

  const doctorFeedbacks = useMemo(() => {
    if (!doctorDetails) {
      return [];
    }

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
        reviewerName:
          extractReviewerName(feedback) || t("doctorDetails.anonymousReviewer"),
        rating: extractFeedbackRating(feedback),
        comment:
          extractFeedbackComment(feedback) ||
          t("doctorDetails.reviewFallbackComment"),
        dateLabel:
          formatReviewDate(extractFeedbackDate(feedback), i18n.language) ||
          t("doctorDetails.dateUnavailable"),
      })),
    [doctorFeedbacks, i18n.language, t],
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
          <div className="doctor-status-card">{t("doctorDetails.loading")}</div>
        </div>
      </section>
    );
  }

  if (doctorError || !doctorDetails) {
    return (
      <section className="doctor-details-page">
        <div className="doctor-details-shell">
          <div className="doctor-status-card doctor-status-error">
            {doctorError || t("doctorDetails.unavailable")}
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

                  <h1>{doctorName || t("doctorDetails.profileFallback")}</h1>
                  <p className="doctor-location-line">
                    {doctorLocation || t("doctorDetails.locationNotListed")}
                  </p>

                  <div className="doctor-meta-grid">
                    <div className="doctor-meta-chip">
                      <span>{t("doctorDetails.experience")}</span>
                      <strong>
                        {doctorDetails.years_of_experience !== null &&
                        doctorDetails.years_of_experience !== undefined
                          ? t("doctorDetails.years", {
                              count: doctorDetails.years_of_experience,
                            })
                          : "N/A"}
                      </strong>
                    </div>

                    <div className="doctor-meta-chip">
                      <span>{t("doctorDetails.gender")}</span>
                      <strong>
                        {doctorDetails.gender === "male"
                          ? t("doctors.male")
                          : doctorDetails.gender === "female"
                            ? t("doctors.female")
                            : doctorDetails.gender ||
                              t("doctorDetails.notSpecified")}
                      </strong>
                    </div>

                    <div className="doctor-meta-chip">
                      <span>{t("doctorDetails.consultationFee")}</span>
                      <strong>
                        {doctorDetails.price !== null &&
                        doctorDetails.price !== undefined
                          ? `$${doctorDetails.price}`
                          : t("doctorDetails.unavailableFee")}
                      </strong>
                    </div>

                    <div className="doctor-meta-chip">
                      <span>{t("doctorDetails.averageRating")}</span>
                      <strong>
                        {ratingSummary.count
                          ? `${ratingSummary.average} / 5`
                          : t("doctorDetails.noRatings")}
                      </strong>
                    </div>
                  </div>

                  <div className="doctor-summary-text">
                    <h2>{t("doctorDetails.about")}</h2>
                    <p>{getDoctorBio(doctorDetails) || t("doctorDetails.bioFallback")}</p>
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
                <p className="details-card-label">{t("doctorDetails.ratingSummary")}</p>
                <h2>
                  {ratingSummary.count
                    ? ratingSummary.average.toFixed(1)
                    : "0.0"}
                </h2>
                <p className="rating-stars">
                  {ratingSummary.count ? "★★★★★" : t("doctorDetails.noRatings")}
                </p>
                <p className="rating-review-count">
                  {t("doctorDetails.reviewsCount", { count: ratingSummary.count })}
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
