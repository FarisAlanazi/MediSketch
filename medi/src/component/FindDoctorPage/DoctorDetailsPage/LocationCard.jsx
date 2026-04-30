import "./detailsStyles/styles.css";
import { useTranslation } from "react-i18next";

const TABUK_CENTER = {
  latitude: 28.3838,
  longitude: 36.5662,
};

const parseCoordinate = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number.parseFloat(String(value).replace(/[^\d.-]/g, "")); // regex  to remove non-numeric values.
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const buildMapEmbedSrc = (latitude, longitude) => {
  const longitudeOffset = 0.2;
  const latitudeOffset = 0.12;
  const bbox = [
    TABUK_CENTER.longitude - longitudeOffset,
    TABUK_CENTER.latitude - latitudeOffset,
    TABUK_CENTER.longitude + longitudeOffset,
    TABUK_CENTER.latitude + latitudeOffset,
  ]
    .map((value) => value.toFixed(6))
    .join("%2C");

  const marker =
    latitude !== null && longitude !== null
      ? `&marker=${latitude.toFixed(6)}%2C${longitude.toFixed(6)}`
      : "";

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`;
};

function LocationCard({ doctorName, locationLabel, latitude, longitude }) {
  const { t } = useTranslation();
  const parsedLatitude = parseCoordinate(latitude);
  const parsedLongitude = parseCoordinate(longitude);
  const hasExactLocation =
    parsedLatitude !== null &&
    parsedLongitude !== null &&
    Math.abs(parsedLatitude) <= 90 &&
    Math.abs(parsedLongitude) <= 180;

  return (
    <section className="details-card map-card">
      <div className="details-section-heading">
        <div>
          <p className="details-card-label">{t("doctorDetails.location")}</p>
          <h2>{t("doctorDetails.locationTitle")}</h2>
        </div>
        <p className="map-location-text">{locationLabel}</p>
      </div>

      <div className="map-frame-shell">
        <iframe
          title={t("locationCard.iframeTitle", { name: doctorName })}
          src={buildMapEmbedSrc(
            hasExactLocation ? parsedLatitude : null,
            hasExactLocation ? parsedLongitude : null,
          )}
          className="doctor-map-frame"
          loading="lazy"
        />
      </div>

      <p className="map-note">
        {hasExactLocation
          ? t("locationCard.exact")
          : t("locationCard.fallback")}
      </p>
    </section>
  );
}

export default LocationCard;
