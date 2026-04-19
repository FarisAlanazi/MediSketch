import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api, { getCSRFToken } from "../../../Auth/LoginLogic";
import DoctorLocationPicker from "./DoctorLocationPicker";
import "../Profile_Style/profilePages.css";

const createEmptyDoctorForm = () => ({
  userId: "",
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  age: "",
  gender: "",
  price: "",
  clinic_name: "",
  years_of_experience: "",
  about_me: "",
  specialization: "",
  medical_id: "",
  latitude: "",
  longitude: "",
});

const toNullableNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const toTextValue = (value) => String(value ?? "");

function DoctorProfile() {
  const [doctorForm, setDoctorForm] = useState(createEmptyDoctorForm());
  const [specializations, setSpecializations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [medicalIdTouched, setMedicalIdTouched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleLocationChange = ({ latitude, longitude }) => {
    setDoctorForm((currentForm) => ({
      ...currentForm,
      latitude,
      longitude,
    }));
  };

  useEffect(() => {
    let isMounted = true;

    const loadDoctorProfile = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const meResponse = await api.get("/me/");
        const currentUser = meResponse.data;
        const [doctorResponse, specializationsResponse] = await Promise.all([
          api.get(`/doctors/${currentUser.id}/`),
          api.get("/specializations/"),
        ]);

        if (!isMounted) {
          return;
        }

        const specializationOptions = Array.isArray(specializationsResponse.data)
          ? specializationsResponse.data
          : [];
        const matchedSpecialization =
          specializationOptions.find(
            (specialization) =>
              String(specialization.id) === String(currentUser.specialization) ||
              specialization.name === doctorResponse.data.specialization,
          ) ?? null;

        setSpecializations(specializationOptions);
        setDoctorForm({
          userId: toTextValue(currentUser.id),
          first_name: toTextValue(currentUser.first_name),
          last_name: toTextValue(currentUser.last_name),
          email: toTextValue(currentUser.email),
          phone_number: toTextValue(currentUser.phone_number),
          age: toTextValue(currentUser.age),
          gender: toTextValue(currentUser.gender),
          price: toTextValue(currentUser.price),
          clinic_name: toTextValue(doctorResponse.data?.clinic_name),
          years_of_experience: toTextValue(currentUser.years_of_experience),
          about_me: toTextValue(currentUser.about_me),
          specialization: matchedSpecialization
            ? toTextValue(matchedSpecialization.id)
            : "",
          medical_id: toTextValue(doctorResponse.data?.Med_id),
          latitude: toTextValue(doctorResponse.data?.latitude),
          longitude: toTextValue(doctorResponse.data?.longitude),
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setLoadError("Unable to load the doctor profile right now.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDoctorProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmission = async (e) => {
    e.preventDefault();

    setMedicalIdTouched(true);

    if (isMedicalIdInvalid) {
      return;
    }

    setIsSaving(true);
    await getCSRFToken();

    try {
      await api.patch("/me/", {
        first_name: doctorForm.first_name,
        last_name: doctorForm.last_name,
        email: doctorForm.email,
        phone_number: doctorForm.phone_number,
        age: toNullableNumber(doctorForm.age),
        gender: doctorForm.gender || null,
        price: toNullableNumber(doctorForm.price),
        about_me: doctorForm.about_me,
        years_of_experience: toNullableNumber(doctorForm.years_of_experience),
        specialization: doctorForm.specialization || "empty",
      });

      await api.patch(`/doctors/${doctorForm.userId}/`, {
        clinic_name: doctorForm.clinic_name,
        Med_id: doctorForm.medical_id.trim(),
        latitude: toNullableNumber(doctorForm.latitude),
        longitude: toNullableNumber(doctorForm.longitude),
      });

      toast.success("Profile edited successfully");
    } catch {
      toast.error("Something went wrong while saving the profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const isMedicalIdInvalid = useMemo(() => {
    const medicalId = doctorForm.medical_id.trim();
    return !medicalId || !medicalId.startsWith("10001");
  }, [doctorForm.medical_id]);

  if (isLoading) {
    return (
      <section className="profile-page">
        <div className="profile-card profile-loading-card">
          Loading doctor profile...
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="profile-page">
        <div className="profile-card profile-loading-card">{loadError}</div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <header className="profile-page-header">
        <p>Doctor Profile</p>
        <h1>Edit your professional profile</h1>
        <span>
          Keep your personal details, clinic location, and professional
          information up to date.
        </span>
      </header>

      <form className="profile-card profile-form-layout" onSubmit={handleSubmission}>
        <section>
          <h2 className="profile-section-title">Basic Information</h2>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                value={doctorForm.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                value={doctorForm.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={doctorForm.email}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="phone_number">Phone</label>
              <input
                type="text"
                name="phone_number"
                id="phone_number"
                value={doctorForm.phone_number}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                name="age"
                id="age"
                value={doctorForm.age}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="gender">Gender</label>
              <select
                name="gender"
                id="gender"
                value={doctorForm.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="profile-section-title">Professional Details</h2>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="price">Consultation Price</label>
              <input
                type="number"
                name="price"
                id="price"
                value={doctorForm.price}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="years_of_experience">Years of Experience</label>
              <input
                type="number"
                name="years_of_experience"
                id="years_of_experience"
                value={doctorForm.years_of_experience}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="specialization">Specialization</label>
              <select
                name="specialization"
                id="specialization"
                value={doctorForm.specialization}
                onChange={handleChange}
              >
                <option value="">Select specialization</option>
                {specializations.map((specialization) => (
                  <option key={specialization.id} value={specialization.id}>
                    {specialization.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="profile-field">
              <label htmlFor="medical_id">Medical ID</label>
              <input
                type="text"
                name="medical_id"
                id="medical_id"
                value={doctorForm.medical_id}
                onChange={handleChange}
                onBlur={() => setMedicalIdTouched(true)}
                className={medicalIdTouched && isMedicalIdInvalid ? "profile-input-invalid" : ""}
              />
              {medicalIdTouched && isMedicalIdInvalid ? (
                <span className="profile-field-error">
                  Medical ID must start with 10001.
                </span>
              ) : null}
            </div>

            <div className="profile-field-wide">
              <label htmlFor="clinic_name">Address</label>
              <input
                type="text"
                name="clinic_name"
                id="clinic_name"
                value={doctorForm.clinic_name}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field-wide">
              <label htmlFor="about_me">About Me</label>
              <textarea
                name="about_me"
                id="about_me"
                value={doctorForm.about_me}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="profile-section-title">Clinic Location</h2>
          <DoctorLocationPicker
            latitude={doctorForm.latitude}
            longitude={doctorForm.longitude}
            onLocationChange={handleLocationChange}
          />
        </section>

        <button
          type="submit"
          className="profile-save-button"
          disabled={isSaving || isMedicalIdInvalid}
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
}

export default DoctorProfile;
