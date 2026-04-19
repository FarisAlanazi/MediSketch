import { useEffect, useRef } from "react"; // Import the basic hooks needed to create the Leaflet map after the component renders.
import { useNavigate } from "react-router-dom"; // Import navigation so clicking a marker opens the existing doctor details page.

const mapShellStyle = {
  width: "100%", // Let the map use the full available width inside the page shell.
  minHeight: "32rem", // Give the map enough height so markers are easy to see.
  border: "1px solid var(--borderColor)", // Add the same soft border style used in the rest of the project.
  borderRadius: "1.5rem", // Round the map corners so the component matches the current card style.
  overflow: "hidden", // Hide map overflow so tiles stay inside the rounded shell.
  boxShadow: "var(--shadowSoft)", // Reuse the current soft shadow so no extra visual system is added.
}; // Keep the shell style in one small object because this component does not need a separate CSS file.

const mapCanvasStyle = {
  width: "100%", // Let the inner map canvas fill the shell width.
  height: "32rem", // Match the visible map height to the shell height.
}; // Keep the canvas style separate so the rendered map area is easy to read.

const defaultCenter = [28.3838, 36.5662]; // Use Tabuk as the simple default center because the project already uses it for doctor locations.
const defaultZoom = 11; // Use one readable default zoom level so the map opens with a useful overview.

function Map({ doctors }) {
  const navigate = useNavigate(); // Create the navigation helper so markers can open the doctor details route.
  const mapElementRef = useRef(null); // Keep a reference to the HTML element that Leaflet should turn into a map.
  const mapInstanceRef = useRef(null); // Keep a reference to the Leaflet map instance so it is created only once.
  const markerRefs = useRef([]); // Keep a simple list of markers so old markers can be removed before drawing new ones.

  useEffect(() => {
    if (!window.L || !mapElementRef.current || mapInstanceRef.current) {
      return; // Stop early when Leaflet is not ready, the div is missing, or the map already exists.
    }

    const mapInstance = window.L.map(mapElementRef.current).setView(
      defaultCenter,
      defaultZoom,
    ); // Create the Leaflet map and center it on the default project city.

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance); // Add the OpenStreetMap tiles because they are the simplest public map source for this feature.

    mapInstanceRef.current = mapInstance; // Save the created map instance so later updates can reuse it.

    return () => {
      markerRefs.current.forEach((marker) => marker.remove()); // Remove any existing markers when the component unmounts.
      markerRefs.current = []; // Clear the marker list after removing the markers.
      mapInstance.remove(); // Destroy the Leaflet map instance during cleanup.
      mapInstanceRef.current = null; // Clear the saved map instance reference after cleanup.
    }; // Keep cleanup inside the same effect so the map lifecycle stays simple.
  }, []); // Create the map only once because the same map instance can be reused for all marker updates.

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) {
      return; // Stop early when the map instance or Leaflet library is not ready yet.
    }

    markerRefs.current.forEach((marker) => marker.remove()); // Remove the old markers before drawing the new doctor list.
    markerRefs.current = []; // Reset the marker list so only the latest markers stay tracked.

    if (!doctors.length) {
      mapInstanceRef.current.setView(defaultCenter, defaultZoom); // Reset the map view when there are no doctors to display.
      return; // Stop here because there are no markers to add.
    }

    const bounds = []; // Store the marker coordinates so the map can fit all markers after they are added.

    markerRefs.current = doctors.map((doctor) => {
      const marker = window.L.marker([doctor.latitude, doctor.longitude]).addTo(
        mapInstanceRef.current,
      ); // Create one marker for the current doctor and add it to the map.

      marker.bindTooltip(
        `${doctor.name} - ${doctor.specialization} - Rating: ${doctor.rating}`,
        { direction: "top", offset: [0, -12] }, //info direction , up ,center , down
      ); // Show one simple tooltip so the user still sees doctor info without adding an extra click step before navigation.

      marker.on("click", () => {
        navigate(`/DoctorDetails/${doctor.detailsId}`); // Reuse the current doctor details route when the user clicks a marker.
      }); // Keep the click behavior directly on the marker so the interaction is easy to follow.

      bounds.push([doctor.latitude, doctor.longitude]); // Save the doctor position so the final map view can include every marker.
      return marker; // Return the marker so it is stored for later cleanup.
    }); // Build the full marker list from the prepared doctors prop.

    if (bounds.length === 1) {
      mapInstanceRef.current.setView(bounds[0], defaultZoom); // Center directly on the single doctor when only one marker exists.
      return; // Stop here because fitting bounds is unnecessary for one marker.
    }

    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] }); // Fit the map around all markers so the user can see them immediately.
  }, [doctors, navigate]); // Redraw the markers only when the doctor list changes or navigation helper changes.

  return (
    <div style={mapShellStyle}>
      <div ref={mapElementRef} style={mapCanvasStyle} />
    </div>
  ); // Render one simple map shell and one inner div because Leaflet only needs a real DOM element to mount into.
}

export default Map; // Export the map component so the Discover Doctors on Map page can use it.
