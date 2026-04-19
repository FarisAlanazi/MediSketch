import "./FooterAndNavStyles/footerStyle.css";
import img from "../../assets/imgs/globalIcon.png";

const Footer = () => {
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
          <p>
            Find trusted specialists and book medical care with a calmer,
            cleaner experience.
          </p>
        </article>
        <article>
          <h1>About</h1>
          <a href="">Lorem ipsum dolor sit amet, .</a>
        </article>
        <article>
          <h1>Legal</h1>
          <a href="">Privacy</a>
          <a href="">Terms</a>
        </article>
        <article>
          <h1>Social</h1>
          <a href="">Twitter</a>
          <a href="">Twitter</a>
          <a href="">Twitter</a>
        </article>
      </div>
      <div className="footer-bottom">
        <p>Copyright © 2026 MediConnect. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
