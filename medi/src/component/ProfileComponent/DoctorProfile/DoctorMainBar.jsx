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
      <section className="profile-tabs-shell">
        <ul className="profile-tabs">
          <li className="profile-tab-link">
            <Link to="/doctor/profile">
              <div className="profileLI">
                Doctor Profile
                <span>
                  <FaUserAlt size={20} />
                </span>
              </div>
            </Link>
          </li>
          <li className="profile-tab-link">
            <Link to="/doctor/appointments">
              <div className="profileLI">
                Appointments
                <span>
                  <MdEventAvailable size={20} />
                </span>
              </div>
            </Link>
          </li>
          <li className="profile-tab-link">
            <Link to="/doctor/pending-requests">
              <div className="profileLI">
                Requests
                <span>
                  <CiClock2 size={20} />
                </span>
              </div>
            </Link>
          </li>
          <li className="profile-tab-link">
            <Link to="/doctor/dashboard">
              <div className="profileLI">
                Dashboard
                <span>
                  <RxDashboard size={20} />
                </span>
              </div>
            </Link>
          </li>
        </ul>
      </section>

      <Outlet />
    </div>
  );
}

export default DoctorMainBar;
