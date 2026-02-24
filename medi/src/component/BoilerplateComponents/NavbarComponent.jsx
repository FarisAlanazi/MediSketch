import React from "react";
import "./FooterAndNavStyles/navbar.css";
import img from "../../assets/imgs/globalIcon.png";
import "../../GeneralStyles/buttonStyle.css";
function NavbarComponent() {
  return (
    <nav>
      <div className="navbar">
        <img src={img} alt="the site's icon" />

        <ul>
          <li>
            <a href="#Home"> Home</a>
          </li>
          <li>
            <a href="#Home"> Find Doctor</a>
          </li>
          <li>
            <a href="/#doctors"> How it works</a>
          </li>
        </ul>

        <section>
          <button className="buttons">Login </button>
          <button className="buttons">Sign up</button>
        </section>
      </div>
    </nav>
  );
}

export default NavbarComponent;
