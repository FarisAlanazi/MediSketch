import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api, { getCSRFToken } from "../../../Auth/LoginLogic";
import saudiCities from "../../../constants/saudiCities";
import DoctorLocationPicker from "./DoctorLocationPicker";
import { useTranslation } from "react-i18next";
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
  city: "",
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

const pickTextValue = (primaryValue, fallbackValue) =>
  toTextValue(primaryValue ?? fallbackValue);

const getErrorMessage = (error, fallbackMessage) => {
  //if there's an error from the backend then show it, otherwise show the fallback error
  if (typeof error?.response?.data?.detail === "string") {
    return error.response.data.detail;
  }

  if (typeof error?.response?.data === "string") {
    return error.response.data;
  }

  return fallbackMessage;
};

function DoctorProfile() {
  const { t } = useTranslation();
  const [doctorForm, setDoctorForm] = useState(createEmptyDoctorForm());
  const [specializations, setSpecializations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [medicalIdTouched, setMedicalIdTouched] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null); // This keeps the selected doctor photo ready for upload without changing the existing form state shape.

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

  const handleProfileImageChange = (event) => {
    setProfileImageFile(event.target.files?.[0] ?? null); // This stores only the chosen image file so the existing text fields keep working as before.
    console.log(event.target?.files, " img ");
  };

  useEffect(() => {
    let isMounted = true;

    const loadDoctorProfile = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const meResponse = await api.get("/me/");
        const currentUser = meResponse.data;
        const [doctorResult, specializationsResult] = await Promise.allSettled([
          //allSettled means wait until all finish. do not fail if one of them fails, and reutrn the result of each req.
          api.get(`/doctors/${currentUser.id}/`),
          api.get("/specializations/"),
        ]);

        if (!isMounted) {
          return;
        }

        if (doctorResult.status !== "fulfilled") {
          //promise request , if fulfilled or rejected, allSettled wont send error and i have to check on the status manually.
          throw doctorResult.reason;
        }

        const doctorResponse = doctorResult.value.data ?? {};

        console.log(doctorResponse, "Doctor response");

        const specializationOptions =
          specializationsResult.status === "fulfilled" &&
          Array.isArray(specializationsResult.value.data)
            ? specializationsResult.value.data
            : []; // if the request is good and the data is an array then use it, otherwise use empty array

        const visibleSpecializations =
          specializationOptions.length ||
          !currentUser.specialization ||
          !doctorResponse.specialization
            ? specializationOptions
            : [
                //fallback , imagine the specialization dropdown failed to load data from the backend, then the fallback will show the doctor current specialization.
                {
                  id: currentUser.specialization,
                  name: doctorResponse.specialization,
                },
              ];

        const matchedSpecialization = //search to find the doctor specialization in the loaded options.
          visibleSpecializations.find(
            (specialization) =>
              String(specialization.id) ===
                String(currentUser.specialization) ||
              specialization.name === doctorResponse.specialization,
          ) ?? null;

        setSpecializations(visibleSpecializations); // add the final visible specializations to the state to be used in the specialization dropdown.

        //

        setDoctorForm({
          //set the form with string values only to avoid un/controlled input errors.
          userId: toTextValue(currentUser.id),
          first_name: toTextValue(currentUser.first_name),
          last_name: toTextValue(currentUser.last_name),
          email: toTextValue(currentUser.email),
          phone_number: toTextValue(currentUser.phone_number),
          age: pickTextValue(doctorResponse.age, currentUser.age),
          gender: pickTextValue(doctorResponse.gender, currentUser.gender),
          price: pickTextValue(doctorResponse.price, currentUser.price),
          city: toTextValue(doctorResponse.city),
          clinic_name: toTextValue(doctorResponse.clinic_name),
          years_of_experience: pickTextValue(
            doctorResponse.years_of_experience,
            currentUser.years_of_experience,
          ),
          about_me: pickTextValue(
            doctorResponse.about_me,
            currentUser.about_me,
          ),
          specialization: matchedSpecialization
            ? toTextValue(matchedSpecialization.id)
            : toTextValue(currentUser.specialization),
          medical_id: toTextValue(doctorResponse.Med_id),
          latitude: toTextValue(doctorResponse.latitude),
          longitude: toTextValue(doctorResponse.longitude),
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(getErrorMessage(error, t("doctorProfile.loadError")));
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
  }, [t]);

  const handleSubmission = async (e) => {
    e.preventDefault();

    setMedicalIdTouched(true);

    if (isMedicalIdInvalid) {
      return;
    }

    setIsSaving(true);
    await getCSRFToken();

    try {
      //in this post req, the numerical values will be converted to numbers or null using toNullableNumber func.
      await api.patch("/me/", {
        first_name: doctorForm.first_name,
        last_name: doctorForm.last_name,
        email: doctorForm.email,
        phone_number: doctorForm.phone_number,
        age: toNullableNumber(doctorForm.age), //number or null
        gender: doctorForm.gender || null,
        price: toNullableNumber(doctorForm.price),
        about_me: doctorForm.about_me,
        years_of_experience: toNullableNumber(doctorForm.years_of_experience),
        specialization: doctorForm.specialization || "empty",
      });

      await api.patch(`/doctors/${doctorForm.userId}/`, {
        city: doctorForm.city.trim(),
        clinic_name: doctorForm.clinic_name,
        Med_id: doctorForm.medical_id.trim(),
        latitude: toNullableNumber(doctorForm.latitude),
        longitude: toNullableNumber(doctorForm.longitude),
      });

      if (profileImageFile) {
        const profileImageFormData = new FormData(); // This sends the doctor image, JSON cannot carry files data.
        profileImageFormData.append("profile_image", profileImageFile);
        await api.patch(`/doctors/${doctorForm.userId}/`, profileImageFormData);
      }

      toast.success(t("doctorProfile.success"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("doctorProfile.saveError")));
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
          {t("doctorProfile.loading")}
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
        <p>{t("doctorProfile.pageLabel")}</p>
        <h1>{t("doctorProfile.pageTitle")}</h1>
        <span>{t("doctorProfile.pageSubtitle")}</span>
        <span>Userid : {doctorForm.userId}</span>
      </header>

      <form
        className="profile-card profile-form-layout"
        onSubmit={handleSubmission}
      >
        <section>
          <h2 className="profile-section-title">
            {t("doctorProfile.basicInfo")}
          </h2>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="first_name">{t("doctorProfile.firstName")}</label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                value={doctorForm.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="last_name">{t("doctorProfile.lastName")}</label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                value={doctorForm.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="email">{t("doctorProfile.email")}</label>
              <input
                type="email"
                name="email"
                id="email"
                value={doctorForm.email}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="phone_number">{t("doctorProfile.phone")}</label>
              <input
                type="text"
                name="phone_number"
                id="phone_number"
                value={doctorForm.phone_number}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="age">{t("doctorProfile.age")}</label>
              <input
                type="number"
                name="age"
                id="age"
                value={doctorForm.age}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="gender">{t("doctorProfile.gender")}</label>
              <select
                name="gender"
                id="gender"
                value={doctorForm.gender}
                onChange={handleChange}
              >
                <option value="">{t("doctorProfile.selectGender")}</option>
                <option value="male">{t("doctorProfile.male")}</option>
                <option value="female">{t("doctorProfile.female")}</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="profile-section-title">
            {t("doctorProfile.professionalDetails")}
          </h2>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="price">
                {t("doctorProfile.consultationPrice")}
              </label>
              <input
                type="number"
                name="price"
                id="price"
                value={doctorForm.price}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="years_of_experience">
                {t("doctorProfile.yearsOfExperience")}
              </label>
              <input
                type="number"
                name="years_of_experience"
                id="years_of_experience"
                value={doctorForm.years_of_experience}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="specialization">
                {t("doctorProfile.specialization")}
              </label>
              <select
                name="specialization"
                id="specialization"
                value={doctorForm.specialization}
                onChange={handleChange}
              >
                <option value="">
                  {t("doctorProfile.selectSpecialization")}
                </option>
                {specializations.map((specialization) => (
                  <option key={specialization.id} value={specialization.id}>
                    {specialization.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="profile-field">
              <label htmlFor="city">{t("doctorProfile.city")}</label>
              <select
                name="city"
                id="city"
                value={doctorForm.city}
                onChange={handleChange}
              >
                <option value="">{t("doctorProfile.selectCity")}</option>
                {saudiCities.map((city) => (
                  <option key={city} value={city}>
                    {t(`cities.${city}`, { defaultValue: city })}
                  </option>
                ))}
              </select>
            </div>

            <div className="profile-field">
              <label htmlFor="medical_id">{t("doctorProfile.medicalId")}</label>
              <input
                type="text"
                name="medical_id"
                id="medical_id"
                value={doctorForm.medical_id}
                onChange={handleChange}
                onBlur={() => setMedicalIdTouched(true)}
                className={
                  medicalIdTouched && isMedicalIdInvalid
                    ? "profile-input-invalid"
                    : ""
                }
              />
              {medicalIdTouched && isMedicalIdInvalid ? (
                <span className="profile-field-error">
                  {t("doctorProfile.medicalIdError")}
                </span>
              ) : null}
            </div>

            <div className="profile-field">
              <label htmlFor="profile_image">Profile Image</label>
              <input
                type="file"
                name="profile_image"
                id="profile_image"
                accept="image/*"
                onChange={handleProfileImageChange}
              />
            </div>

            <div className="profile-field-wide">
              <label htmlFor="clinic_name">{t("doctorProfile.address")}</label>
              <input
                type="text"
                name="clinic_name"
                id="clinic_name"
                value={doctorForm.clinic_name}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field-wide">
              <label htmlFor="about_me">{t("doctorProfile.aboutMe")}</label>
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
          <h2 className="profile-section-title">
            {t("doctorProfile.clinicLocation")}
          </h2>
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
          {isSaving ? t("doctorProfile.saving") : t("doctorProfile.save")}
        </button>
      </form>
    </section>
  );
}

export default DoctorProfile;
