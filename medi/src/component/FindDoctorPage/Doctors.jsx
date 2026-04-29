import { useEffect, useMemo, useState } from "react";
import DoctorCards from "./DoctorCards";
import api from "../../Auth/LoginLogic";
import saudiCities from "../../constants/saudiCities";
import { useTranslation } from "react-i18next";
import { isDoctorProfileComplete } from "../../utils/doctorVisibility.jsx";
import { getAcceptedClinicName } from "../../utils/clinicRequestHelpers";
import "./findDoctorPage.css";

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number.parseFloat(String(value).replace(/[^\d.]/g, "")); //remove anything except digits and dot, e.g, "180 SAR" -> "180"
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const getAvailableDays = (doctor) => {
  const possibleDays =
    doctor.available_days ?? doctor.availableDays ?? doctor.availability ?? [];

  if (!Array.isArray(possibleDays)) {
    return [];
  }

  return possibleDays //hhhhh
    .map((day) =>
      typeof day === "string"
        ? day
        : (day?.day ?? day?.weekday ?? day?.name ?? day?.label),
    )
    .filter(Boolean)
    .slice(0, 4);
};

const mapDoctorForView = (doctor) => ({
  detailsId: doctor.user?.id ?? doctor.id,
  firstname: doctor.user?.first_name ?? "",
  lastname: doctor.user?.last_name ?? "",
  gender: doctor.gender ?? doctor.user?.gender ?? "",
  specialization: doctor.specialization ?? "",
  experience: toNumber(doctor.years_of_experience),
  price: toNumber(doctor.price),
  rating: toNumber(doctor.rating ?? doctor.user?.rating),
  city: String(doctor.city ?? "").trim(),
  // This reads clinic data only when the backend already exposes an accepted clinic link.
  clinicName: getAcceptedClinicName(doctor),
  availableDays: getAvailableDays(doctor),
});

export default function Doctors() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedMinRating, setSelectedMinRating] = useState("all");
  const [selectedMaxPrice, setSelectedMaxPrice] = useState("all");

  const getAllDoctors = async () => {
    try {
      const response = await api.get("/doctors/");
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:  ", error);
    }
  };

  useEffect(() => {
    getAllDoctors();
  }, []);

  const preparedDoctors = useMemo(
    () =>
      // This removes incomplete doctor profiles before any public doctor list is rendered.
      doctors
        .filter((doctor) => isDoctorProfileComplete(doctor))
        // This keeps one normalized view object so the render and filters stay simple.
        .map((doctor) => ({ ...doctor, view: mapDoctorForView(doctor) })),
    [doctors],
  );

  const priceOptions = useMemo(
    //price options, create a new filter with unique price values.
    () =>
      [
        ...new Set(
          preparedDoctors
            .map((doctor) => doctor.view.price)
            .filter(Number.isFinite), // remove duplicated  and non-numeric values
        ),
      ].sort((left, right) => left - right), //sort prices in ascending order
    [preparedDoctors], //recalculate only when preparedDoctors changes
  );

  const filteredDoctors = useMemo(() => {
    //

    //normalizatrion code for filtering
    return preparedDoctors.filter((doctor) => {
      //return only doctors that match the filter criteria.
      const normalizedDoctorName = normalizeText(
        `${doctor.view.firstname} ${doctor.view.lastname}`, //uses view cuz it uses the cleaned and normalized values
      );

      const normalizedCity = normalizeText(doctor.view.city);

      const normalizedGender = normalizeText(doctor.view.gender);

      const passesName =
        normalizeText(searchName) === "" ||
        normalizedDoctorName.includes(normalizeText(searchName)); //ha -> will show doctors with similar letters
      const passesCity =
        selectedCity === "all" ||
        normalizedCity === normalizeText(selectedCity);
      const passesGender =
        selectedGender === "all" || normalizedGender === selectedGender;

      const passesPrice =
        selectedMaxPrice === "all"
          ? true
          : Number.isFinite(doctor.view.price) && //must be real number and less than or equal the selected price, e,g, 180 SAR then the doctor and any doctor with this price or less will be shown.
            doctor.view.price <= Number(selectedMaxPrice);

      const passesRating =
        selectedMinRating === "all"
          ? true
          : Number.isFinite(doctor.view.rating) &&
            doctor.view.rating >= Number(selectedMinRating);

      return (
        passesName && passesCity && passesGender && passesPrice && passesRating
      );
    });
  }, [
    //recalc only if those values change
    preparedDoctors,
    searchName,
    selectedCity,
    selectedGender,
    selectedMaxPrice,
    selectedMinRating,
  ]);

  const clearAllFilters = () => {
    //cleares all filters and show all doctors again
    setSearchName("");
    setSelectedCity("all");
    setSelectedGender("all");
    setSelectedMinRating("all");
    setSelectedMaxPrice("all");
  };

  return (
    <section className="find-doctors-page">
      <div className="find-doctors-shell">
        <header className="find-doctors-header">
          <div>
            <p className="find-doctors-label">{t("doctors.pageLabel")}</p>
            <h1>{t("doctors.pageTitle")}</h1>
            <p className="find-doctors-subtitle">{t("doctors.pageSubtitle")}</p>
          </div>
        </header>

        <section className="find-doctors-filters" aria-label="Doctor filters">
          <label className="filter-field filter-field-search">
            <span>{t("doctors.searchLabel")}</span>
            <input
              type="search"
              placeholder={t("doctors.searchPlaceholder")}
              value={searchName}
              onChange={(event) => setSearchName(event.target.value)}
            />
          </label>

          <label className="filter-field">
            <span>{t("doctors.city")}</span>
            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
            >
              <option value="all">{t("doctors.allCities")}</option>
              {saudiCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>{t("doctors.gender")}</span>
            <select
              value={selectedGender}
              onChange={(event) => setSelectedGender(event.target.value)}
            >
              <option value="all">{t("doctors.allGenders")}</option>
              <option value="male">{t("doctors.male")}</option>
              <option value="female">{t("doctors.female")}</option>
            </select>
          </label>

          <label className="filter-field">
            <span>{t("doctors.maxPrice")}</span>
            <select
              value={selectedMaxPrice}
              onChange={(event) => setSelectedMaxPrice(event.target.value)}
            >
              <option value="all">{t("doctors.allPrices")}</option>
              {priceOptions.map((price) => (
                <option key={price} value={price}>
                  {t("doctors.upToPrice", { price })}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>{t("doctors.minRating")}</span>
            <select
              value={selectedMinRating}
              onChange={(event) => setSelectedMinRating(event.target.value)}
            >
              <option value="all">{t("doctors.allRatings")}</option>
              <option value="3.5">{t("doctors.rating35")}</option>
              <option value="4">{t("doctors.rating4")}</option>
              <option value="4.5">{t("doctors.rating45")}</option>
              <option value="4.8">{t("doctors.rating48")}</option>
            </select>
          </label>

          <button
            type="button"
            className="clear-filters-button"
            onClick={clearAllFilters}
          >
            {t("doctors.clearAll")}
          </button>
        </section>

        <div className="find-doctors-results-bar">
          <p>{t("doctors.resultsFound", { count: filteredDoctors.length })}</p>
        </div>

        <div className="doctor-results-grid">
          {filteredDoctors.map((doctor) => (
            <DoctorCards
              key={doctor.id}
              firstname={doctor.view.firstname}
              lastname={doctor.view.lastname}
              gender={doctor.view.gender}
              specialization={doctor.view.specialization}
              experience={doctor.view.experience}
              price={doctor.view.price}
              rating={doctor.view.rating}
              city={doctor.view.city}
              clinicName={doctor.view.clinicName}
              availableDays={doctor.view.availableDays}
              detailsId={doctor.view.detailsId}
              id={doctor.id}
            />
          ))}
        </div>

        {preparedDoctors.length > 0 && filteredDoctors.length === 0 ? ( //there are doctors in the original prepared list , but after applying filters, there are no doctors left
          <div className="doctor-empty-state">
            <h2>{t("doctors.noMatchTitle")}</h2>
            <p>{t("doctors.noMatchBody")}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
