import React from "react";
import { FaRegCalendarCheck } from "react-icons/fa";
import "../Profile_Style/appointmentStyle.css";
function Appointments() {
  return (
    <div className="section-center ">
      <section className="form ">
        <div className="appointment ">
          <h1>Appointment</h1>
          <FaRegCalendarCheck size={30} />
        </div>
      </section>
    </div>
  );
}

export default Appointments;
