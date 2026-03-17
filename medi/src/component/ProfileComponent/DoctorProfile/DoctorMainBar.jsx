import React from "react";
import { Link, Outlet } from "react-router-dom";
import "../Profile_Style/tabs.css";
import { CiClock2 } from "react-icons/ci";
import { MdEventAvailable } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";

function DoctorMainBar() {
  return (
    <div className="center-div">
      <section className="section">
        <ul>
          <Link to="/doctor/profile">
            <li className="profileLI">
              Profile
              <span>
                <FaUserAlt size={20} />
              </span>
            </li>
          </Link>
          <Link to={"/doctor/appointments"}>
            <li className="profileLI">
              Appointments{" "}
              <span>
                {" "}
                <MdEventAvailable size={20} />
              </span>
            </li>
          </Link>
          <Link to="/doctor/pending-requests">
            <li className="profileLI">
              Pending{" "}
              <span>
                <CiClock2 size={20} />
              </span>
            </li>
          </Link>

          <Link to="/doctor/dashboard">
            <li className="profileLI">
              Dashboard{" "}
              <span>
                <RxDashboard size={20} />
              </span>
            </li>
          </Link>
        </ul>
      </section>

      <Outlet />
    </div>
  );
}

export default DoctorMainBar;
