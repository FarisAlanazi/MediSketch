import { useState } from "react";
import "../../GeneralStyles/GeneralStyles.css";
import { Link, Navigate } from "react-router-dom";
import Registration from "../../Auth/RegistrationLogic";

function Register() {
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
    username: "",
    email: "",
    user_type: "patient",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    Registration({ ...user });
  };

  return (
    <section className="section-center">
      <h1 className="title">Register</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="first_name" className="form-label">
          First Name
        </label>
        <input
          id="first_name"
          name="first_name"
          className="form-input form-row"
          type="text"
          placeholder="First Name"
          value={user.first_name}
          onChange={handleChange}
        />
        <label htmlFor="last_name" className="form-label">
          Last Name
        </label>
        <input
          id="last_name"
          name="last_name"
          className="form-input form-row"
          type="text"
          placeholder="Last Name"
          value={user.last_name}
          onChange={handleChange}
        />
        <label htmlFor="phone" className="form-label">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone_number"
          className="form-input form-row"
          type="number"
          placeholder="+966"
          value={user.phone_number}
          onChange={handleChange}
        />
        <label htmlFor="phone" className="form-label">
          email
        </label>
        <input
          id="email"
          name="email"
          className="form-input form-row"
          type="email"
          placeholder="example@example.com"
          value={user.email}
          onChange={handleChange}
        />

        <label htmlFor="phone" className="form-label">
          Username
        </label>
        <input
          id="username"
          name="username"
          className="form-input form-row"
          type="text"
          placeholder="Hamzah_Alanazi"
          value={user.username}
          onChange={handleChange}
        />
        <label htmlFor="password"> Password</label>
        <input
          className="form-input form-row"
          type="password"
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={handleChange}
        />
        <button type="submit" className="btn btn-block">
          Register
        </button>
        <Link to="/register/doctor">
          <button className="btnRegisterAsDoctor btn-block">
            {" "}
            Register as a Doctor
          </button>
        </Link>
      </form>
    </section>
  );
}

export default Register;
