import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../Auth/LoginLogic";
import "../Profile_Style/profilePages.css";

const createEmptyAvailabilityForm = () => ({
  date: "",
  time: "",
});

function DrDashboard() {
  const [availabilityForm, setAvailabilityForm] = useState(
    createEmptyAvailabilityForm(),
  );
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadAvailableTimes = async (canUpdate = () => true) => {
    if (canUpdate()) {
      setIsLoading(true);
      setLoadError("");
    }

    try {
      const response = await api.get("/available/");

      if (!canUpdate()) {
        return;
      }

      const preparedTimes = Array.isArray(response.data) ? response.data : [];
      setAvailableTimes(preparedTimes);
    } catch {
      if (!canUpdate()) {
        return;
      }

      setLoadError("Unable to load available times right now.");
    } finally {
      if (canUpdate()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadAvailableTimes(() => isMounted);

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAvailabilityForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!availabilityForm.date || !availabilityForm.time) {
      toast.error("Please select both a date and time.");
      return;
    }

    setIsSaving(true);

    try {
      await api.post("/available/", {
        date: availabilityForm.date,
        time: availabilityForm.time,
        status: true,
      });

      setAvailabilityForm(createEmptyAvailabilityForm());
      toast.success("Availability added successfully.");
      await loadAvailableTimes();
    } catch {
      toast.error("Error adding availability.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="dashboard-page">
      <header className="dashboard-page-header">
        <p>Dashboard</p>
        <h1>Add available time</h1>
        <span>
          Use a simple date and time form to publish available appointments.
        </span>
      </header>

      <div className="dashboard-layout">
        <form className="dashboard-card dashboard-form-grid" onSubmit={handleSubmit}>
          <div>
            <h2>New available time</h2>
            <p>
              This uses the existing availability structure without adding a
              complex scheduling system.
            </p>
          </div>

          <label htmlFor="availability-date">
            Date
            <input
              type="date"
              id="availability-date"
              name="date"
              value={availabilityForm.date}
              onChange={handleChange}
            />
          </label>

          <label htmlFor="availability-time">
            Time
            <input
              type="time"
              id="availability-time"
              name="time"
              value={availabilityForm.time}
              onChange={handleChange}
            />
          </label>

          <button
            type="submit"
            className="dashboard-submit-button"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Add Available Time"}
          </button>
        </form>

        <div className="dashboard-card">
          <h2>Existing available times</h2>
          {isLoading ? (
            <div className="dashboard-empty-state">Loading available times...</div>
          ) : loadError ? (
            <div className="dashboard-empty-state">{loadError}</div>
          ) : availableTimes.length ? (
            <div className="dashboard-list">
              {availableTimes.map((slot) => (
                <article key={slot.id} className="dashboard-item">
                  <div className="dashboard-item-header">
                    <h2>
                      {slot.date} at {slot.time}
                    </h2>
                    <span className="dashboard-status-pill">
                      {slot.status ? "Available" : "Booked"}
                    </span>
                  </div>
                  <p className="dashboard-item-meta">
                    This time is currently listed in your doctor dashboard.
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              No available times have been added yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default DrDashboard;
