import { useState } from "react";
import "../../GeneralStyles/GeneralStyles.css";
import { Link } from "react-router-dom";

function RegisterAsADoctor() {
  const [user, setUser] = useState({
    Fname: "",
    Lname: "",
    phone: "",
    password: "",
    medId: "",
    specialization: "",
    qualification: "",
    gender: "",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section className="section-center">
      <h1 className="title">Register</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="Fname" className="form-label">
          First Name
        </label>
        <input
          id="Fname"
          name="Fname"
          className="form-input form-row"
          type="text"
          placeholder="First Name"
          value={user.Fname}
          onChange={handleChange}
        />
        <label htmlFor="Lname" className="form-label">
          Last Name
        </label>
        <input
          id="Lname"
          name="Lname"
          className="form-input form-row"
          type="text"
          placeholder="Last Name"
          value={user.Lname}
          onChange={handleChange}
        />
        <label htmlFor="phone" className="form-label">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          className="form-input form-row"
          type="text"
          placeholder="+966"
          value={user.phone}
          onChange={handleChange}
        />

        <label htmlFor="password" className="form-label">
          {" "}
          Password
        </label>
        <input
          className="form-input form-row"
          type="password"
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={handleChange}
        />

        <label htmlFor="medID" className="form-label">
          {" "}
          Medical ID
        </label>
        <input
          className="form-input form-row"
          type="text"
          name="medID"
          placeholder="eg , 38921283"
          value={user.password}
          onChange={handleChange}
        />

        <label htmlFor="password" className="form-label">
          {" "}
          Password
        </label>
        <input
          className="form-input form-row"
          type="password"
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={handleChange}
        />

        <label htmlFor="special" className="form-label">
          {" "}
          Specialization
        </label>

        <select
          name="special"
          id=""
          value={user.specialization}
          onChange={handleChange}
          className="form-input form-row"
        >
          <option selected>Select a specialization</option>
          <option>اذن و حنجره</option>
          <option> المخ والأعصاب</option>
        </select>

        <label htmlFor="gender" className="form-label">
          {" "}
          Gender
        </label>
        <select
          name="gender"
          id=""
          value={user.specialization}
          onChange={handleChange}
          className="form-input form-row"
        >
          <option selected>Gender</option>
          <option> Male </option>
          <option> Female</option>
        </select>
        <button type="submit" className="btn btn-block">
          Register
        </button>

        <Link to="/register">
          <button className="btnRegisterAsDoctor btn-block">
            {" "}
            Register as a Patient
          </button>
        </Link>
      </form>
    </section>
  );
}

export default RegisterAsADoctor;
