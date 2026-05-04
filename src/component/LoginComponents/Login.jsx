import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../GeneralStyles/GeneralStyles.css";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

function Login() {
  const { t } = useTranslation();
  const [loginData, setLogInData] = useState({
    username: "",
    password: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLogInData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const loginvalidation = await login(loginData);
      if (loginvalidation.status === 200) {
        toast.success(t("auth.loggedIn"));
        navigate("/");
      } else {
        return;
      }
    } catch (err) {
      console.log(err);
      toast.error(t("auth.invalidCredentials"));
    }
  };

  return (
    <section className="section-center">
      <h1 className="title">{t("auth.login")}</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="username" className="form-label">
          {t("auth.username")}
        </label>
        <input
          id="username"
          name="username"
          className="form-input form-row"
          type="text"
          placeholder={t("auth.username")}
          value={loginData.username}
          onChange={handleChange}
        />

        <label htmlFor="password">{t("auth.password")}</label>
        <input
          className="form-input form-row"
          type="password"
          name="password"
          placeholder={t("auth.password")}
          value={loginData.password}
          onChange={handleChange}
        />

        <button type="submit" className="btn btn-block">
          {t("auth.login")}
        </button>
      </form>
    </section>
  );
}

export default Login;
