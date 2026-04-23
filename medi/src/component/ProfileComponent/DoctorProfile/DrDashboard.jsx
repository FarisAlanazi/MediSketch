import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../Auth/LoginLogic";
import { useTranslation } from "react-i18next";
import "../Profile_Style/profilePages.css";

const createEmptyAvailabilityForm = () => ({
  date: "",
  time: "",
});

function DrDashboard() {
  const { t } = useTranslation();
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

      setLoadError(t("dashboard.loadError"));
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
  }, [t]);

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
      toast.error(t("dashboard.emptyDateTime"));
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
      toast.success(t("dashboard.addSuccess"));
      await loadAvailableTimes();
    } catch {
      toast.error(t("dashboard.addError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="dashboard-page">
      <header className="dashboard-page-header">
        <p>{t("dashboard.label")}</p>
        <h1>{t("dashboard.title")}</h1>
        <span>{t("dashboard.subtitle")}</span>
      </header>

      <div className="dashboard-layout">
        <form
          className="dashboard-card dashboard-form-grid"
          onSubmit={handleSubmit}
        >
          <div>
            <h2>{t("dashboard.formTitle")}</h2>
            <p>{t("dashboard.formSubtitle")}</p>
          </div>

          <label htmlFor="availability-date">
            {t("dashboard.date")}
            <input
              type="date"
              id="availability-date"
              name="date"
              value={availabilityForm.date}
              onChange={handleChange}
            />
          </label>

          <label htmlFor="availability-time">
            {t("dashboard.time")}
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
            {isSaving ? t("dashboard.saving") : t("dashboard.add")}
          </button>
        </form>

        <div className="dashboard-card">
          <h2>{t("dashboard.existingTitle")}</h2>
          {isLoading ? (
            <div className="dashboard-empty-state">
              {t("dashboard.loading")}
            </div>
          ) : loadError ? (
            <div className="dashboard-empty-state">{loadError}</div>
          ) : availableTimes.length ? (
            <div className="dashboard-list">
              {availableTimes.map((slot) => (
                <article key={slot.id} className="dashboard-item">
                  <div className="dashboard-item-header">
                    <h2>
                      {slot.date} {t("dashboard.at")} {slot.time}
                    </h2>
                    <span className="dashboard-status-pill">
                      {slot.status ? t("dashboard.available") : t("dashboard.booked")}
                    </span>
                  </div>
                  <p className="dashboard-item-meta">
                    {t("dashboard.listed")}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              {t("dashboard.empty")}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default DrDashboard;
