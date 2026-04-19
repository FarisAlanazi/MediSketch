import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getCSRFToken } from "../../../Auth/LoginLogic";
import "../Profile_Style/profilePages.css";

const createEmptyPatientForm = () => ({
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  age: "",
  gender: "",
});

function UserProfile() {
  const [userInfo, setUserInfo] = useState(createEmptyPatientForm());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((currentUserInfo) => ({ ...currentUserInfo, [name]: value }));
  };

  useEffect(() => {
    let isMounted = true;

    const getData = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const res = await api.get("/me/");

        if (res.data && isMounted) {
          const profileData = {
            first_name: res.data.first_name ?? "",
            last_name: res.data.last_name ?? "",
            email: res.data.email ?? "",
            phone_number: res.data.phone_number ?? "",
            gender: res.data.gender ?? "",
            age: res.data.age ?? "",
          };
          setUserInfo(profileData);
        }
      } catch {
        if (isMounted) {
          setLoadError("Unable to load the patient profile right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmission = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await getCSRFToken();

    try {
      await api.patch("/me/", userInfo);
      toast.success("Profile edited successfully");
    } catch {
      toast.error("Something went wrong while saving the profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="profile-page">
        <div className="profile-card profile-loading-card">
          Loading patient profile...
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
        <p>Patient Profile</p>
        <h1>Keep your account details clear and up to date</h1>
        <span>
          This page keeps your personal information simple, readable, and easy
          to update.
        </span>
      </header>

      <form className="profile-card profile-form-layout" onSubmit={handleSubmission}>
        <section>
          <h2 className="profile-section-title">Personal Information</h2>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                value={userInfo.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                value={userInfo.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={userInfo.email}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="phone_number">Phone</label>
              <input
                type="text"
                name="phone_number"
                id="phone_number"
                value={userInfo.phone_number}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                name="age"
                id="age"
                value={userInfo.age}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="gender">Gender</label>
              <select
                name="gender"
                id="gender"
                value={userInfo.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </section>

        <button type="submit" className="profile-save-button" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
}

export default UserProfile;
