const Cards = ({ name, address, gender, img }) => {
  const imgSrc =
    img ||
    "../../assets/imgs/doctor-with-his-arms-crossed-white-background.jpg";
  return (
    <>
      <div className="card">
        <img src={imgSrc} alt="Doctor" />
        <section>
          <h2>{name}</h2>
          <h4>{address}</h4>
          <section>
            <h3></h3>
            <h3>{gender}</h3>
          </section>
        </section>
        <button className="buttonForBook">Book Now</button>
      </div>
    </>
  );
};

export default Cards;
