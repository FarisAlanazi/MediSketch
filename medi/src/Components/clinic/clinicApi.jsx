import api, { getCSRFToken } from "../../Auth/LoginLogic";
import {
  getDoctorDisplayName,
  getClinicRequestClinicName,
} from "../../utils/clinicRequestHelpers";

const clinicBasePath = "/clinic";

const toArrayPayload = (value) =>
  Array.isArray(value)
    ? value
    : Array.isArray(value?.results)
      ? value.results
      : [];

export const getClinicErrorMessage = (error, fallbackMessage) => {
  if (typeof error?.response?.data?.detail === "string") {
    return error.response.data.detail;
  }

  if (typeof error?.response?.data?.doctor_id?.[0] === "string") {
    return error.response.data.doctor_id[0];
  }

  if (error?.response?.data && typeof error.response.data === "object") {
    const firstFieldKey = Object.keys(error.response.data).find(
      //finds the first key in the error response data whose value is an array with a string as its first element (object.key  = (name : [ "This field is required."] ) where name is the key.
      (fieldKey) =>
        Array.isArray(error.response.data[fieldKey]) &&
        typeof error.response.data[fieldKey][0] === "string",
    );

    if (firstFieldKey) {
      return error.response.data[firstFieldKey][0];
    }
  }

  if (typeof error?.response?.data === "string") {
    return error.response.data;
  }

  return fallbackMessage;
};

export const registerClinic = async (clinicData) => {
  await getCSRFToken();
  const response = await api.post(`${clinicBasePath}/register/`, clinicData);
  return response.data;
};

export const loginClinic = async (credentials) => {
  await getCSRFToken();
  const response = await api.post("/login/", credentials);
  return response.data;
};

export const logoutClinicSession = async () => {
  await getCSRFToken();
  await api.post("/logout/");
};

export const getClinicProfile = async () => {
  const response = await api.get(`${clinicBasePath}/profile/`);
  return response.data;
};

export const getClinicDoctors = async () => {
  const response = await api.get(`${clinicBasePath}/doctors/`);
  return response.data;
};

export const getClinicAppointments = async () => {
  const response = await api.get("/appointments/");
  return toArrayPayload(response.data);
};

//return clean obj so the clinic dashboard can use it.
const buildResolvedDoctor = (doctor, sourceLabel) => {
  const resolvedDoctorId = Number(doctor?.id);
  const resolvedDoctorName = getDoctorDisplayName(doctor);

  if (!Number.isFinite(resolvedDoctorId)) {
    //if falsy or not a number, throw error
    throw new Error(
      `Missing doctor id in ${sourceLabel}. Expected doctor.id for POST /clinic-requests/.`,
    );
  }

  if (!resolvedDoctorName) {
    //if not exist or empty string, throw error
    throw new Error(
      `Missing doctor name in ${sourceLabel}. Expected user.first_name and user.last_name or user.username.`,
    );
  }

  return {
    //return clean obj ,,
    id: resolvedDoctorId,
    name: resolvedDoctorName,
  };
};

export const findDoctorById = async (doctorId) => {
  const normalizedDoctorId = String(doctorId ?? "").trim();

  if (!normalizedDoctorId) {
    //if falsy after trim, throw error
    throw new Error("Enter a doctor ID ,, no id ");
  }

  if (!/^\d+$/.test(normalizedDoctorId)) {
    //if not all digits, throw error
    throw new Error("Enter a valid doctor ID ,, violate the regex ");
  }

  const doctorsResponse = await api.get("/doctors/");
  const matchedDoctor = toArrayPayload(doctorsResponse.data).find(
    (doctor) =>
      String(doctor?.id) === normalizedDoctorId ||
      String(doctor?.user?.id) === normalizedDoctorId,
  );

  if (matchedDoctor) {
    return buildResolvedDoctor(matchedDoctor, "GET /doctors/"); //return clean obj . Matchdoctor and the route next to it is a sourcelable in buildResolvedDoctor func.
  }

  try {
    const doctorResponse = await api.get(`/doctors/${normalizedDoctorId}/`);
    return buildResolvedDoctor(
      doctorResponse.data,
      `GET /doctors/${normalizedDoctorId}/ vrr`,
    );
  } catch {
    throw new Error("No doctor was found with that ID ,, 404 from api");
  }
};

export const createClinicRequest = async (doctorId) => {
  await getCSRFToken();
  const response = await api.post("/clinic-requests/", {
    doctor_id: Number(doctorId),
  });
  return response.data;
};

export const updateClinicAppointmentStatus = async (appointmentId, nextStatus) => {
  await getCSRFToken();
  const response = await api.patch(`/appointments/${appointmentId}/`, {
    status: nextStatus,
  });
  return response.data;
};

export const getDoctorClinicRequests = async () => {
  // get clinic requests for doctor dashboard .. ==========================**************************************************************************
  const response = await api.get("/clinic-requests/doctor/");
  const clinicRequests = toArrayPayload(response.data);
  clinicRequests.forEach((request) => {
    if (request?.id === null || request?.id === undefined) {
      throw new Error(
        "Missing request id in GET /clinic-requests/doctor/ response. Expected id.",
      );
    }

    if (!getClinicRequestClinicName(request)) {
      throw new Error(
        "Missing clinic name in GET /clinic-requests/doctor/ response. Expected clinic.name, clinic_name, clinic.user.username, or clinic.username.",
      );
    }
  });
  return clinicRequests;
};

//related to DOCTORS

export const acceptClinicRequest = async (requestId) => {
  //accept clinic request for doctor dashboard .. ==========================**************************************************************************
  await getCSRFToken();
  const response = await api.patch(`/clinic-requests/${requestId}/accept/`);
  return response.data;
};

export const rejectClinicRequest = async (requestId) => {
  //reject clinic request for doctor dashboard .. ==========================**************************************************************************
  await getCSRFToken();
  const response = await api.patch(`/clinic-requests/${requestId}/reject/`);
  return response.data;
};

//related to CLINIC DASHBOARD DOCTOR MANAGEMENT
export const removeDoctorFromClinic = async (doctorId) => {
  //important
  //remove doctor from clinic for clinic dashboard ****************************
  await getCSRFToken();
  const response = await api.delete(`${clinicBasePath}/doctors/${doctorId}/`);
  return response.data;
};

export const createDoctorAvailability = async (
  //important ,, create doctor availability for clinic dashboard **************************** ''create appointment slots, set available times, etc"
  doctorId,
  availabilityPayload,
) => {
  await getCSRFToken();
  const response = await api.post(
    `${clinicBasePath}/doctors/${doctorId}/availability/`,
    availabilityPayload,
  );
  return response.data;
};

export const updateDoctorAvailability = async (
  //patch , update doctor availability for clinic dashboard **************************** "change time, close an appointment slot, etc"
  doctorId,
  slotId,
  availabilityPayload,
) => {
  await getCSRFToken();
  const response = await api.patch(
    `${clinicBasePath}/doctors/${doctorId}/availability/${slotId}/`,
    availabilityPayload,
  );
  return response.data;
};
