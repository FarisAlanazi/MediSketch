import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const mapShellStyle = {
  width: "100%", // Let the map use the full available width inside the page shell.
  minHeight: "32rem", // Give the map enough height so markers are easy to see.
  border: "1px solid var(--borderColor)", // Add the same soft border style used in the rest of the project.
  borderRadius: "1.5rem", // Round the map corners so the component matches the current card style.
  overflow: "hidden", // Hide map overflow so tiles stay inside the rounded shell.
  boxShadow: "var(--shadowSoft)", // Reuse the current soft shadow so no extra visual system is added.
};

const mapCanvasStyle = {
  width: "100%", // Let the inner map canvas fill the shell width.
  height: "32rem", // Match the visible map height to the shell height.
};

const defaultCenter = [28.3838, 36.5662];
const defaultZoom = 11;

function Map({ doctors }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRefs = useRef([]);

  useEffect(() => {
    if (!window.L || !mapElementRef.current || mapInstanceRef.current) {
      return;
    }

    const mapInstance = window.L.map(mapElementRef.current).setView(
      defaultCenter,
      defaultZoom,
    );

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);

    mapInstanceRef.current = mapInstance;

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      mapInstance.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) {
      return;
    }

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    if (!doctors.length) {
      mapInstanceRef.current.setView(defaultCenter, defaultZoom);
      return;
    }

    const bounds = [];

    markerRefs.current = doctors.map((doctor) => {
      const marker = window.L.marker([doctor.latitude, doctor.longitude]).addTo(
        mapInstanceRef.current,
      );

      marker.bindTooltip(
        `${doctor.name} - ${doctor.specialization} - ${t("map.ratingLabel")}: ${doctor.rating}`,
        { direction: "top", offset: [0, -12] },
      );

      marker.on("click", () => {
        navigate(`/DoctorDetails/${doctor.detailsId}`);
      });

      bounds.push([doctor.latitude, doctor.longitude]);
      return marker;
    });

    if (bounds.length === 1) {
      mapInstanceRef.current.setView(bounds[0], defaultZoom);
      return;
    }

    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  }, [doctors, navigate, t]);

  return (
    <div style={mapShellStyle}>
      <div ref={mapElementRef} style={mapCanvasStyle} />
    </div>
  );
}

export default Map;
