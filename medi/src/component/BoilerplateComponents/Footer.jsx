import "./FooterAndNavStyles/footerStyle.css";
import img from "../../assets/imgs/globalIcon.png";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer-container">
      <div className="footer-info">
        <article className="footer-brand">
          <div className="footer-brand-top">
            <span className="footer-logo-shell">
              <img src={img} alt="" className="footer-logo" />
            </span>
            <h1>MediSketch</h1>
          </div>
          <p>{t("footer.description")}</p>
        </article>
        <article>
          <h1>{t("footer.about")}</h1>
          <a href="">{t("footer.aboutLink")}</a>
        </article>
        <article>
          <h1>{t("footer.legal")}</h1>
          <a href="">{t("footer.privacy")}</a>
          <a href="">{t("footer.terms")}</a>
        </article>
        <article>
          <h1>{t("footer.social")}</h1>
          <a href="">Twitter</a>
          <a href="">Twitter</a>
          <a href="">Twitter</a>
        </article>
      </div>
      <article
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="footer-info"
      >
        <h4 style={{ marginBottom: "0.5rem" }}>
          <Link to="/complaints">Complains and Suggestions </Link>
        </h4>
        <img
          src="../../../public/complain.png"
          alt=""
          style={{ width: "40px", height: "40px" }}
        />
      </article>
      <div className="footer-bottom">
        <p>{t("footer.copyright")}</p>
      </div>
    </footer>
  );
};

export default Footer;
