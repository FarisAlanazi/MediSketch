// This imports local state and effects for the clinic login form.
import { useEffect, useState } from "react";
// This imports shared toast feedback used across the frontend.
import { toast } from "react-toastify";
// This imports the shared auth context so clinic login updates app auth state.
import { useAuth } from "../../context/AuthContext";
// This imports the clinic API helpers for login and cleanup.
import {
  getClinicErrorMessage,
  loginClinic,
  logoutClinicSession,
} from "./clinicApi";

// This creates the initial clinic login field values.
const createInitialLoginForm = () => ({
  username: "",
  password: "",
});

// This component handles clinic login only.
function ClinicLoginForm({ initialUsername, onLoginSuccess }) {
  // This stores the clinic login form fields locally.
  const [loginForm, setLoginForm] = useState(createInitialLoginForm());
  // This tracks the submit state for the login button.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // This stores a form-level login error when one occurs.
  const [formError, setFormError] = useState("");
  // This exposes shared auth state setters from the existing context.
  const { setUser } = useAuth();

  // This pre-fills the login username after successful registration.
  useEffect(() => {
    // This updates only the username when a suggested username exists.
    if (initialUsername) {
      setLoginForm((currentForm) => ({
        ...currentForm,
        username: initialUsername,
      }));
    }
  }, [initialUsername]);

  // This updates the login field that changed.
  const handleChange = (event) => {
    // This reads the changed field name and value from the browser event.
    const { name, value } = event.target;
    // This updates only the changed login field.
    setLoginForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  // This validates and submits clinic login credentials.
  const handleSubmit = async (event) => {
    // This keeps the form submission inside React instead of reloading the page.
    event.preventDefault();
    // This clears the previous login error before validating again.
    setFormError("");

    // This blocks login when either credential field is empty.
    if (!loginForm.username || !loginForm.password) {
      // This shows a direct validation message beside the form.
      setFormError("Username and password are required.");
      // This stops the request when local validation fails.
      return;
    }

    try {
      // This disables repeat submissions while the request is running.
      setIsSubmitting(true);
      // This logs the user in through the shared backend session flow.
      const loginResponse = await loginClinic({
        username: loginForm.username.trim(),
        password: loginForm.password,
      });

      // This rejects non-clinic accounts even if the credentials are correct.
      if (loginResponse.user_type !== "clinic") {
        // This clears the just-created session to avoid role confusion.
        await logoutClinicSession();
        // This surfaces the role mismatch in a controlled way.
        throw new Error("This account is not registered as a clinic.");
      }

      // This mirrors the existing frontend auth session shape exactly.
      const savedUserSession = {
        username: loginResponse.username,
        user_type: loginResponse.user_type,
      };
      // This updates the shared auth context immediately after login.
      setUser(savedUserSession);
      // This persists the shared auth session exactly like the current login flow.
      sessionStorage.setItem("user", JSON.stringify(savedUserSession));
      // This confirms the clinic login succeeded.
      toast.success("Clinic logged in successfully.");
      // This notifies the parent that clinic authentication succeeded.
      onLoginSuccess(savedUserSession);
    } catch (error) {
      // This extracts the safest backend or local error message for the UI.
      const errorMessage = getClinicErrorMessage(
        error,
        error?.message || "Clinic login failed.",
      );
      // This stores the login error beside the form fields.
      setFormError(errorMessage);
      // This also shows the login failure as a toast.
      toast.error(errorMessage);
    } finally {
      // This re-enables the submit button after the request finishes.
      setIsSubmitting(false);
    }
  };

  return (
    // This uses the existing shared form class for consistent styling.
    <form
      onSubmit={handleSubmit}
      className="form"
      style={{ margin: 0, padding: "1.5rem 1.75rem", boxShadow: "var(--shadow-1)" }}
    >

      {/* This shows the current login error when one exists. */}
      {formError ? (
        <p className="alert alert-danger" style={{ marginBottom: "1rem" }}>
          {formError}
        </p>
      ) : null}

      {/* This renders the clinic username input. */}
      <label htmlFor="clinic-login-username" className="form-label">
        Username
      </label>
      <input
        id="clinic-login-username"
        name="username"
        className="form-input form-row"
        type="text"
        value={loginForm.username}
        onChange={handleChange}
        placeholder="clinic username"
      />

      {/* This renders the clinic password input. */}
      <label htmlFor="clinic-login-password" className="form-label">
        Password
      </label>
      <input
        id="clinic-login-password"
        name="password"
        className="form-input form-row"
        type="password"
        value={loginForm.password}
        onChange={handleChange}
        placeholder="clinic password"
      />

      {/* This submits the clinic login request. */}
      <button type="submit" className="btn btn-block" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in to clinic"}
      </button>
    </form>
  );
}

// This exports the clinic login form for the auth section.
export default ClinicLoginForm;
