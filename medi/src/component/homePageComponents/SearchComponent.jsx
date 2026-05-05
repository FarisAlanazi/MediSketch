import { useState } from "react";
import "../../SearchAndCardStyle/searchComponentStyle.css";
import doctorImg from "../../assets/imgs/DoctorOnPhone.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
function SearchComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedSearchValue = searchValue.trim();
    navigate(
      normalizedSearchValue
        ? `/findDoctor?search=${encodeURIComponent(normalizedSearchValue)}`
        : "/findDoctor",
    );
  };

  return (
    <div className="container">
      <div className="divWithInput">
        <h1>
          {t("hero.titleStart")} <span>{t("hero.titleHighlight")}</span>
        </h1>
        <p id="paragraph">{t("hero.description")}</p>
        <form className="searchShell" onSubmit={handleSubmit}>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t("hero.placeholder")}
            aria-label={t("hero.aria")}
          />
          <button type="submit" className="searchShellButton">
            {t("hero.button")}
          </button>
        </form>
        <p className="searchHelperNote">{t("hero.helper")}</p>
      </div>
      <div className="imgClass">
        <img src={doctorImg} alt={t("hero.imageAlt")} className="doctorImg" />
      </div>
    </div>
  );
}

export default SearchComponent;
