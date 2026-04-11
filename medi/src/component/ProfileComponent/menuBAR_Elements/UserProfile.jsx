import React from "react";
import api, { getCSRFToken } from "../../../Auth/LoginLogic";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import MainBar from "./MainBar";

function UserProfile() {
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    age: "",
    gender: "",
    user_type: "",
  });

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get("/me/");
        if (res.data) {
          const profileData = {
            first_name: res.data.first_name ?? "",
            last_name: res.data.last_name ?? "",
            email: res.data.email ?? "",
            phone_number: res.data.phone_number ?? "",
            gender: res.data.gender ?? "",
            age: res.data.age ?? "",
          };

          setUserInfo(profileData);
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
      await api.patch("/me/", userInfo);
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

export default UserProfile;
