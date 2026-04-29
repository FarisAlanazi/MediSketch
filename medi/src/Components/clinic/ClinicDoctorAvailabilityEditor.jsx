// This imports effect and state for the availability editor form.
import { useEffect, useState } from "react";

// This normalizes backend time strings for the native time input.
const normalizeTimeValue = (timeValue) => String(timeValue ?? "").slice(0, 5);

// This component edits availability using the exact backend slot structure.
function ClinicDoctorAvailabilityEditor({
  doctor,
  onSaveAvailability,
  isSaving,
}) {
  // This stores the currently selected slot id when editing an existing slot.
  const [selectedSlotId, setSelectedSlotId] = useState("");
  // This stores the current date field for create or edit actions.
  const [date, setDate] = useState("");
  // This stores the current time field for create or edit actions.
  const [time, setTime] = useState("");
  // This stores the slot status using browser-friendly string values.
  const [status, setStatus] = useState("true");
  // This stores a form-level validation error when one occurs.
  const [formError, setFormError] = useState("");

  // This repopulates the form whenever the selected slot changes.
  useEffect(() => {
    // This loads the selected slot from the clinic doctor payload.
    const selectedSlot = doctor.available_slots?.find(
      (slot) => String(slot.id) === String(selectedSlotId),
    );

    // This resets the form to create mode when no slot is selected.
    if (!selectedSlot) {
      setDate("");
      setTime("");
      setStatus("true");
      return;
    }

    // This fills the date field from the selected backend slot.
    setDate(selectedSlot.date || "");
    // This fills the time field from the selected backend slot.
    setTime(normalizeTimeValue(selectedSlot.time));
    // This fills the status field from the selected backend slot.
    setStatus(String(Boolean(selectedSlot.status)));
  }, [doctor.available_slots, selectedSlotId]);

  // This validates and submits the backend-shaped availability payload.
  const handleSubmit = async (event) => {
    // This keeps the form submission inside React instead of reloading the page.
    event.preventDefault();
    // This clears the previous editor error before validating again.
    setFormError("");

    // This blocks submission when the backend-required fields are missing.
    if (!date || !time) {
      // This explains the exact fields required by the backend.
      setFormError("Date and time are required.");
      // This stops the save request when local validation fails.
      return;
    }

    // This sends either a create or update payload to the parent action.
    const didSaveAvailability = await onSaveAvailability(doctor.id, {
      slot_id: selectedSlotId ? Number(selectedSlotId) : null,
      date,
      time,
      status: status === "true",
    });

    // This resets the form after a successful create or update.
    if (didSaveAvailability) {
      setSelectedSlotId("");
      setDate("");
      setTime("");
      setStatus("true");
    }
  };

  return (
    // This keeps the availability editor simple and inline.
    <section
      style={{
        marginTop: "0.9rem",
        paddingTop: "0.9rem",
        border: "1px solid var(--grey-200)",
        borderRadius: "8px",
        background: "transparent",
      }}
    >
      {/* This introduces the availability editor clearly. */}
      <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", paddingLeft: "0.9rem" }}>
        Availability
      </h3>

      {/* This lists the current slots before the edit form. */}
      <div style={{ marginBottom: "0.75rem", paddingInline: "0.9rem" }}>
        {/* This labels the current doctor slot list. */}
        <p style={{ marginBottom: "0.5rem", color: "var(--grey-600)" }}>
          Current slots
        </p>

        {/* This renders an empty state when the doctor has no slots yet. */}
        {!doctor.available_slots?.length ? (
          <p style={{ color: "var(--grey-500)" }}>No availability slots yet.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {doctor.available_slots.map((slot) => (
              <span
                key={slot.id}
                style={{
                  padding: "0.3rem 0.55rem",
                  borderRadius: "6px",
                  background: "var(--grey-100)",
                  color: "var(--grey-700)",
                  fontSize: "0.85rem",
                }}
              >
                {slot.date} {normalizeTimeValue(slot.time)} {slot.status ? "open" : "closed"}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* This renders the editor form that matches the backend slot shape. */}
      <form onSubmit={handleSubmit} style={{ paddingInline: "0.9rem", paddingBottom: "0.9rem" }}>
        {/* This shows the current editor error when one exists. */}
        {formError ? (
          <p className="alert alert-danger" style={{ marginBottom: "1rem" }}>
            {formError}
          </p>
        ) : null}

        {/* This lets the clinic choose an existing slot or create a new one. */}
        <label htmlFor={`slot-select-${doctor.id}`} className="form-label">
          Select existing slot
        </label>
        <select
          id={`slot-select-${doctor.id}`}
          className="form-input form-row"
          value={selectedSlotId}
          onChange={(event) => setSelectedSlotId(event.target.value)}
        >
          <option value="">Create new slot</option>
          {doctor.available_slots?.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.date} {normalizeTimeValue(slot.time)}
            </option>
          ))}
        </select>

        {/* This renders the backend date field. */}
        <label htmlFor={`slot-date-${doctor.id}`} className="form-label">
          Date
        </label>
        <input
          id={`slot-date-${doctor.id}`}
          className="form-input form-row"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />

        {/* This renders the backend time field. */}
        <label htmlFor={`slot-time-${doctor.id}`} className="form-label">
          Time
        </label>
        <input
          id={`slot-time-${doctor.id}`}
          className="form-input form-row"
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />

        {/* This renders the backend status field. */}
        <label htmlFor={`slot-status-${doctor.id}`} className="form-label">
          Status
        </label>
        <select
          id={`slot-status-${doctor.id}`}
          className="form-input form-row"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="true">Open</option>
          <option value="false">Closed</option>
        </select>

        {/* This submits the availability create or update action. */}
        <button type="submit" className="btn" disabled={isSaving} style={{ minWidth: "180px" }}>
          {isSaving
            ? "Saving availability..."
            : selectedSlotId
              ? "Update availability"
              : "Create availability"}
        </button>
      </form>
    </section>
  );
}

// This exports the clinic availability editor for clinic doctor cards.
export default ClinicDoctorAvailabilityEditor;
