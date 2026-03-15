import NavbarComponent from "../component/BoilerplateComponents/NavbarComponent";
import Footer from "../component/BoilerplateComponents/Footer";
import SearchComponent from "../component/homePageComponents/SearchComponent";
import CardsComponent from "../component/homePageComponents/CardsComponent";
import { Link } from "react-router-dom";
const HomePage = () => {
  return (
    <div
      style={{
        width: "100%",
        padding: "0",
        height: "100vh",
      }}
    >
      <SearchComponent />
      <div className="FeaturedSpecialists">
        <article className="cardArtical">
          <h1>Featured Specialists</h1>
          <p>Top rated doctors for immediate booking</p>
        </article>
        <h4>
          <Link to="/viweAll">View All Doctors</Link>
        </h4>
      </div>
      <CardsComponent />
      <Footer />
    </div>
  );
};

export default HomePage;
