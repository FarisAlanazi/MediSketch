// This imports the shared auth context for clinic auth state.
import { useAuth } from "../context/AuthContext";
// This imports the shared loading component for auth bootstrap states.
import Loading from "../Loading";
// This imports the clinic auth section for unauthenticated clinic access.
import ClinicAuthSection from "../Components/clinic/ClinicAuthSection";
// This imports the clinic dashboard for authenticated clinic users.
import ClinicDashboard from "../Components/clinic/ClinicDashboard";
// This imports the search-params helper for direct clinic register links.
import { useSearchParams } from "react-router-dom";

// This page shell keeps the clinic layout spacious and centered.
const pageShellStyle = {
  width: "min(860px, 92vw)",
  margin: "2.5rem auto 4rem",
  display: "grid",
  gap: "1.25rem",
};

// This warning card style keeps access-state messages consistent.
const warningCardStyle = {
  background: "var(--white)",
  borderRadius: "10px",
  boxShadow: "var(--shadow-1)",
  padding: "1.25rem",
  border: "1px solid var(--grey-200)",
};

// This page renders the clinic auth flow or clinic dashboard.
function Clinicpage() {
  // This reads the shared auth state already used across the app.
  const { loading, user, logout } = useAuth();
  // This reads the current clinic page query string for auth-mode routing.
  const [searchParams] = useSearchParams();
  // This checks whether the current authenticated account is a clinic.
  const isClinicUser = user?.user_type === "clinic";
  // This opens the clinic register form only when the query explicitly requests it.
  const initialAuthMode =
    searchParams.get("mode") === "register" ? "register" : "login";

  // This keeps the initial auth bootstrap aligned with the existing app pattern.
  if (loading) {
    return <Loading />;
  }

  return (
    // This wraps the full clinic page in a centered layout shell.
    <main style={pageShellStyle}>
      {/* This introduces the clinic page purpose clearly. */}
      <header style={{ textAlign: "center", display: "grid", gap: "0.5rem" }}>
        {/* This labels the clinic area before the main content. */}
        <p style={{ color: "var(--grey-500)" }}>
          Clinic portal
        </p>
        {/* This titles the clinic management page. */}
        <h1 style={{ fontSize: "2rem" }}>
          Clinic management
        </h1>
        {/* This explains what the clinic page allows the user to do. */}
        <span style={{ color: "var(--grey-500)", lineHeight: 1.6 }}>
          Register or log in as a clinic, then manage doctors and availability.
        </span>
      </header>

      {/* This shows the clinic dashboard only for authenticated clinic users. */}
      {isClinicUser ? (
        <ClinicDashboard />
      ) : user ? (
        <section style={warningCardStyle}>
          {/* This titles the access mismatch state. */}
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            Clinic account required
          </h2>
          {/* This explains why the current account cannot use the clinic dashboard. */}
          <p style={{ color: "var(--grey-600)", marginBottom: "1rem", lineHeight: 1.6 }}>
            The current session belongs to a {user.user_type} account. Please log out and sign in with a clinic account to continue.
          </p>
          {/* This provides a direct way to switch accounts cleanly. */}
          <button type="button" className="btn" onClick={logout}>
            Log out
          </button>
        </section>
      ) : (
        <ClinicAuthSection
          initialMode={initialAuthMode}
          onLoginSuccess={() => {}}
        />
      )}
    </main>
  );
}

// This exports the clinic page for the existing clinic route.
export default Clinicpage;
