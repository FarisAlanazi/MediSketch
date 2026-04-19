import { useEffect, useState } from "react";
// import img from "../../assets/imgs/doctor-with-his-arms-crossed-white-background.jpg";
import "../../SearchAndCardStyle/cardsStyle.css";
import Cards from "./Cards";
import api from "../../Auth/LoginLogic";
import Loading from "../../Loading";
const CardsComponent = () => {
  const [cardElements, setCardElements] = useState([]); // best 6 doctors
  const [isLoading, setIsLoading] = useState(true);
  const fetchData = async () => {
    try {
      const res = await api.get("/doctors/");

      setCardElements(res.data.slice(0, 6));
      console.log(res.data[0]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="cardsDiv">
      <div className="card-container">
        {cardElements.map((cardInfo, index) => (
          <Cards
            key={cardInfo.id || index}
            first_name={cardInfo.user.first_name}
            last_name={cardInfo.user.last_name}
            age={cardInfo.user.age}
            clinic={cardInfo.clinic}
            gender={cardInfo.user.gender}
            price={cardInfo.price}
            experience={cardInfo.years_of_experience}
            specialization={cardInfo.specialization}
          />
        ))}
      </div>
    </div>
  );
};

export default CardsComponent;
