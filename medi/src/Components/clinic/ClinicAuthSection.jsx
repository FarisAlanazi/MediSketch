// This imports React state for auth-mode switching.
import { useEffect, useState } from "react";
// This imports the clinic registration form for clinic signup.
import ClinicRegisterForm from "./ClinicRegisterForm";
// This imports the clinic login form for clinic sign-in.
import ClinicLoginForm from "./ClinicLoginForm";

// This tab row style keeps the auth mode switch clear and compact.
const tabRowStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "0.75rem",
  marginBottom: "1.25rem",
  flexWrap: "wrap",
};

// This component switches between clinic registration and clinic login views.
function ClinicAuthSection({ initialMode = "login", onLoginSuccess }) {
  // This keeps track of which auth view the clinic page should show.
  const [mode, setMode] = useState(initialMode);
  // This remembers the newest registered username for the login form.
  const [suggestedUsername, setSuggestedUsername] = useState("");

  // This keeps the rendered auth tab aligned with the requested entry mode.
  useEffect(() => {
    // This switches the visible auth form when the parent mode changes.
    setMode(initialMode);
  }, [initialMode]);

  // This switches the view from registration back to login after success.
  const handleRegisterSuccess = (username) => {
    // This keeps the new clinic username ready inside the login form.
    setSuggestedUsername(username);
    // This moves the clinic flow to the login step after registration.
    setMode("login");
  };

  return (
    // This keeps the auth area simple and centered without extra card nesting.
    <section>
      {/* This introduces the clinic auth area clearly. */}
      <header style={{ marginBottom: "1rem", textAlign: "center" }}>
        {/* This labels the clinic workspace purpose. */}
        <p style={{ color: "var(--grey-500)", marginBottom: "0.5rem" }}>
          Clinic access
        </p>
        {/* This titles the clinic authentication area. */}
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          {mode === "register" ? "Create clinic account" : "Sign in to clinic"}
        </h2>
        {/* This explains the active clinic auth step briefly. */}
        <span style={{ color: "var(--grey-500)", lineHeight: 1.6 }}>
          {mode === "register"
            ? "Set up a clinic account first."
            : "Use your clinic account to continue."}
        </span>
      </header>

      {/* This renders the clinic auth mode toggle buttons. */}
      <div style={tabRowStyle}>
        {/* This activates the clinic login form. */}
        <button
          type="button"
          className="btn"
          onClick={() => setMode("login")}
          style={{
            minWidth: "140px",
            opacity: mode === "login" ? 1 : 0.75,
            background: mode === "login" ? "var(--primary-500)" : "var(--grey-400)",
          }}
        >
          Login
        </button>

        {/* This activates the clinic registration form. */}
        <button
          type="button"
          className="btn"
          onClick={() => setMode("register")}
          style={{
            minWidth: "140px",
            opacity: mode === "register" ? 1 : 0.75,
            background: mode === "register" ? "var(--primary-500)" : "var(--grey-400)",
          }}
        >
          Register
        </button>
      </div>

      {/* This renders the active clinic auth form only. */}
      {mode === "register" ? (
        <ClinicRegisterForm onRegisterSuccess={handleRegisterSuccess} />
      ) : (
        <ClinicLoginForm
          initialUsername={suggestedUsername}
          onLoginSuccess={onLoginSuccess}
        />
      )}
    </section>
  );
}

// This exports the clinic auth switcher for the clinic page.
export default ClinicAuthSection;
