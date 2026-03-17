const Cards = ({
  first_name,
  last_name,
  price,
  gender,
  img,
  specialization,
}) => {
  const imgSrc =
    img ||
    "../../assets/imgs/doctor-with-his-arms-crossed-white-background.jpg";
  return (
    <>
      <div className="card">
        <img src={imgSrc} alt="Doctor" />
        <section>
          <h4>{`${first_name} ${last_name}`}</h4>
          <p>{price}</p>
          <section>
            <h3>{specialization}</h3>
            <h3>{gender}</h3>
          </section>
        </section>
        <button className="buttonForBook">Book Now</button>
      </div>
    </>
  );
};

export default Cards;
