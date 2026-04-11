import DoctorCards from "./DoctorCards";
import { useEffect, useState } from "react";
import api from "../../Auth/LoginLogic";
export default function Doctors() {
  const [doctors, setDoctors] = useState([]);

  const getAllDoctors = async () => {
    try {
      const response = await api.get("/doctors/");
      setDoctors(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };
  useEffect(() => {
    getAllDoctors();
  }, []);
  return (
    <>
      {doctors.map((doctor) => (
        <DoctorCards
          key={doctor.id}
          gender={doctor.gender}
          special={doctor.special}
          experience={doctor.years_of_experience}
          price={doctor.price}
          firstname={doctor.user.first_name}
          lastname={doctor.user.last_name}
          id={doctor.id}
        />
      ))}
    </>
  );
}
