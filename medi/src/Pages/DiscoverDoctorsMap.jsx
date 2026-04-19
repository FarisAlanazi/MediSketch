import { useEffect, useMemo, useState } from "react"; // Import the basic hooks needed to load doctors once and prepare simple map data.
import api from "../Auth/LoginLogic"; // Import the shared API helper so this page uses the existing backend connection.
import Map from "../Components/Map/Map"; // Import the new map component so almost all map logic stays in one place.

const pageCardStyle = {
  width: "100%",
  padding: "1rem 0 0",
}; // Keep the page wrapper style small and local so no extra stylesheet is needed.

const parseCoordinate = (value) => {
  const parsedValue = Number(value); // Convert the incoming latitude or longitude into a number so the map can use it.
  return Number.isFinite(parsedValue) ? parsedValue : null; // Return a valid number when possible, or null when the value is missing.
}; // Keep the coordinate conversion as one tiny helper because both latitude and longitude need the same check.

function DiscoverDoctorsMap() {
  const [doctors, setDoctors] = useState([]); // Store the full doctor list so the page can build the map markers from it.
  const [isLoading, setIsLoading] = useState(true); // Track the loading state so the page can show a simple status message.
  const [loadError, setLoadError] = useState(""); // Track loading errors so the page can show one small fallback message.

  useEffect(() => {
    let isMounted = true; // Track whether the page is still mounted before updating state after the request finishes.

    const loadDoctors = async () => {
      setIsLoading(true); // Start the loading state before requesting doctors.
      setLoadError(""); // Clear any old error message before the new request starts.

      try {
        const response = await api.get("/doctors/"); // Load the existing doctors endpoint because it already supplies the data needed by the map.

        if (!isMounted) {
          return; // Stop here when the page has already unmounted so React state is not updated after cleanup.
        }

        setDoctors(Array.isArray(response.data) ? response.data : []); // Save the doctor list only when the response is a normal array.
      } catch {
        if (!isMounted) {
          return; // Stop here when the page is gone because there is no visible state left to update.
        }

        setDoctors([]); // Clear the doctor list when the request fails so the map does not try to render stale data.
        setLoadError("Unable to load doctors on the map right now."); // Show one small readable error message instead of failing silently.
      } finally {
        if (isMounted) {
          setIsLoading(false); // End the loading state only while the page is still mounted.
        }
      }
    }; // Keep the request logic inside one local async function so the effect stays easy to read.

    loadDoctors(); // Run the doctor request as soon as the page opens.

    return () => {
      isMounted = false; // Mark the page as unmounted so late responses do not update state.
    };
  }, []); // Load the doctors only once because this page only needs an initial list.

  const mappedDoctors = useMemo(
    () =>
      doctors
        .map((doctor) => ({
          id: doctor.id, // Keep the doctor id because React list rendering still needs a stable key.
          detailsId: doctor.user?.id ?? doctor.id, // Reuse the existing doctor details route key so marker clicks open the correct profile.
          name: `${doctor?.user?.first_name ?? ""} ${doctor?.user?.last_name ?? ""}`.trim() || "Doctor profile", // Build one simple display name for the marker.
          specialization: doctor.specialization || "General care", // Show the current specialization when it exists, or a small fallback label.
          rating: doctor.rating ?? "No ratings yet", // Reuse the backend rating field so the popup shows the same rating source as the list page.
          latitude: parseCoordinate(doctor.latitude ?? doctor.lititude), // Read latitude from the existing doctor location fields.
          longitude: parseCoordinate(doctor.longitude ?? doctor.langitude), // Read longitude from the existing doctor location fields.
        }))
        .filter(
          (doctor) =>
            Number.isFinite(doctor.latitude) && Number.isFinite(doctor.longitude),
        ), // Keep only doctors with usable coordinates because the map needs real positions for markers.
    [doctors],
  ); // Rebuild the marker data only when the doctor list changes.

  if (isLoading) {
    return (
      <section className="find-doctors-page">
        <div className="find-doctors-shell">
          <div className="doctor-empty-state">Loading doctors on the map...</div>
        </div>
      </section>
    ); // Reuse the current doctor page styles so the loading state stays visually consistent.
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
            <p className="find-doctors-label">Discover Doctors</p>
            <h1>Discover Doctors on Map</h1>
            <p className="find-doctors-subtitle">
              Browse doctors on the map and open any doctor profile by clicking
              its marker.
            </p>
          </div>
        </header>

        <div className="find-doctors-results-bar">
          <p>{mappedDoctors.length} doctors with saved map locations</p>
        </div>

        <div style={pageCardStyle}>
          <Map doctors={mappedDoctors} />
        </div>

        {!mappedDoctors.length ? (
          <div className="doctor-empty-state">
            <h2>No doctor locations are available yet.</h2>
            <p>Doctors appear here after saving their clinic location.</p>
          </div>
        ) : null}
      </div>
    </section>
  ); // Reuse the current doctor page shell so the new page stays close to the existing style.
}

export default DiscoverDoctorsMap; // Export the page so the router can render it in place of the old How it works page.
