import React from "react";
import "./FooterAndNavStyles/navbar.css";
import img from "../../assets/imgs/globalIcon.png";
import "../../GeneralStyles/buttonStyle.css";
import { Link } from "react-router-dom";
function NavbarComponent() {
  return (
    <nav>
      <div className="navbar">
        <img src={img} alt="the site's icon" />

        <ul style={{ display: "flex" }}>
          <Link to="/">
            <li style={{ marginRight: "30px" }}>Home</li>
          </Link>
          <li>
            <a href="#Home"> Find Doctor</a>
          </li>
          <li>
            <a href="/#doctors"> How it works</a>
          </li>
        </ul>

        <section>
          <Link to="/login">
            <button className="buttons">Login </button>
          </Link>
          <Link to="/register">
            <button className="buttons">Sign up</button>
          </Link>
        </section>
      </div>
    </nav>
  );
}

export default NavbarComponent;
