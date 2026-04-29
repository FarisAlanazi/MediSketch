// This turns any incoming value into safe trimmed text.
const toTextValue = (value) => String(value ?? "").trim();

// This keeps clinic-request statuses easy to compare across small UI checks.
export const normalizeClinicRequestStatus = (value) =>
  toTextValue(value).toLowerCase();

// This builds one readable doctor name from the public doctor payload.
export const getDoctorDisplayName = (doctor) => {
  // This prefers the full first and last name when both are available.
  const fullName = `${toTextValue(doctor?.user?.first_name)} ${toTextValue(
    doctor?.user?.last_name,
  )}`.trim();

  // This falls back to the username when the full name is missing.
  return fullName || toTextValue(doctor?.user?.username);
};

// This reads the accepted clinic name only from data already exposed by the backend.
export const getAcceptedClinicName = (doctor) => {
  // This checks the clinic-link status only when the backend exposes it.
  const clinicStatus = normalizeClinicRequestStatus(
    doctor?.accepted_clinic?.status ??
      doctor?.clinic?.status ??
      doctor?.clinic_status ??
      doctor?.clinic_request_status,
  );

  // This hides the clinic name when the backend explicitly says the link is not accepted.
  if (clinicStatus && clinicStatus !== "accepted") {
    return "";
  }

  // This returns the first backend-provided clinic name without inventing new display data.
  return (
    toTextValue(doctor?.accepted_clinic?.name) ||
    toTextValue(doctor?.clinic?.name) ||
    toTextValue(doctor?.accepted_clinic_name) ||
    toTextValue(doctor?.clinic_name)
  );
};

// This extracts the clinic name from one doctor-facing clinic request row.
export const getClinicRequestClinicName = (request) =>
  // This tries only existing backend-style clinic name fields.
  toTextValue(request?.clinic?.name) ||
  toTextValue(request?.clinic_name) ||
  toTextValue(request?.clinic?.user?.username) ||
  toTextValue(request?.clinic?.username);
