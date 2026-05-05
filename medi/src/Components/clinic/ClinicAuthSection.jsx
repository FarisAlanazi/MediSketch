import { useEffect, useState } from "react";
import ClinicRegisterForm from "./ClinicRegisterForm";
import ClinicLoginForm from "./ClinicLoginForm";

const tabRowStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "0.75rem",
  marginBottom: "1.25rem",
  flexWrap: "wrap",
};

function ClinicAuthSection({ initialMode = "login", onLoginSuccess }) {
  //onLoginSuccess, the parent is ClinicPage.jsx
  const [mode, setMode] = useState(initialMode);
  const [suggestedUsername, setSuggestedUsername] = useState("");

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleRegisterSuccess = (username) => {
    setSuggestedUsername(username);
    setMode("login");
  };

  return (
    <section>
      <header style={{ marginBottom: "1rem", textAlign: "center" }}>
        <p style={{ color: "var(--grey-500)", marginBottom: "0.5rem" }}>
          Clinic access
        </p>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          {mode === "register" ? "Create clinic account" : "Sign in to clinic"}
        </h2>
        <span style={{ color: "var(--grey-500)", lineHeight: 1.6 }}>
          {mode === "register"
            ? "Set up a clinic account first."
            : "Use your clinic account to continue."}
        </span>
      </header>

      <div style={tabRowStyle}>
        <button
          type="button"
          className="btn"
          onClick={() => setMode("login")}
          style={{
            minWidth: "140px",
            opacity: mode === "login" ? 1 : 0.75,
            background:
              mode === "login" ? "var(--primary-500)" : "var(--grey-400)",
          }}
        >
          Login
        </button>

        <button
          type="button"
          className="btn"
          onClick={() => setMode("register")}
          style={{
            minWidth: "140px",
            opacity: mode === "register" ? 1 : 0.75,
            background:
              mode === "register" ? "var(--primary-500)" : "var(--grey-400)",
          }}
        >
          Register
        </button>
      </div>

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

export default ClinicAuthSection;
