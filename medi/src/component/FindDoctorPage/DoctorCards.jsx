import img from "../../assets/doctor-with-his-arms-crossed-white-background.jpg";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const formatBadgeLabel = (value) => {
  const normalizedValue = String(value ?? "").trim();
  if (!normalizedValue) {
    return "";
  }

  return normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1);
};

export default function DoctorCards({
  firstname,
  price,
  specialization,
  lastname,
  gender,
  experience,
  rating,
  clinic,
  availableDays = [],
  detailsId,
  id,
}) {
  const { t } = useTranslation();
  const hasRating = Number.isFinite(rating);
  const hasPrice = Number.isFinite(price);
  const hasExperience = Number.isFinite(experience);
  const normalizedGender = String(gender ?? "")
    .trim()
    .toLowerCase();
  const genderLabel =
    normalizedGender === "male"
      ? t("doctors.male")
      : normalizedGender === "female"
        ? t("doctors.female")
        : formatBadgeLabel(gender);

  return (
    <article className="doctor-card">
      <div className="doctor-card-top">
        <p className="doctor-rating-badge">
          {hasRating ? `★ ${rating.toFixed(1)}` : t("doctors.noRatings")}
        </p>
        <p className="doctor-price-badge">
          {hasPrice ? `$${price}` : t("doctors.priceUnavailable")}
        </p>
      </div>

      <div className="doctor-card-main">
        <img
          src={img}
          alt={`${firstname} ${lastname}`}
          className="doctor-card-image"
        />

        <div className="doctor-card-content">
          {specialization ? (
            <p className="doctor-specialization">{specialization}</p>
          ) : null}

          <h2>
            {firstname} {lastname}
          </h2>

          <p className="doctor-location">
            {clinic || t("doctors.locationNotListed")}
          </p>

          <div className="doctor-card-meta">
            {hasExperience ? (
              <span className="doctor-meta-badge">
                {t("doctors.yearsExperience", { count: experience })}
              </span>
            ) : null}

            {gender ? (
              <span
                className={`doctor-meta-badge gender-badge ${
                  normalizedGender === "female"
                    ? "gender-badge-female"
                    : normalizedGender === "male"
                      ? "gender-badge-male"
                      : "gender-badge-neutral"
                }`}
              >
                {genderLabel}
              </span>
            ) : null}
          </div>

          {availableDays.length > 0 ? (
            <div className="doctor-availability">
              {availableDays.map((day) => (
                <span key={`${id}-${day}`} className="availability-pill">
                  {day}
                </span>
              ))}
            </div>
          ) : null}

          <div className="doctor-card-actions">
            <Link
              to={`/DoctorDetails/${detailsId ?? id}`}
              className="doctor-view-button"
            >
              {t("doctors.viewProfile")}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
