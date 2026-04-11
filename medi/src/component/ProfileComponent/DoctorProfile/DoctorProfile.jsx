import React from "react";
import api, { getCSRFToken } from "../../../Auth/LoginLogic";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MdPriceChange } from "react-icons/md";

function DoctorProfile() {
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    age: "",
    gender: "",
    user_type: "",
    about_me: "",
    years_of_experience: "",
    price: "",
    address: "",
    specialization: "",
    id: "",
  });

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get(`me/`);
        if (res.data) {
          const profileData = {
            first_name: res.data.first_name ?? "",
            last_name: res.data.last_name ?? "",
            email: res.data.email ?? "",
            phone_number: res.data.phone_number ?? "",
            gender: res.data.gender ?? "",
            age: res.data.age ?? "",
            user_type: res.data.user_type ?? "",
            about_me: res.data.about_me ?? "",
            years_of_experience: res.data.years_of_experience ?? "",
            price: res.data.price ?? "",
            address: res.data.address ?? "",
            specialization: res.data.specialization ?? "",
            id: res.data.id ?? "",
          };

          setUserInfo(profileData);
          console.log(profileData);
        }
        console.log(res);
      } catch (err) {
        console.log(err);
      }
    };

    getData();
  }, []);

  const handleSubmission = async (e) => {
    e.preventDefault();
    await getCSRFToken();

    try {
      const patch = await api.patch(`me/`, userInfo);
      console.log(patch);
      toast.success("Profile edited successfully");
    } catch (err) {
      toast.error("something went wrong", err);
    }
  };

  return (
    <div className="section-center">
      <form className="form" onSubmit={handleSubmission}>
        {/* <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          className="form-input form-row"
          value={userInfo.username}
          onChange={handleChange}
        /> */}

        <label htmlFor="first_name" className="form-label">
          First Name
        </label>
        <input
          type="text"
          name="first_name"
          id="first_name"
          className="form-input form-row"
          value={userInfo.first_name}
          onChange={handleChange}
        />
        <label htmlFor="last_name" className="form-label">
          Last Name
        </label>
        <input
          type="text"
          name="last_name"
          id="last_name"
          className="form-input form-row"
          value={userInfo.last_name}
          onChange={handleChange}
        />
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="text"
          name="email"
          id="email"
          className="form-input form-row"
          value={userInfo.email}
          onChange={handleChange}
        />
        <label htmlFor="phone_number" className="form-label">
          Phone
        </label>
        <input
          type="text"
          name="phone_number"
          id="phone_number"
          className="form-input form-row"
          value={userInfo.phone_number}
          onChange={handleChange}
        />
        <label htmlFor="age" className="form-label">
          Age
        </label>
        <input
          type="text"
          name="age"
          id="age"
          className="form-input form-row"
          value={userInfo.age}
          onChange={handleChange}
        />

        <label htmlFor="price" className="form-label">
          Price
        </label>
        <input
          type="text"
          name="price"
          id="price"
          className="form-input form-row"
          value={userInfo.price}
          onChange={handleChange}
        />
        <label htmlFor="address" className="form-label">
          Address
        </label>
        <input
          type="text"
          name="address"
          id="address"
          className="form-input form-row"
          value={userInfo.address}
          onChange={handleChange}
        />

        <label htmlFor="years" className="form-label">
          {" "}
          years of experience{" "}
        </label>
        <input
          type="number"
          value={userInfo.years_of_experience}
          onChange={handleChange}
          name="years_of_experience"
          id="years"
          className="form-input form-row"
        />
        <label htmlFor="about_me" className="form-label">
          About Me
        </label>
        <textarea
          name="about_me"
          id="about_me"
          className=" form-row form-textarea"
          value={userInfo.about_me}
          onChange={handleChange}
        />

        <label htmlFor="specialization" className="form-label">
          Specialization
        </label>
        <select
          name="specialization"
          id="specialization"
          value={userInfo.specialization}
          onChange={handleChange}
          className="form-input"
          defaultValue={"empty"}
        >
          <option value="empty"> SELECT YOUR SPECIALIZATION</option>
          <option value="1">CARDIOLOGY</option>
          <option value="2">NEUROLOGY</option>
          <option value="3">PEDIATRICS</option>
          <option value="4">DERMATOLOGY</option>
          <option value="5">PSYCHIATRY</option>
          <option value="6">ORTHOPEDICS</option>
          <option value="7">GYNECOLOGY</option>
          <option value="8">GENERAL PRACTICE</option>
          <option value="9">OTHER</option>
        </select>

        <label htmlFor="gender" className="form-label">
          Gender
        </label>
        <select
          name="gender"
          id="gender"
          value={userInfo.gender}
          onChange={handleChange}
          className="form-input"
          defaultValue={"empty"}
        >
          <option value="empty"> SELECT YOUR GENDER</option>
          <option value="male">MALE</option>
          <option value="female">FEMALE</option>
        </select>

        <button className="btn btn-block" style={{ marginTop: "35px" }}>
          Edit
        </button>
      </form>
    </div>
  );
}

export default DoctorProfile;
