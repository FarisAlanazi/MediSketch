import { useState } from "react";
import "../../SearchAndCardStyle/searchComponentStyle.css";
import doctorImg from "../../assets/imgs/DoctorOnPhone.png";
import { useTranslation } from "react-i18next";
function SearchComponent() {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState();
  return (
    <div className="container">
      <div className="divWithInput">
        <h1>
          {t("hero.titleStart")} <span>{t("hero.titleHighlight")}</span>
        </h1>
        <p id="paragraph">{t("hero.description")}</p>
        <div className="searchShell">
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t("hero.placeholder")}
            aria-label={t("hero.aria")}
          />
          <span className="searchShellButton" aria-hidden="true">
            {t("hero.button")}
          </span>
        </div>
        <p className="searchHelperNote">{t("hero.helper")}</p>
      </div>
      <div className="imgClass">
        <img
          src={doctorImg}
          alt={t("hero.imageAlt")}
          className="doctorImg"
        />
      </div>
    </div>
  );
}

export default SearchComponent;
