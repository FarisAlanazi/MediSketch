import "./../Profile_Style/profilePages.css";

const TABUK_CENTER = {
  latitude: 28.3838,
  longitude: 36.5662,
};

const LATITUDE_OFFSET = 0.12;
const LONGITUDE_OFFSET = 0.2;

const parseCoordinate = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const buildMapEmbedSrc = (latitude, longitude) => {
  const west = TABUK_CENTER.longitude - LONGITUDE_OFFSET;
  const south = TABUK_CENTER.latitude - LATITUDE_OFFSET;
  const east = TABUK_CENTER.longitude + LONGITUDE_OFFSET;
  const north = TABUK_CENTER.latitude + LATITUDE_OFFSET;
  const bbox = [west, south, east, north]
    .map((value) => value.toFixed(6))
    .join("%2C");

  const marker =
    latitude !== null && longitude !== null
      ? `&marker=${latitude.toFixed(6)}%2C${longitude.toFixed(6)}`
      : "";

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`;
};

function DoctorLocationPicker({ latitude, longitude, onLocationChange }) {
  const parsedLatitude = parseCoordinate(latitude);
  const parsedLongitude = parseCoordinate(longitude);

  const handleMapClick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const xRatio = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const yRatio = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);

    const west = TABUK_CENTER.longitude - LONGITUDE_OFFSET;
    const east = TABUK_CENTER.longitude + LONGITUDE_OFFSET;
    const north = TABUK_CENTER.latitude + LATITUDE_OFFSET;
    const south = TABUK_CENTER.latitude - LATITUDE_OFFSET;

    const nextLongitude = west + xRatio * (east - west);
    const nextLatitude = north - yRatio * (north - south);

    onLocationChange({
      latitude: nextLatitude.toFixed(6),
      longitude: nextLongitude.toFixed(6),
    });
  };

  return (
    <div className="profile-map-block">
      <div className="profile-map-shell" onClick={handleMapClick} role="presentation">
        <iframe
          title="Clinic location picker"
          src={buildMapEmbedSrc(parsedLatitude, parsedLongitude)}
          className="profile-map-frame"
          loading="lazy"
        />
        <div className="profile-map-overlay">
          <span>Click to place clinic pin</span>
        </div>
      </div>

      <p className="profile-map-note">
        The map stays focused on Tabuk. Click anywhere on the map to save the
        clinic pin.
      </p>

      {parsedLatitude !== null && parsedLongitude !== null ? (
        <p className="profile-map-coordinates">
          Selected coordinates: {parsedLatitude.toFixed(6)},{" "}
          {parsedLongitude.toFixed(6)}
        </p>
      ) : (
        <p className="profile-map-coordinates">
          No clinic pin selected yet.
        </p>
      )}
    </div>
  );
}

export default DoctorLocationPicker;
