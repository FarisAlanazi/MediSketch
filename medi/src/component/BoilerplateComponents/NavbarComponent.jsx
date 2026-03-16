import React from "react";
import "./FooterAndNavStyles/navbar.css";
import img from "../../assets/imgs/globalIcon.png";
import "../../GeneralStyles/buttonStyle.css";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function NavbarComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav>
      <div className="navbar">
        <img src={img} alt="the site's icon" />

        <ul style={{ display: "flex" }}>
          <li style={{ marginRight: "30px" }}>
            <Link to="/">Home</Link>
          </li>

          <li>
            <Link to="/findDoctor">Find Doctors</Link>
          </li>

          <li>
            <Link to="/viewAll">How it works</Link>
          </li>
        </ul>

        <section className="section-log">
          {isAuthenticated ? (
            <>
              <h4>
                <Link to="/account">{user?.username}</Link>
              </h4>
              <button onClick={handleLogout} className="buttons">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="buttons">Login</button>
              </Link>
              <Link to="/register">
                <button className="buttons">Sign up</button>
              </Link>
            </>
          )}
        </section>
      </div>
    </nav>
  );
}

export default NavbarComponent;
