import img from "../../assets/doctor-with-his-arms-crossed-white-background.jpg";
import { Link } from "react-router-dom";

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
  const hasRating = Number.isFinite(rating);
  const hasPrice = Number.isFinite(price);
  const hasExperience = Number.isFinite(experience);
  const normalizedGender = String(gender ?? "")
    .trim()
    .toLowerCase();

  return (
    <article className="doctor-card">
      <div className="doctor-card-top">
        <p className="doctor-rating-badge">
          {hasRating ? `★ ${rating.toFixed(1)}` : "No ratings yet"}
        </p>
        <p className="doctor-price-badge">
          {hasPrice ? `$${price}` : "Price unavailable"}
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

          <p className="doctor-location">{clinic || "Location not listed"}</p>

          <div className="doctor-card-meta">
            {hasExperience ? (
              <span className="doctor-meta-badge">
                {experience} years experience
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
                {formatBadgeLabel(gender)}
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
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
