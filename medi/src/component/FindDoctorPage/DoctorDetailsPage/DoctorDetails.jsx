import React from "react";
import { useParams } from "react-router-dom";
import api from "../../../Auth/LoginLogic";
import { useEffect } from "react";
import { useState } from "react";
import "react-calendar/dist/Calendar.css";
import CalendarForm from "./CalendarForm";
import LocationCard from "./LocationCard";
import Reviews from "./Reviews";
import "./detailsStyles/styles.css";
function DoctorDetails() {
  const { id } = useParams();
  const [doctorDetails, setDoctorDetails] = useState(null);
  const getDoctorDetails = async () => {
    try {
      const response = await api.get(`/doctors/${id}/`);
      setDoctorDetails(response.data);
      console.log(response.data, " details");
    } catch (error) {
      console.error("Error fetching doctor details:", error);
    }
  };

  useEffect(() => {
    getDoctorDetails();
  }, [id]);

  return (
    <div className="gridSystemDoctorDetails">
      {doctorDetails && (
        <div className="form">
          <img
            src="../../../assets/doctor-with-his-arms-crossed-white-background.jpg"
            alt=""
          />
          <p className="form-label">
            <strong>Name:</strong> {doctorDetails.user.first_name}{" "}
            {doctorDetails.user.last_name}
          </p>

          <p className="form-label">
            <strong>Specialization:</strong> {doctorDetails.specialization}
          </p>
          <p className="form-label">
            <strong>Experience:</strong> {doctorDetails.years_of_experience}{" "}
            years
          </p>
          <p className="form-label">
            <strong>Price:</strong> ${doctorDetails.price}
          </p>
          <p className="form-label">
            <strong>Gender:</strong> {doctorDetails.gender}
          </p>
          <p>Rate </p>
        </div>
      )}
      <CalendarForm />
      <LocationCard />
      <Reviews />
    </div>
  );
}

export default DoctorDetails;
