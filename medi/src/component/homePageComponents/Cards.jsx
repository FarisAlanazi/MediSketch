import fallbackDoctorImg from "../../assets/doctor-with-his-arms-crossed-white-background.jpg";

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
  const imgSrc = img || fallbackDoctorImg;
  const clinicLabel =
    typeof clinic === "string" ? clinic : clinic?.name || clinic?.address;

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
              {experience ? <span>{experience} years experience</span> : null}
              {gender ? <span>{gender}</span> : null}
            </div>
            <button className="buttonForBook">Book Now</button>
          </section>
        </div>
      </div>
    </>
  );
};

export default Cards;
