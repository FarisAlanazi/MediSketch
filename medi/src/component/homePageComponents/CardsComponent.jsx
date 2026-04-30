import { useEffect, useState } from "react";
import "../../SearchAndCardStyle/cardsStyle.css";
import Cards from "./Cards";
import api from "../../Auth/LoginLogic";
import Loading from "../../Loading";
import { isDoctorProfileComplete } from "../../utils/doctorVisibility.jsx";
import { getAcceptedClinicName } from "../../utils/clinicRequestHelpers";
const CardsComponent = () => {
  const [cardElements, setCardElements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchData = async () => {
    try {
      const res = await api.get("/doctors/");
      // This keeps only complete public doctor profiles in the homepage section.
      const visibleDoctors = Array.isArray(res.data)
        ? res.data.filter((doctor) => isDoctorProfileComplete(doctor))
        : [];
      // This keeps the homepage limit after the public visibility filter is applied.
      setCardElements(visibleDoctors.slice(0, 6));
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
            gender={cardInfo.user.gender}
            img={cardInfo.profile_image}
            price={cardInfo.price}
            experience={cardInfo.years_of_experience}
            specialization={cardInfo.specialization}
            id={cardInfo.id}
            clinicName={getAcceptedClinicName(cardInfo)}
            city={cardInfo.city}
            rating={cardInfo.rating}
          />
        ))}
      </div>
    </div>
  );
};

export default CardsComponent;
