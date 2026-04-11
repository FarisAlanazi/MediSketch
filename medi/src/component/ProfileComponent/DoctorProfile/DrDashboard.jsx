import React from "react";
import { RxDashboard } from "react-icons/rx";
import { CiCalendar } from "react-icons/ci";
import Calender from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState } from "react";
import AvailableTime from "./dashboardElements/AvailableTime";
function DrDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="section-center">
      <section className="form">
        <div className="appointment">
          <h1 className="pending">Pending</h1>
          <RxDashboard size={30} />
        </div>
      </section>
      <label
        htmlFor="appointment_date"
        className="form-label"
        style={{ textAlign: "center" }}
      >
        <h5>
          {" "}
          <CiCalendar />
          Instant Booking Schedule
        </h5>{" "}
      </label>
      <section className="calendarContainer">
        <AvailableTime />
      </section>
    </div>
  );
}

export default DrDashboard;
