import { useState } from "react";
import "./../Profile_Style/profilePages.css";

const TABUK_CENTER = {
  //center point of the map .. the map will be focused on this center
  latitude: 28.3838,
  longitude: 36.5662,
};

const LATITUDE_OFFSET = 0.12; // the area seen on the map "not just tabuk but also the surronding areas" north and south of the center
const LONGITUDE_OFFSET = 0.2; //east and west of the center

const parseCoordinate = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const buildMapEmbedSrc = (
  latitude,
  longitude,
  latitudeOffset,
  longitudeOffset,
) => {
  const west = TABUK_CENTER.longitude - longitudeOffset; //move it to the west by
  const south = TABUK_CENTER.latitude - latitudeOffset; //move it downward by
  const east = TABUK_CENTER.longitude + longitudeOffset; //move it to the right by
  const north = TABUK_CENTER.latitude + latitudeOffset; //move it upward by

  // bbox is the area that the map will show

  const bbox = [west, south, east, north] //create an array of the four boundries
    .map((value) => value.toFixed(6)) //means if the value is 23.3 then will be 23.300000
    .join("%2C"); //the vlalue will be as like that 23.300000%2C36.500000%2C23.500000%2C36.700000 (west,south,east,north)
  //why ? openstreetmap need the value to be like this in order to deal with it.
  console.log(bbox); //see the console

  const marker =
    latitude !== null && longitude !== null
      ? `&marker=${latitude.toFixed(6)}%2C${longitude.toFixed(6)}`
      : "";

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`;
};

function DoctorLocationPicker({ latitude, longitude, onLocationChange }) {
  //onLocationChange is a func in doctor profile that change the longitude and latitude in the doctor profile state when the doctor click on the map to save the location
  const parsedLatitude = parseCoordinate(latitude);
  const parsedLongitude = parseCoordinate(longitude);
  const [zoomScale, setZoomScale] = useState(1); //keep the current map zoom level while preserving the existing click-to-place picker.
  const latitudeOffset = LATITUDE_OFFSET / zoomScale; //shrink the visible north/south area as the doctor zooms in.
  const longitudeOffset = LONGITUDE_OFFSET / zoomScale; //shrink the visible east/west area as the doctor zooms in.

  const handleMapWheel = (event) => {
    event.preventDefault(); //keep the wheel focused on zooming the map area instead of scrolling the page.
    setZoomScale((currentZoomScale) =>
      clamp(
        event.deltaY < 0 ? currentZoomScale * 1.2 : currentZoomScale / 1.2,
        0.8,
        8,
      ),
    );
  };

  const handleZoomButtonClick = (event, zoomMultiplier) => {
    event.preventDefault(); //keep the zoom buttons from triggering the browser default button behavior.
    event.stopPropagation(); //prevent the map click handler from placing a marker when the doctor uses the zoom controls.
    setZoomScale((currentZoomScale) =>
      clamp(currentZoomScale * zoomMultiplier, 0.8, 8),
    );
  };

  const handleMapClick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect(); //to  limit the click based on the map view or container and not the whole page.
    const xRatio = clamp((event.clientX - bounds.left) / bounds.width, 0, 1); // how far the click is from  the left side
    const yRatio = clamp((event.clientY - bounds.top) / bounds.height, 0, 1); // how far the click is from the top side

    const west = TABUK_CENTER.longitude - longitudeOffset;
    const east = TABUK_CENTER.longitude + longitudeOffset;
    const north = TABUK_CENTER.latitude + latitudeOffset;
    const south = TABUK_CENTER.latitude - latitudeOffset;

    const nextLongitude = west + xRatio * (east - west);
    console.log("Long : ", nextLongitude); //36.53573271028038 and then will be normalized into : 36.535732

    const nextLatitude = north - yRatio * (north - south);
    console.log("Lit : ", nextLatitude); //28.402771893491124 and then will be normalized into : 28.402772

    onLocationChange({
      latitude: nextLatitude.toFixed(6),
      longitude: nextLongitude.toFixed(6),
    });
  };

  return (
    <div className="profile-map-block">
      <div
        className="profile-map-shell"
        onClick={handleMapClick}
        onWheel={handleMapWheel}
        role="presentation"
      >
        <iframe //accepts src , which is specifies in buildMapEmbedSrc func.
          title="Clinic location picker"
          src={buildMapEmbedSrc(
            parsedLatitude,
            parsedLongitude,
            latitudeOffset,
            longitudeOffset,
          )}
          className="profile-map-frame"
          loading="lazy" //improve performance by loading the map only when it is needed (when the component is rendered) and not before.
        />
        <div className="profile-map-overlay">
          <span>Click to place clinic pin</span>
          <div className="profile-map-controls">
            <button
              type="button"
              className="profile-map-zoom-button"
              onClick={(event) => handleZoomButtonClick(event, 1.2)}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="profile-map-zoom-button"
              onClick={(event) => handleZoomButtonClick(event, 1 / 1.2)}
              aria-label="Zoom out"
            >
              -
            </button>
          </div>
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
        <p className="profile-map-coordinates">No clinic pin selected yet.</p>
      )}
    </div>
  );
}

export default DoctorLocationPicker;
