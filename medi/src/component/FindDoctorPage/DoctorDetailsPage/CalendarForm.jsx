import React from "react";
import DatePicker from "react-datePicker";
import "react-datepicker/dist/react-datepicker.css";
import "./detailsStyles/styles.css";
import { CiCalendar } from "react-icons/ci";
import { useState } from "react";
function CalendarForm() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div>
      <form action="" className="form">
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
          <DatePicker
            className="calendarStyles vertical-timepicker "
            selected={selectedDate}
            onChange={handleDateChange}
            value={selectedDate}
            showTimeSelect
            timeCaption="الوقت"
            timeIntervals={30}
            dateFormat="MMMM d, yyyy h:mm aa"
          />
        </section>
        <button type="button" className=" btn btn-primary btn-block">
          Book Now
        </button>
      </form>
    </div>
  );
}

export default CalendarForm;
