import React, { useEffect, useState } from "react";
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
      console.log(res.data);
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
          <Cards key={index} {...cardInfo} />
        ))}
      </div>
    </div>
  );
};

export default CardsComponent;
