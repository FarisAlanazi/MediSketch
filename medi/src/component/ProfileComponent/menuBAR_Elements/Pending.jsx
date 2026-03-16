import React from "react";
import { FaClock } from "react-icons/fa6";
import "../Profile_Style/appointmentStyle.css";
function Pending() {
  return (
    <div className="section-center">
      <section className="form">
        <div className="appointment">
          <h1 className="pending">Pending</h1>
          <FaClock size={30} />
        </div>
      </section>
    </div>
  );
}

export default Pending;
