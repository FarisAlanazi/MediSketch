import { useState } from "react";
import "../../GeneralStyles/GeneralStyles.css";
import { Link } from "react-router-dom";
import Registration from "../../Auth/RegistrationLogic";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
function Register() {
  const { t } = useTranslation();
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
      <h1 className="title">{t("auth.register")}</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="first_name" className="form-label">
          {t("auth.firstName")}
        </label>
        <input
          id="first_name"
          name="first_name"
          className="form-input form-row"
          type="text"
          placeholder={t("auth.firstName")}
          value={user.first_name}
          onChange={handleChange}
        />
        <label htmlFor="last_name" className="form-label">
          {t("auth.lastName")}
        </label>
        <input
          id="last_name"
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
          type="number"
          placeholder="+966"
          value={user.phone_number}
          onChange={handleChange}
        />
        <label htmlFor="phone" className="form-label">
          {t("auth.email")}
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
          {t("auth.username")}
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
        <label htmlFor="password">{t("auth.password")}</label>
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
        <Link to="/register/doctor">
          <button className="btnRegisterAsDoctor btn-block">
            {t("auth.registerAsDoctor")}
          </button>
        </Link>
        {/* This routes users directly to the clinic registration view. */}
        <Link
          to="/clinic?mode=register"
          className="btnRegisterAsDoctor btn-block"
          style={{ textAlign: "center", marginTop: "12px" }}
        >
          Register as clinic
        </Link>
      </form>
    </section>
  );
}

export default Register;
