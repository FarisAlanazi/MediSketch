import "./FooterAndNavStyles/footerStyle.css";
import img from "../../assets/imgs/globalIcon.png";
import { useTranslation } from "react-i18next";

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
      <div className="footer-bottom">
        <p>{t("footer.copyright")}</p>
      </div>
    </footer>
  );
};

export default Footer;
