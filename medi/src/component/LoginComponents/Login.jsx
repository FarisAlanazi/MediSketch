import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../GeneralStyles/GeneralStyles.css";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

function Login() {
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
        toast.success("Logged in");
        navigate("/");
      } else {
        return;
      }
    } catch (err) {
      console.log(err);
      toast.error("Invalid username or password");
    }
  };

  return (
    <section className="section-center">
      <h1 className="title">Login</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          id="username"
          name="username"
          className="form-input form-row"
          type="text"
          placeholder="Username"
          value={loginData.username}
          onChange={handleChange}
        />

        <label htmlFor="password">Password</label>
        <input
          className="form-input form-row"
          type="password"
          name="password"
          placeholder="Password"
          value={loginData.password}
          onChange={handleChange}
        />

        <button type="submit" className="btn btn-block">
          Login
        </button>
      </form>
    </section>
  );
}

export default Login;
