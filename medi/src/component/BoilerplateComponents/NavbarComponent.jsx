import { useEffect, useState } from "react";
import "./FooterAndNavStyles/navbar.css";
import img from "../../assets/imgs/globalIcon.png";
import "../../GeneralStyles/buttonStyle.css";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  const navItems = [
    { to: "/", label: t("nav.home") },
    { to: "/findDoctor", label: t("nav.findDoctors") },
    { to: "/viewAll", label: t("nav.discoverMap") },
  ];

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

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    window.localStorage.setItem("medi-language", language);
    setIsMenuOpen(false);
  };

  const renderAuthActions = () => (
    <>
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
            {t("nav.logout")}
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="nav-login-link"
            onClick={handleMenuClose}
          >
            {t("nav.login")}
          </Link>
          <Link
            to="/register"
            className="buttons buttons-primary"
            onClick={handleMenuClose}
          >
            {t("nav.signUp")}
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="site-nav">
      <div className="navbar">
        <Link to="/" className="navbar-brand" aria-label={t("nav.brandHome")}>
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
          <div className="navbar-language-switch" aria-label="Language switch">
            <button
              type="button"
              className={`navbar-language-button ${
                i18n.language === "en" ? "is-active" : ""
              }`}
              onClick={() => handleLanguageChange("en")}
            >
              {t("nav.english")}
            </button>
            <button
              type="button"
              className={`navbar-language-button ${
                i18n.language === "ar" ? "is-active" : ""
              }`}
              onClick={() => handleLanguageChange("ar")}
            >
              {t("nav.arabic")}
            </button>
          </div>

          <button
            type="button"
            className="navbar-theme-toggle"
            onClick={handleThemeToggle}
          >
            {theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}
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
            aria-label={isMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
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
          <div className="navbar-mobile-language-switch">
            <button
              type="button"
              className={`navbar-language-button ${
                i18n.language === "en" ? "is-active" : ""
              }`}
              onClick={() => handleLanguageChange("en")}
            >
              {t("nav.english")}
            </button>
            <button
              type="button"
              className={`navbar-language-button ${
                i18n.language === "ar" ? "is-active" : ""
              }`}
              onClick={() => handleLanguageChange("ar")}
            >
              {t("nav.arabic")}
            </button>
          </div>
          {renderAuthActions()}
        </section>
      </div>
    </nav>
  );
}

export default NavbarComponent;
