import { useState } from "react";
import "../../GeneralStyles/GeneralStyles.css";
import { Link } from "react-router-dom";
import RegisterAsADoctor from "./RegisterAsADoctor";
function Register() {
  const [user, setUser] = useState({
    Fname: "",
    Lname: "",
    phone: "",
    password: "",
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
