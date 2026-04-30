// This imports the shared axios client used across the frontend.
import api, { getCSRFToken } from "../../Auth/LoginLogic";
// This imports the shared doctor and clinic display helpers used by the request flow.
import {
  getDoctorDisplayName,
  getClinicRequestClinicName,
} from "../../utils/clinicRequestHelpers";

// This keeps the clinic API base path in one place for clinic-only requests.
const clinicBasePath = "/clinic";

// This normalizes list-style backend responses into a plain array.
const toArrayPayload = (value) =>
  Array.isArray(value)
    ? value
    : Array.isArray(value?.results)
      ? value.results
      : [];
// This helper extracts the clearest backend error message available.
export const getClinicErrorMessage = (error, fallbackMessage) => {
  // This returns DRF detail errors when the backend sends them.
  if (typeof error?.response?.data?.detail === "string") {
    return error.response.data.detail;
  }

  // This returns field-level doctor errors from serializer responses.
  if (typeof error?.response?.data?.doctor_id?.[0] === "string") {
    return error.response.data.doctor_id[0];
  }

  // This extracts the first serializer field error when the backend sends one.
  if (error?.response?.data && typeof error.response.data === "object") {
    // This finds the first field with a string-based validation error.
    const firstFieldKey = Object.keys(error.response.data).find(
      (fieldKey) =>
        Array.isArray(error.response.data[fieldKey]) &&
        typeof error.response.data[fieldKey][0] === "string",
    );

    // This returns the first field error when a serializer error exists.
    if (firstFieldKey) {
      return error.response.data[firstFieldKey][0];
    }
  }

  // This returns generic string responses when present.
  if (typeof error?.response?.data === "string") {
    return error.response.data;
  }

  // This falls back to the provided safe message otherwise.
  return fallbackMessage;
};

// This registers a new clinic account through the dedicated clinic endpoint.
export const registerClinic = async (clinicData) => {
  // This ensures the CSRF cookie exists before the POST request.
  await getCSRFToken();
  // This sends the clinic registration payload to the backend.
  const response = await api.post(`${clinicBasePath}/register/`, clinicData);
  // This returns the created clinic profile payload to the caller.
  return response.data;
};

// This logs a clinic user in through the shared session login endpoint.
export const loginClinic = async (credentials) => {
  // This ensures the CSRF cookie exists before the POST request.
  await getCSRFToken();
  // This submits the clinic login credentials to the existing login endpoint.
  const response = await api.post("/login/", credentials);
  // This returns the login payload for clinic validation.
  return response.data;
};

// This clears the authenticated session when clinic auth must be reset.
export const logoutClinicSession = async () => {
  // This ensures the CSRF cookie exists before the logout request.
  await getCSRFToken();
  // This posts to the shared logout endpoint used elsewhere in the app.
  await api.post("/logout/");
};

// This loads the current authenticated clinic profile for the dashboard.
export const getClinicProfile = async () => {
  // This requests the authenticated clinic profile from the backend.
  const response = await api.get(`${clinicBasePath}/profile/`);
  // This returns the clinic profile payload for the page state.
  return response.data;
};

// This loads the doctors linked to the authenticated clinic.
export const getClinicDoctors = async () => {
  // This requests the clinic-owned doctor list from the backend.
  const response = await api.get(`${clinicBasePath}/doctors/`);
  // This returns the clinic doctor array for rendering.
  return response.data;
};

// This validates the exact doctor fields needed for the clinic confirm popup.
const buildResolvedDoctor = (doctor, sourceLabel) => {
  // This keeps the request payload tied to the actual doctor profile id.
  const resolvedDoctorId = Number(doctor?.id);
  // This builds the readable doctor name from the existing nested user data.
  const resolvedDoctorName = getDoctorDisplayName(doctor);

  // This stops the request flow when the backend doctor id is missing.
  if (!Number.isFinite(resolvedDoctorId)) {
    throw new Error(
      `Missing doctor id in ${sourceLabel}. Expected doctor.id for POST /clinic-requests/.`,
    );
  }

  // This stops the popup flow when the backend doctor name fields are missing.
  if (!resolvedDoctorName) {
    throw new Error(
      `Missing doctor name in ${sourceLabel}. Expected user.first_name and user.last_name or user.username.`,
    );
  }

  // This returns only the exact doctor fields needed by the clinic request UI.
  return {
    id: resolvedDoctorId,
    name: resolvedDoctorName,
  };
};

// This resolves a doctor candidate from the existing public doctor endpoints by id.
export const findDoctorById = async (doctorId) => {
  // This normalizes the typed doctor id before any backend lookup happens.
  const normalizedDoctorId = String(doctorId ?? "").trim();

  // This stops the lookup early when no doctor id was entered.
  if (!normalizedDoctorId) {
    throw new Error("Enter a doctor ID.");
  }

  // This keeps the entered value strict because the backend route expects an id.
  if (!/^\d+$/.test(normalizedDoctorId)) {
    throw new Error("Enter a valid doctor ID.");
  }

  // This loads the public doctor list first so the frontend can resolve existing data when possible.
  const doctorsResponse = await api.get("/doctors/");
  // This checks both common id shapes used by the existing doctor payloads.
  const matchedDoctor = toArrayPayload(doctorsResponse.data).find(
    (doctor) =>
      String(doctor?.id) === normalizedDoctorId ||
      String(doctor?.user?.id) === normalizedDoctorId,
  );

  // This returns the matched doctor immediately when the list already has enough data.
  if (matchedDoctor) {
    return buildResolvedDoctor(matchedDoctor, "GET /doctors/");
  }

  try {
    // This falls back to the doctor detail route when the list did not contain the entered id.
    const doctorResponse = await api.get(`/doctors/${normalizedDoctorId}/`);
    // This returns the resolved doctor data for the popup and request payload.
    return buildResolvedDoctor(
      doctorResponse.data,
      `GET /doctors/${normalizedDoctorId}/`,
    );
  } catch {
    // This surfaces a clear message when the entered doctor id cannot be resolved.
    throw new Error("No doctor was found with that ID.");
  }
};

// This sends a clinic request instead of linking the doctor directly.
export const createClinicRequest = async (doctorId) => {
  // This ensures the CSRF cookie exists before the POST request.
  await getCSRFToken();
  // This sends the backend-supported clinic request payload.
  const response = await api.post("/clinic-requests/", {
    doctor_id: Number(doctorId),
  });
  // This returns the created request payload when the request succeeds.
  return response.data;
};

// This loads the clinic requests shown inside the doctor dashboard.
export const getDoctorClinicRequests = async () => {
  // This requests the doctor-facing clinic request list from the backend.
  const response = await api.get("/clinic-requests/doctor/");
  // This normalizes plain and paginated list responses into one array shape.
  const clinicRequests = toArrayPayload(response.data);
  // This validates that each request row exposes the clinic name needed by the UI.
  clinicRequests.forEach((request) => {
    // This stops the request section when the backend omits the request id.
    if (request?.id === null || request?.id === undefined) {
      throw new Error(
        "Missing request id in GET /clinic-requests/doctor/ response. Expected id.",
      );
    }

    // This stops the request section when the backend omits clinic name data.
    if (!getClinicRequestClinicName(request)) {
      throw new Error(
        "Missing clinic name in GET /clinic-requests/doctor/ response. Expected clinic.name, clinic_name, clinic.user.username, or clinic.username.",
      );
    }
  });
  // This returns the raw request rows after the required fields are confirmed.
  return clinicRequests;
};

// This accepts one clinic request from the doctor dashboard.
export const acceptClinicRequest = async (requestId) => {
  // This ensures the CSRF cookie exists before the PATCH request.
  await getCSRFToken();
  // This sends the exact accept route from the plan.
  const response = await api.patch(`/clinic-requests/${requestId}/accept/`);
  // This returns the updated request payload to the caller.
  return response.data;
};

// This rejects one clinic request from the doctor dashboard.
export const rejectClinicRequest = async (requestId) => {
  // This ensures the CSRF cookie exists before the PATCH request.
  await getCSRFToken();
  // This sends the exact reject route from the plan.
  const response = await api.patch(`/clinic-requests/${requestId}/reject/`);
  // This returns the updated request payload to the caller.
  return response.data;
};

// This removes a doctor link from the authenticated clinic.
export const removeDoctorFromClinic = async (doctorId) => {
  // This ensures the CSRF cookie exists before the DELETE-like action.
  await getCSRFToken();
  // This calls the clinic doctor detail endpoint for unlinking.
  const response = await api.delete(`${clinicBasePath}/doctors/${doctorId}/`);
  // This returns the backend success message to the caller.
  return response.data;
};

// This creates or upserts a doctor availability slot for a clinic-linked doctor.
export const createDoctorAvailability = async (
  doctorId,
  availabilityPayload,
) => {
  // This ensures the CSRF cookie exists before the POST request.
  await getCSRFToken();
  // This sends the slot payload using the backend clinic availability endpoint.
  const response = await api.post(
    `${clinicBasePath}/doctors/${doctorId}/availability/`,
    availabilityPayload,
  );
  // This returns the saved slot payload to the editor.
  return response.data;
};

// This updates an existing doctor availability slot for a clinic-linked doctor.
export const updateDoctorAvailability = async (
  doctorId,
  slotId,
  availabilityPayload,
) => {
  // This ensures the CSRF cookie exists before the PATCH request.
  await getCSRFToken();
  // This sends the slot update to the backend clinic availability detail endpoint.
  const response = await api.patch(
    `${clinicBasePath}/doctors/${doctorId}/availability/${slotId}/`,
    availabilityPayload,
  );
  // This returns the updated slot payload to the editor.
  return response.data;
};
