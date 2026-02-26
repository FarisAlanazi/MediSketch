import NavbarComponent from "../component/BoilerplateComponents/NavbarComponent";
import Footer from "../component/BoilerplateComponents/Footer";
import SearchComponent from "../component/homePageComponents/SearchComponent";
import CardsComponent from "../component/homePageComponents/CardsComponent";

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

        <a href="viewAll"> View All Doctors {"  >"} </a>
      </div>
      <CardsComponent />
      <Footer />
    </div>
  );
};

export default HomePage;
