import { useState } from "react";
import "../../GeneralStyles/GeneralStyles.css";
import { toast } from "react-toastify";
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    //validation
    e.preventDefault();
    if (password.length < 8 || username.length < 3) {
      toast.error("Password or username is invalid");
      return;
    }

    // else{
    //   //post to the server and redirect
    // }
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
          className="form-input form-row"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password"> Password</label>
        <input
          className="form-input form-row"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn-block">
          Login
        </button>
      </form>
    </section>
  );
}

export default Login;
