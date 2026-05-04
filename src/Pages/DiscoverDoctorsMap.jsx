import { useEffect, useMemo, useState } from "react";
import api from "../Auth/LoginLogic";
import Map from "../Components/Map/Map";
import { useTranslation } from "react-i18next";

const pageCardStyle = {
  width: "100%",
  padding: "1rem 0 0",
};

const parseCoordinate = (value) => {
  const parsedValue = Number(value); // Convert the incoming latitude or longitude into a number so the map can use it.
  return Number.isFinite(parsedValue) ? parsedValue : null; // Return a valid number when possible, or null when the value is missing.
};

function DiscoverDoctorsMap() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDoctors = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await api.get("/doctors/");

        if (!isMounted) {
          return;
        }

        setDoctors(Array.isArray(response.data) ? response.data : []);
      } catch {
        if (!isMounted) {
          return;
        }

        setDoctors([]);
        setLoadError(t("map.loadError"));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDoctors();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const mappedDoctors = useMemo(
    () =>
      doctors
        .map((doctor) => ({
          id: doctor.id,
          detailsId: doctor.user?.id ?? doctor.id,
          name:
            `${doctor?.user?.first_name ?? ""} ${doctor?.user?.last_name ?? ""}`.trim() ||
            t("map.profileFallback"),
          specialization:
            doctor.specialization || t("map.specializationFallback"),
          rating: doctor.rating ?? t("doctors.noRatings"),
          latitude: parseCoordinate(doctor.latitude ?? doctor.lititude),
          longitude: parseCoordinate(doctor.longitude ?? doctor.langitude),
        }))
        .filter(
          (doctor) =>
            Number.isFinite(doctor.latitude) && Number.isFinite(doctor.longitude),
        ),
    [doctors, t],
  );

  if (isLoading) {
    return (
      <section className="find-doctors-page">
        <div className="find-doctors-shell">
          <div className="doctor-empty-state">{t("map.loading")}</div>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="find-doctors-page">
        <div className="find-doctors-shell">
          <div className="doctor-empty-state">{loadError}</div>
        </div>
      </section>
    ); // Reuse the same simple empty-state card when the request fails.
  }

  return (
    <section className="find-doctors-page">
      <div className="find-doctors-shell">
        <header className="find-doctors-header">
          <div>
            <p className="find-doctors-label">{t("map.label")}</p>
            <h1>{t("map.title")}</h1>
            <p className="find-doctors-subtitle">{t("map.subtitle")}</p>
          </div>
        </header>

        <div className="find-doctors-results-bar">
          <p>{t("map.results", { count: mappedDoctors.length })}</p>
        </div>

        <div style={pageCardStyle}>
          <Map doctors={mappedDoctors} />
        </div>

        {!mappedDoctors.length ? (
          <div className="doctor-empty-state">
            <h2>{t("map.emptyTitle")}</h2>
            <p>{t("map.emptyBody")}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default DiscoverDoctorsMap;
