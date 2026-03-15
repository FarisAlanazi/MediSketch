import { useState } from "react";
import "../../GeneralStyles/GeneralStyles.css";
import { Link } from "react-router-dom";
import Registration from "../../Auth/RegistrationLogic";
function RegisterAsADoctor() {
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
    username: "",
    email: "",
    user_type: "doctor",
    // medId: "",
    // specialization: "",
    // qualification: "",
    // gender: "",
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
      <h1 className="title">
        <span>Doctor</span> Registration
      </h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="Fname" className="form-label">
          First Name
        </label>
        <input
          id="Fname"
          name="first_name"
          className="form-input form-row"
          type="text"
          placeholder="First Name"
          value={user.first_name}
          onChange={handleChange}
        />
        <label htmlFor="Lname" className="form-label">
          Last Name
        </label>
        <input
          id="Lname"
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
          type="text"
          placeholder="+966"
          value={user.phone_number}
          onChange={handleChange}
        />
        <label htmlFor="email" className="form-label">
          email
        </label>
        <input
          id="email"
          name="email"
          className="form-input form-row"
          type="text"
          placeholder="example@example.com"
          value={user.email}
          onChange={handleChange}
        />
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          id="username"
          name="username"
          className="form-input form-row"
          type="text"
          placeholder="Dr_Hamm"
          value={user.username}
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
