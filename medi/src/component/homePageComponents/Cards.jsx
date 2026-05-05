import fallbackDoctorImg from "../../assets/doctor-with-his-arms-crossed-white-background.jpg";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "../FindDoctorPage/FindDoctorPage.css";

const Cards = ({
  first_name,
  last_name,
  price,
  gender,
  img,
  experience,
  specialization,
  id,
  clinicName,
  city,
  rating,
}) => {
  const { t } = useTranslation();
  const imgSrc = img || fallbackDoctorImg;
  const normalizedGender = String(gender ?? "")
    .trim()
    .toLowerCase();
  const genderLabel =
    normalizedGender === "male"
      ? t("doctors.male")
      : normalizedGender === "female"
        ? t("doctors.female")
        : gender;

  return (
    <>
      <div className="card home-doctor-card">
        <div className="doctor-card-top">
          {specialization ? (
            <p className="card-specialty">{specialization}</p>
          ) : (
            <span />
          )}
          {price ? <p className="card-price">{price}</p> : null}

          <span className="doctor-rating-badge">
            {rating ? (
              <p className=""> ★ {rating}</p>
            ) : (
              <p className="">{t("homeCards.noRating")}</p>
            )}
          </span>
        </div>
        <div className="card-body-layout">
          <img
            src={imgSrc}
            alt={`${first_name} ${last_name}`}
            className="doctor-card-image"
          />
          <section className="doctor-card-content">
            <h4>{`${first_name} ${last_name}`}</h4>
            {city ? (
              <p className="card-location">
                {t(`cities.${city}`, { defaultValue: city })}
              </p>
            ) : null}
            {/* This shows the clinic name only when the doctor is linked to one. */}
            {clinicName ? (
              <p className="card-location">
                {t("doctors.clinicLabel")}: {clinicName}
              </p>
            ) : null}
            <div className="doctor-card-meta">
              {experience ? (
                <span>
                  {t("homeCards.yearsExperience", { count: experience })}
                </span>
              ) : null}
              {gender ? <span>{genderLabel}</span> : null}
            </div>
            <button
              className="buttonForBook"
              onClick={() => {
                window.location.href = `/DoctorDetails/${id}`;
              }}
            >
              {t("homeCards.bookNow")}
            </button>
          </section>
        </div>
      </div>
    </>
  );
};

export default Cards;
