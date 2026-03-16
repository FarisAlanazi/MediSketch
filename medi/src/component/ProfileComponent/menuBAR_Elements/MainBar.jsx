import React from "react";
import { Link, Outlet } from "react-router-dom";
import "../Profile_Style/tabs.css";
import { CiClock2 } from "react-icons/ci";
import { MdEventAvailable } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";

function MainBar() {
  return (
    <div className="section-center">
      <section className="section">
        <ul>
          <Link to="/account/profile">
            <li className="profileLI">
              Profile
              <span>
                <FaUserAlt size={20} />
              </span>
            </li>
          </Link>
          <Link to={"/account/MyAppointments"}>
            <li className="profileLI">
              Appointments{" "}
              <span>
                {" "}
                <MdEventAvailable size={20} />
              </span>
            </li>
          </Link>
          <Link to="/account/Pending">
            <li className="profileLI">
              Pending{" "}
              <span>
                <CiClock2 size={20} />
              </span>
            </li>
          </Link>
        </ul>
      </section>

      <Outlet />
    </div>
  );
}

export default MainBar;
