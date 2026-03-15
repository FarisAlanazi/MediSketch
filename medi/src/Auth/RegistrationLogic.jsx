import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import api from "./Loginlogic";
async function Registration(user) {
  try {
    const response = await api.post("/users/", user);

    if (response.status === 201 || response.status === 200) {
      toast.success("your account has been created");
      return response.data;
    }

    toast.error("something went wrong");
  } catch (error) {
    toast.error(error.message || "failed to register!");
    throw error;
  }
}
export default Registration;
