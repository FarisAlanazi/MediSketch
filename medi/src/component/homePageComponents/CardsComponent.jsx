import React, { useEffect, useState } from "react";
// import img from "../../assets/imgs/doctor-with-his-arms-crossed-white-background.jpg";
import "../../SearchAndCardStyle/cardsStyle.css";
import Cards from "./Cards";
import Loading from "../../Loading";
const CardsComponent = () => {
  const [cardElements, setCardElements] = useState([]); // best 6 doctors
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/doctors/");
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setCardElements(data.slice(0, 6));
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
    setIsLoading(false);
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
