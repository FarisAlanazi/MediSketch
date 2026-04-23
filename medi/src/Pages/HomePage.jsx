import Footer from "../component/BoilerplateComponents/Footer";
import SearchComponent from "../component/homePageComponents/SearchComponent";
import CardsComponent from "../component/homePageComponents/CardsComponent";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
const HomePage = () => {
  const { t } = useTranslation();

  return (
    <main className="home-page">
      <SearchComponent />
      <section className="specialists-section">
        <div className="FeaturedSpecialists">
          <article className="cardArtical">
            <h1>{t("home.featuredTitle")}</h1>
            <p>{t("home.featuredSubtitle")}</p>
          </article>
          <h4>
            <Link to="/viewAll">{t("home.discoverLink")}</Link>
          </h4>
        </div>
        <CardsComponent />
      </section>
      <Footer />
    </main>
  );
};

export default HomePage;
