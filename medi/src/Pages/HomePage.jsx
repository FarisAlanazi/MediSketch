import Footer from "../component/BoilerplateComponents/Footer";
import SearchComponent from "../component/homePageComponents/SearchComponent";
import CardsComponent from "../component/homePageComponents/CardsComponent";
import { Link } from "react-router-dom";
const HomePage = () => {
  return (
    <main className="home-page">
      <SearchComponent />
      <section className="specialists-section">
        <div className="FeaturedSpecialists">
          <article className="cardArtical">
            <h1>Featured Specialists</h1>
            <p>Top rated doctors for immediate booking</p>
          </article>
          <h4>
            <Link to="/viewAll">Discover Doctors on Map</Link>
          </h4>
        </div>
        <CardsComponent />
      </section>
      <Footer />
    </main>
  );
};

export default HomePage;
