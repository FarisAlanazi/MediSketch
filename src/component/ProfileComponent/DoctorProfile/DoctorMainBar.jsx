import React from "react";
import { Link, Outlet } from "react-router-dom";
import "../Profile_Style/tabs.css";
import { CiClock2 } from "react-icons/ci";
import { MdEventAvailable } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { useTranslation } from "react-i18next";

function DoctorMainBar() {
  const { t } = useTranslation();

  return (
    <div className="center-div">
      <section className="profile-tabs-shell">
        <ul className="profile-tabs">
          <li className="profile-tab-link">
            <Link to="/doctor/profile">
              <div className="profileLI">
                {t("profileTabs.doctorProfile")}
                <span>
                  <FaUserAlt size={20} />
                </span>
              </div>
            </Link>
          </li>
          <li className="profile-tab-link">
            <Link to="/doctor/appointments">
              <div className="profileLI">
                {t("profileTabs.appointments")}
                <span>
                  <MdEventAvailable size={20} />
                </span>
              </div>
            </Link>
          </li>
          <li className="profile-tab-link">
            <Link to="/doctor/pending-requests">
              <div className="profileLI">
                {t("profileTabs.requests")}
                <span>
                  <CiClock2 size={20} />
                </span>
              </div>
            </Link>
          </li>
          <li className="profile-tab-link">
            <Link to="/doctor/dashboard">
              <div className="profileLI">
                {t("profileTabs.dashboard")}
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
