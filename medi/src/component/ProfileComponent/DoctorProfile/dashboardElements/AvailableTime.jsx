import React from "react";
import DatePicker from "react-datePicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import api from "../../../../Auth/LoginLogic";
import { toast } from "react-toastify";
function AvailableTime() {
  const getCurrentDoctorId = async () => {
    try {
      const res = await api.get("/me/");
      return res.data.doctor_id;
    } catch (err) {
      return null;
    }
  };
  const doctorId = getCurrentDoctorId();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [Availability, setAvailability] = useState({
    date: "",
    time: "",
    status: true,
    doctor: doctorId,
  });
  const handleDateChange = (date) => {
    setSelectedDate(date);

    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; // YYYY-MM-DD
    const formattedTime = `${date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`; // HH:MM
    setAvailability({
      date: formattedDate,
      time: formattedTime,
      status: true,
      doctor: doctorId,
    });

    console.log(formattedDate, "formatted date");
    console.log(formattedTime, "formatted time");
  };

  const handleSubmission = async (e) => {
    e.preventDefault();

    // تحقق من وجود التاريخ والوقت
    if (!Availability.date || !Availability.time) {
      toast.error("Please select both a date and time!");
      return;
    }

    try {
      const res = await api.post("/available/", Availability);
      console.log("Availability added successfully:", res.data);
      toast.success("Availability added successfully!");
    } catch (error) {
      console.error("Error adding availability:", error);
      toast.error("Error adding availability!");
    }
  };
  return (
    <form action="" className="form" onSubmit={handleSubmission}>
      <label
        htmlFor="appointment_date"
        className="form-label"
        style={{ textAlign: "center" }}
      >
        today's Availability{" "}
      </label>
      <DatePicker
        className="calendarStyles vertical-timepicker"
        selected={selectedDate}
        onChange={handleDateChange}
        showTimeSelect
        timeCaption="الوقت"
        timeIntervals={30}
        timeFormat="hh:mm aa"
        dateFormat="d MMMM yyyy h:mm aa" // تحسين تنسيق التاريخ والوقت
      />
      <button
        type="submit"
        className="btn btn-block"
        style={{ marginTop: "20px" }}
      >
        Add Availability{" "}
      </button>
    </form>
  );
}

export default AvailableTime;
