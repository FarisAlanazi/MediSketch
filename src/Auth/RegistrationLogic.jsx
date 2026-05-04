import { toast } from "react-toastify";
import api from "./Loginlogic";
import i18n from "../i18n";
async function Registration(user) {
  try {
    const response = await api.post("/users/", user);

    if (response.status === 201 || response.status === 200) {
      toast.success(i18n.t("auth.accountCreated"));

      return response.data;
    }

    toast.error(i18n.t("auth.genericError"));
  } catch (error) {
    toast.error(error.message || i18n.t("auth.registrationError"));
    throw error;
  }
}
export default Registration;
