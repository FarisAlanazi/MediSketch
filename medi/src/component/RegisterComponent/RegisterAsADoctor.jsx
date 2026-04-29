import { useState } from "react";
import "../../GeneralStyles/GeneralStyles.css";
import { Link } from "react-router-dom";
import Registration from "../../Auth/RegistrationLogic";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

function RegisterAsADoctor() {
  const { t } = useTranslation();
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

    if (
      user.phone_number.length > 10 ||
      user.password.length < 8 ||
      !user.first_name ||
      !user.last_name ||
      !user.email ||
      !user.username
    ) {
      toast.error(t("auth.fillAllFields"));
      return;
    } else {
      Registration({ ...user });
    }
  };

  return (
    <section className="section-center">
      <h1 className="title">{t("auth.doctorRegistration")}</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="Fname" className="form-label">
          {t("auth.firstName")}
        </label>
        <input
          id="Fname"
          name="first_name"
          className="form-input form-row"
          type="text"
          placeholder={t("auth.firstName")}
          value={user.first_name}
          onChange={handleChange}
        />
        <label htmlFor="Lname" className="form-label">
          {t("auth.lastName")}
        </label>
        <input
          id="Lname"
          name="last_name"
          className="form-input form-row"
          type="text"
          placeholder={t("auth.lastName")}
          value={user.last_name}
          onChange={handleChange}
        />

        <label htmlFor="phone" className="form-label">
          {t("auth.phone")}
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
          {t("auth.email")}
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
          {t("auth.username")}
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
          {t("auth.password")}
        </label>
        <input
          className="form-input form-row"
          type="password"
          name="password"
          placeholder={t("auth.password")}
          value={user.password}
          onChange={handleChange}
        />

        <button type="submit" className="btn btn-block">
          {t("auth.register")}
        </button>

        <Link to="/register">
          <button className="btnRegisterAsDoctor btn-block">
            {t("auth.registerAsPatient")}
          </button>
        </Link>
      </form>
    </section>
  );
}

export default RegisterAsADoctor;
