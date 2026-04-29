// This turns any incoming value into a trimmed text value for safe completeness checks.
const toTextValue = (value) => String(value ?? "").trim();

// This turns text-like number values into a real number for public doctor checks.
const toNumberValue = (value) => {
  // This keeps empty values out of numeric completeness checks.
  if (value === null || value === undefined || value === "") {
    return null;
  }

  // This removes non-number characters so values like "180 SAR" still work.
  const parsedValue = Number.parseFloat(String(value).replace(/[^\d.]/g, ""));
  // This returns a usable number only when parsing succeeds.
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

// This checks whether the doctor has the public profile fields already used across the app.
export const isDoctorProfileComplete = (doctor) => {
  // This reads the public name fields from the existing nested user payload.
  const firstName = toTextValue(doctor?.user?.first_name);
  const lastName = toTextValue(doctor?.user?.last_name);
  // This reads the public doctor profile fields shown in cards and details.
  const specialization = toTextValue(doctor?.specialization);
  const city = toTextValue(doctor?.city);
  const gender = toTextValue(doctor?.gender);
  const aboutMe = toTextValue(doctor?.about_me);
  // This keeps the numeric fields strict so incomplete numbers do not pass.
  const price = toNumberValue(doctor?.price);
  const yearsOfExperience = toNumberValue(doctor?.years_of_experience);

  // This only shows doctors whose public profile information is fully filled in.
  return Boolean(
    firstName &&
      lastName &&
      specialization &&
      city &&
      gender &&
      aboutMe &&
      Number.isFinite(price) &&
      Number.isFinite(yearsOfExperience),
  );
};
