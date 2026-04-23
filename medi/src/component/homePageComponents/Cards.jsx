import fallbackDoctorImg from "../../assets/doctor-with-his-arms-crossed-white-background.jpg";
import { useTranslation } from "react-i18next";

const Cards = ({
  first_name,
  last_name,
  price,
  gender,
  img,
  clinic,
  experience,
  specialization,
}) => {
  const { t } = useTranslation();
  const imgSrc = img || fallbackDoctorImg;
  const clinicLabel =
    typeof clinic === "string" ? clinic : clinic?.name || clinic?.address;
  const normalizedGender = String(gender ?? "").trim().toLowerCase();
  const genderLabel =
    normalizedGender === "male"
      ? t("doctors.male")
      : normalizedGender === "female"
        ? t("doctors.female")
        : gender;

  return (
    <>
      <div className="card home-doctor-card">
        <div className="card-badges">
          {specialization ? (
            <p className="card-specialty">{specialization}</p>
          ) : (
            <span />
          )}
          {price ? <p className="card-price">{price}</p> : null}
        </div>
        <div className="card-body-layout">
          <img src={imgSrc} alt={`${first_name} ${last_name}`} className="doctor-card-image" />
          <section className="doctor-card-content">
            <h4>{`${first_name} ${last_name}`}</h4>
            {clinicLabel ? <p className="card-location">{clinicLabel}</p> : null}
            <div className="doctor-card-meta">
              {experience ? (
                <span>
                  {t("homeCards.yearsExperience", { count: experience })}
                </span>
              ) : null}
              {gender ? <span>{genderLabel}</span> : null}
            </div>
            <button className="buttonForBook">{t("homeCards.bookNow")}</button>
          </section>
        </div>
      </div>
    </>
  );
};

export default Cards;
