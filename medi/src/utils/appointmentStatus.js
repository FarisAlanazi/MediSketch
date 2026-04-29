export const normalizeAppointmentStatus = (status) => // Normalize any incoming appointment status into one comparable lowercase value.
  String(status ?? "") // Convert missing or null values into a safe string first.
    .trim() // Remove extra spaces so status checks stay predictable.
    .toLowerCase(); // Compare with lowercase values only to keep the rules simple.

export const isAcceptedAppointmentStatus = (status) => // Check whether an appointment is truly accepted before enabling accepted-only flows like rating.
  normalizeAppointmentStatus(status) === "accepted"; // Return true only for the accepted status because the plan requires exact acceptance.

export const isRejectedAppointmentStatus = (status) => // Treat both the current backend rejection value and the planned value as one rejected UI state.
  ["declined", "rejected"].includes(normalizeAppointmentStatus(status)); // Support both values safely so the frontend stays compatible while displaying one rejected meaning.

export const getAppointmentStatusTranslationKey = (status) => // Map the raw backend status into the single UI status key used for translation and styling.
  isRejectedAppointmentStatus(status) // Check whether the backend returned any known rejected-like value.
    ? "rejected" // Collapse rejected-like values into one clear rejected label in the UI.
    : normalizeAppointmentStatus(status); // Keep accepted and pending unchanged because they already match the UI wording.

export const getRejectAppointmentRequestStatus = () => // Return the current request value used when the doctor rejects an appointment from the frontend.
  "declined"; // Keep the existing backend-compatible request status so this frontend-only change does not break the current API contract.
