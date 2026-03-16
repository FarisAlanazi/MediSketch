import React from "react";
import HomePage from "./Pages/HomePage";
import Login from "./component/LoginComponents/Login";
import { Route, Routes, Link } from "react-router-dom";
import NavbarComponent from "./component/BoilerplateComponents/NavbarComponent";
import Register from "./component/RegisterComponent/Register";
import { ToastContainer } from "react-toastify";
import RegisterAsADoctor from "./component/RegisterComponent/RegisterAsADoctor";
import Doctors from "./component/FindDoctorPage/Doctors";
import RouteProtection from "./component/protectRoutes/RouteProtection";
import UserProfile from "./component/ProfileComponent/menuBAR_Elements/UserProfile";
import MainBar from "./component/ProfileComponent/menuBAR_Elements/MainBar";
import Appointments from "./component/ProfileComponent/menuBAR_Elements/appointments";
import Pending from "./component/ProfileComponent/menuBAR_Elements/Pending";
function App() {
  return (
    <>
      <ToastContainer position="top-center" />
      <NavbarComponent />{" "}
      {/*NavComponent will show up at all levels {Home page , Login page ... etc}*/}
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/doctor" element={<RegisterAsADoctor />} />

        <Route
          path="/findDoctor"
          element={
            <RouteProtection>
              <Doctors />
            </RouteProtection>
          }
        />

        <Route
          path="account"
          element={
            <RouteProtection>
              <MainBar />
            </RouteProtection>
          }
        >
          <Route
            path="profile"
            element={
              <RouteProtection>
                <UserProfile />
              </RouteProtection>
            }
          />
          <Route
            path="MyAppointments"
            element={
              <RouteProtection>
                <Appointments />
              </RouteProtection>
            }
          />
          <Route
            path="Pending"
            element={
              <RouteProtection>
                <Pending />
              </RouteProtection>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
