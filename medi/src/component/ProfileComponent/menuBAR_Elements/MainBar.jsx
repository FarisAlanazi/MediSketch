import React from "react";
import { Link, Outlet } from "react-router-dom";
import "../Profile_Style/tabs.css";
import { CiClock2 } from "react-icons/ci";
import { MdEventAvailable } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function MainBar() {
  const { t } = useTranslation();

  return (
    <div className="center-div">
      <section className="profile-tabs-shell">
        <ul className="profile-tabs">
          <li className="profile-tab-link">
            <Link to="/account/profile">
              <div className="profileLI">
                {t("profileTabs.profile")}
                <span>
                  <FaUserAlt size={20} />
                </span>
              </div>
            </Link>
          </li>
          <li className="profile-tab-link">
            <Link to="/account/MyAppointments">
              <div className="profileLI">
                {t("profileTabs.appointments")}
                <span>
                  <MdEventAvailable size={20} />
                </span>
              </div>
            </Link>
          </li>
          <li className="profile-tab-link">
            <Link to="/account/Pending">
              <div className="profileLI">
                {t("profileTabs.pending")}
                <span>
                  <CiClock2 size={20} />
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

export default MainBar;
