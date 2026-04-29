// This imports local state for the add-doctor form.
import { useState } from "react";

// This component sends a clinic request to an existing doctor profile.
function ClinicDoctorAddForm({ onResolveDoctor, onSendRequest, isSubmitting }) {
  // This stores the doctor id used to resolve the doctor before sending the request.
  const [doctorId, setDoctorId] = useState("");
  // This stores a form-level validation error when needed.
  const [formError, setFormError] = useState("");
  // This stores the resolved doctor selected for the final confirmation popup.
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  // This controls when the local confirm popup is visible.
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  // This tracks the doctor lookup request before the popup opens.
  const [isResolvingDoctor, setIsResolvingDoctor] = useState(false);

  // This closes the popup and clears the temporary doctor selection.
  const handleCancelRequest = () => {
    // This hides the confirmation popup without sending any request.
    setIsConfirmPopupOpen(false);
    // This clears the selected doctor because the clinic cancelled the request action.
    setSelectedDoctor(null);
  };

  // This runs the real request action only after the clinic confirms the popup.
  const handleConfirmRequest = async () => {
    // This stops the submit when no resolved doctor exists anymore.
    if (!selectedDoctor?.id) {
      return;
    }

    // This submits the backend-supported clinic request after the clinic confirms the popup.
    const didSendRequest = await onSendRequest(selectedDoctor.id);

    // This resets the form only after a successful confirmed request.
    if (didSendRequest) {
      setDoctorId("");
      handleCancelRequest();
    }
  };

  // This resolves the doctor first so the popup can show the doctor's real name.
  const handleSubmit = async (event) => {
    // This keeps the form submission inside React instead of reloading the page.
    event.preventDefault();
    // This clears the previous local validation error.
    setFormError("");

    // This validates the doctor id before any lookup request is sent.
    if (!doctorId.trim()) {
      // This explains the required backend-supported lookup value.
      setFormError("Enter a doctor ID.");
      // This stops the request when local validation fails.
      return;
    }

    try {
      // This marks the doctor lookup as active until the popup has enough data to open.
      setIsResolvingDoctor(true);
      // This resolves the doctor from existing backend-supported endpoints.
      const resolvedDoctor = await onResolveDoctor(doctorId);
      // This stores the selected doctor so the popup can show the correct name.
      setSelectedDoctor(resolvedDoctor);
      // This opens the popup only after the doctor name is available.
      setIsConfirmPopupOpen(true);
    } catch (error) {
      // This shows a clear local error when the doctor lookup fails.
      setFormError(error?.message || "Unable to find that doctor.");
    } finally {
      // This ends the doctor lookup loading state after the request finishes.
      setIsResolvingDoctor(false);
    }
  };

  return (
    // This keeps the add-doctor form flat so it blends into the dashboard.
    <form onSubmit={handleSubmit}>
      {/* This labels the add-doctor form clearly. */}
      <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>
        Send doctor request
      </h2>

      {/* This explains the exact backend-supported add flow. */}
      <p style={{ color: "var(--grey-500)", marginBottom: "1rem", lineHeight: 1.6 }}>
        Enter the doctor ID, review the doctor name, then send the request.
      </p>

      {/* This shows the local validation error when one exists. */}
      {formError ? (
        <p className="alert alert-danger" style={{ marginBottom: "1rem" }}>
          {formError}
        </p>
      ) : null}

      {/* This renders the doctor id input field. */}
      <label htmlFor="clinic-doctor-id" className="form-label">
        Doctor ID
      </label>
      <input
        id="clinic-doctor-id"
        name="doctor_id"
        className="form-input form-row"
        type="text"
        value={doctorId}
        onChange={(event) => setDoctorId(event.target.value)}
        placeholder="Enter the doctor ID"
      />

      {/* This resolves the doctor before the final request confirmation popup opens. */}
      <button
        type="submit"
        className="btn"
        disabled={isSubmitting || isResolvingDoctor}
        style={{ minWidth: "160px" }}
      >
        {isResolvingDoctor
          ? "Checking doctor..."
          : isSubmitting
            ? "Sending request..."
            : "Review request"}
      </button>

      {/* This shows the final confirm/cancel popup before the request is sent. */}
      {isConfirmPopupOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 1000,
          }}
        >
          {/* This keeps the confirmation content simple and easy to scan. */}
          <div
            style={{
              width: "min(420px, 100%)",
              background: "var(--white)",
              borderRadius: "12px",
              padding: "1.25rem",
              border: "1px solid var(--grey-200)",
              boxShadow: "var(--shadow-1)",
            }}
          >
            {/* This titles the confirmation step clearly. */}
            <h3 style={{ marginBottom: "0.75rem", fontSize: "1.1rem" }}>
              Confirm clinic request
            </h3>
            {/* This shows the exact doctor name before the clinic confirms the request. */}
            <p style={{ marginBottom: "1rem", color: "var(--grey-700)", lineHeight: 1.6 }}>
              Send a clinic request to {selectedDoctor?.name}?
            </p>

            {/* This renders the simple confirm and cancel actions. */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn"
                onClick={handleConfirmRequest}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending request..." : "Confirm"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleCancelRequest}
                disabled={isSubmitting}
                style={{ background: "var(--grey-700)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}

// This exports the add-doctor form for the clinic dashboard.
export default ClinicDoctorAddForm;
