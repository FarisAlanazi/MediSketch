import { useEffect, useMemo, useState } from "react";
import DoctorCards from "./DoctorCards";
import api from "../../Auth/LoginLogic";
import "./findDoctorPage.css";

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number.parseFloat(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const getClinicLabel = (doctor) => {
  const clinicValue =
    doctor.clinic ??
    doctor.location ??
    doctor.address ??
    doctor.user?.address ??
    "";

  if (typeof clinicValue === "string") {
    return clinicValue.trim();
  }

  return (
    clinicValue?.name ?? clinicValue?.address ?? clinicValue?.location ?? ""
  );
};

const getAvailableDays = (doctor) => {
  const possibleDays =
    doctor.available_days ?? doctor.availableDays ?? doctor.availability ?? [];

  if (!Array.isArray(possibleDays)) {
    return [];
  }

  return possibleDays
    .map((day) =>
      typeof day === "string"
        ? day
        : day?.day ?? day?.weekday ?? day?.name ?? day?.label,
    )
    .filter(Boolean)
    .slice(0, 4);
};

const mapDoctorForView = (doctor) => ({
  id: doctor.id,
  detailsId: doctor.user?.id ?? doctor.id,
  firstname: doctor.user?.first_name ?? "",
  lastname: doctor.user?.last_name ?? "",
  gender:
    doctor.gender ?? doctor.user?.gender ?? doctor.sex ?? doctor.user?.sex,
  specialization: doctor.specialization ?? doctor.special ?? "",
  experience: toNumber(doctor.years_of_experience ?? doctor.experience),
  price: toNumber(doctor.price ?? doctor.consultation_fee ?? doctor.fee),
  rating: toNumber(
    doctor.rating ??
      doctor.average_rating ??
      doctor.avg_rating ??
      doctor.review_rating ??
      doctor.user?.rating,
  ),
  city: String(doctor.city ?? "").trim(), // Read the simple city value from the backend so the page does not need to rebuild it.
  clinic: getClinicLabel(doctor),
  availableDays: getAvailableDays(doctor),
});

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [selectedCity, setSelectedCity] = useState("all"); // Store the chosen city so it can be combined with the current filters.
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedMinRating, setSelectedMinRating] = useState("all");
  const [selectedMaxPrice, setSelectedMaxPrice] = useState("all");

  const getAllDoctors = async () => {
    try {
      const response = await api.get("/doctors/");
      setDoctors(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    getAllDoctors();
  }, []);

  const preparedDoctors = useMemo(
    () =>
      doctors.map((doctor) => ({ ...doctor, view: mapDoctorForView(doctor) })),
    [doctors],
  );

  const priceOptions = useMemo(
    () =>
      [
        ...new Set(
          preparedDoctors
            .map((doctor) => doctor.view.price)
            .filter(Number.isFinite),
        ),
      ].sort((left, right) => left - right),
    [preparedDoctors],
  );
  const cityOptions = useMemo(
    () =>
      [...new Set(preparedDoctors.map((doctor) => doctor.view.city).filter(Boolean))].sort(
        (left, right) => left.localeCompare(right),
      ), // Build one clean city list from the fetched doctors so the dropdown stays simple.
    [preparedDoctors],
  );

  const filteredDoctors = useMemo(() => {
    return preparedDoctors.filter((doctor) => {
      const normalizedCity = normalizeText(doctor.view.city); // Normalize the city text so dropdown matching stays simple.
      const normalizedGender = normalizeText(doctor.view.gender);
      const passesCity =
        selectedCity === "all" || normalizedCity === selectedCity; // Allow all cities by default, or match the selected city.
      const passesGender =
        selectedGender === "all" || normalizedGender === selectedGender;

      const passesPrice =
        selectedMaxPrice === "all"
          ? true
          : Number.isFinite(doctor.view.price) &&
            doctor.view.price <= Number(selectedMaxPrice);

      const passesRating =
        selectedMinRating === "all"
          ? true
          : Number.isFinite(doctor.view.rating) &&
            doctor.view.rating >= Number(selectedMinRating);

      return passesCity && passesGender && passesPrice && passesRating;
    });
  }, [
    preparedDoctors,
    selectedCity,
    selectedGender,
    selectedMaxPrice,
    selectedMinRating,
  ]);

  const clearAllFilters = () => {
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
            <p className="find-doctors-label">Find Doctors</p>
            <h1>Browse specialists with clear, simple filters</h1>
            <p className="find-doctors-subtitle">
              Refine the list by consultation fee, rating, and gender while
              keeping the experience light and easy to scan.
            </p>
          </div>
        </header>

        <section className="find-doctors-filters" aria-label="Doctor filters">
          <label className="filter-field filter-field-search">
            <span>Symptom</span>
            <input type="search" placeholder="Search by symptom" />
          </label>

          <label className="filter-field">
            <span>City</span>
            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
            >
              <option value="all">All Cities</option>
              {cityOptions.map((city) => (
                <option key={city} value={normalizeText(city)}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Gender</span>
            <select
              value={selectedGender}
              onChange={(event) => setSelectedGender(event.target.value)}
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Max Price</span>
            <select
              value={selectedMaxPrice}
              onChange={(event) => setSelectedMaxPrice(event.target.value)}
            >
              <option value="all">All Prices</option>
              {priceOptions.map((price) => (
                <option key={price} value={price}>
                  Up to ${price}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Min Rating</span>
            <select
              value={selectedMinRating}
              onChange={(event) => setSelectedMinRating(event.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
              <option value="4.8">4.8+</option>
            </select>
          </label>

          <button
            type="button"
            className="clear-filters-button"
            onClick={clearAllFilters}
          >
            Clear all filters
          </button>
        </section>

        <div className="find-doctors-results-bar">
          <p>{filteredDoctors.length} results found</p>
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
              clinic={doctor.view.clinic}
              availableDays={doctor.view.availableDays}
              detailsId={doctor.view.detailsId}
              id={doctor.id}
            />
          ))}
        </div>

        {preparedDoctors.length > 0 && filteredDoctors.length === 0 ? (
          <div className="doctor-empty-state">
            <h2>No doctors match the current filters.</h2>
            <p>Try clearing one or more filters to see more specialists.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
