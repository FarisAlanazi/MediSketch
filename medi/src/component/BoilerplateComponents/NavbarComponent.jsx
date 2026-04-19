import { useEffect, useState } from "react";
import "./FooterAndNavStyles/navbar.css";
import img from "../../assets/imgs/globalIcon.png";
import "../../GeneralStyles/buttonStyle.css";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/findDoctor", label: "Find Doctors" },
  { to: "/viewAll", label: "Discover Doctors on Map" },
];

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem("medi-theme") === "dark"
    ? "dark"
    : "light";
};

function NavbarComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("medi-theme", theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  const handleThemeToggle = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const handleMenuToggle = () => {
    setIsMenuOpen((currentValue) => !currentValue);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const renderAuthActions = () => (
    <>
      {/* <span className="navbar-language">EN</span> */}
      {isAuthenticated ? (
        <>
          <h4 className="navbar-user">
            <Link to="/entry" onClick={handleMenuClose}>
              {user?.username}
            </Link>
          </h4>
          <button
            type="button"
            onClick={handleLogout}
            className="buttons buttons-secondary"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="nav-login-link"
            onClick={handleMenuClose}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="buttons buttons-primary"
            onClick={handleMenuClose}
          >
            Sign Up
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="site-nav">
      <div className="navbar">
        <Link to="/" className="navbar-brand" aria-label="MediConnect home">
          <span className="navbar-logo-shell">
            <img src={img} alt="" className="navbar-logo" />
          </span>
          <span className="navbar-brand-text">MEDISKETCH</span>
        </Link>

        <ul className="navbar-links">
          {navItems.map((item) => (
            <li key={item.to} className="navbar-item">
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <button
            type="button"
            className="navbar-theme-toggle"
            onClick={handleThemeToggle}
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          <section className="section-log navbar-desktop-actions">
            {renderAuthActions()}
          </section>

          <button
            type="button"
            className={`navbar-menu-toggle ${isMenuOpen ? "is-open" : ""}`}
            onClick={handleMenuToggle}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="navbar-menu-icon">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`navbar-mobile-panel ${isMenuOpen ? "is-open" : ""}`}
      >
        <ul className="navbar-mobile-links">
          {navItems.map((item) => (
            <li key={`mobile-${item.to}`} className="navbar-mobile-item">
              <Link to={item.to} onClick={handleMenuClose}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <section className="section-log navbar-mobile-auth">
          {renderAuthActions()}
        </section>
      </div>
    </nav>
  );
}

export default NavbarComponent;
