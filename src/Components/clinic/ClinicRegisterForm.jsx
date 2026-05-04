// This imports local state for the clinic registration form.
import { useState } from "react";
// This imports shared toast feedback used across the frontend.
import { toast } from "react-toastify";
// This imports clinic API helpers and consistent error extraction.
import { getClinicErrorMessage, registerClinic } from "./clinicApi";

// This creates the initial clinic registration payload shape.
const createInitialClinicForm = () => ({
  username: "",
  password: "",
  email: "",
  phone_number: "",
  name: "",
  address: "",
  Health_Facility_License: "",
});

function ClinicRegisterForm({ onRegisterSuccess }) {
  const [clinicForm, setClinicForm] = useState(createInitialClinicForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setClinicForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!clinicForm.username || !clinicForm.password || !clinicForm.name) {
      setFormError("Username, password, and clinic name are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await registerClinic({
        username: clinicForm.username.trim(),
        password: clinicForm.password,
        email: clinicForm.email.trim(),
        phone_number: clinicForm.phone_number.trim(),
        name: clinicForm.name.trim(),
        address: clinicForm.address.trim(),
          user_type: "clinic",
      });
      toast.success("Clinic account created. Please log in.");
      setClinicForm(createInitialClinicForm());
      onRegisterSuccess(clinicForm.username.trim());
    } catch (error) {
      const errorMessage = getClinicErrorMessage(
        error,
        "Clinic registration failed.",
      );
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="form"
      style={{
        margin: 0,
        padding: "1.5rem 1.75rem",
        boxShadow: "var(--shadow-1)",
      }}
    >
      {formError ? (
        <p className="alert alert-danger" style={{ marginBottom: "1rem" }}>
          {formError}
        </p>
      ) : null}

      <label htmlFor="clinic-name" className="form-label">
        Clinic name
      </label>
      <input
        id="clinic-name"
        name="name"
        className="form-input form-row"
        type="text"
        value={clinicForm.name}
        onChange={handleChange}
        placeholder="City Care Clinic"
      />

      <label htmlFor="clinic-username" className="form-label">
        Username
      </label>
      <input
        id="clinic-username"
        name="username"
        className="form-input form-row"
        type="text"
        value={clinicForm.username}
        onChange={handleChange}
        placeholder="citycareclinic"
      />

      <label htmlFor="clinic-email" className="form-label">
        Email
      </label>
      <input
        id="clinic-email"
        name="email"
        className="form-input form-row"
        type="email"
        value={clinicForm.email}
        onChange={handleChange}
        placeholder="clinic@example.com"
      />

      <label htmlFor="clinic-phone" className="form-label">
        Phone number
      </label>
      <input
        id="clinic-phone"
        name="phone_number"
        className="form-input form-row"
        type="text"
        value={clinicForm.phone_number}
        onChange={handleChange}
        placeholder="+966500000000"
      />
      <label htmlFor="Health_Facility_License" className="form-label">
        HEALTH FACILITY LICENSE NUMBER
      </label>
      <input
        id="clinic-license"
        name="Health_Facility_License"
        className="form-input form-row"
        type="number"
        value={clinicForm.Health_Facility_License}
        onChange={handleChange}
        placeholder="45664982374"
      />

      <label htmlFor="clinic-address" className="form-label">
        Address
      </label>
      <input
        id="clinic-address"
        name="address"
        className="form-input form-row"
        type="text"
        value={clinicForm.address}
        onChange={handleChange}
        placeholder="Riyadh, King Fahd Road"
      />

      <label htmlFor="clinic-password" className="form-label">
        Password
      </label>
      <input
        id="clinic-password"
        name="password"
        className="form-input form-row"
        type="password"
        value={clinicForm.password}
        onChange={handleChange}
        placeholder="Enter a secure password"
      />

      <button type="submit" className="btn btn-block" disabled={isSubmitting}>
        {isSubmitting ? "Creating clinic..." : "Create clinic account"}
      </button>
    </form>
  );
}

// This exports the clinic registration form for the auth section.
export default ClinicRegisterForm;
