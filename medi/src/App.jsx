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
import AccountEntryContext from "./context/AccountEntryContext";
import DoctorMainBar from "./component/ProfileComponent/DoctorProfile/DoctorMainBar";
import DoctorProfile from "./component/ProfileComponent/DoctorProfile/DoctorProfile";
import DoctorAppointments from "./component/ProfileComponent/DoctorProfile/DoctorAppointments";
import DoctorPendingRequests from "./component/ProfileComponent/DoctorProfile/DoctorPendingRequests";
import DoctorDash from "./component/ProfileComponent/DoctorProfile/DrDashboard";
import DoctorDetails from "./component/FindDoctorPage/DoctorDetailsPage/DoctorDetails";
import DiscoverDoctorsMap from "./Pages/DiscoverDoctorsMap"; // Import the new map page so the old How it works slot can be replaced.

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
        <Route path="/viewAll" element={<DiscoverDoctorsMap />} />{/* Reuse the current visible navbar path for the new Discover Doctors on Map page. */}

        <Route path="/entry" element={<AccountEntryContext />} />
        <Route
          path="account"
          element={
            <RouteProtection>
              <MainBar />
            </RouteProtection>
          }
        >
          <Route index element={<UserProfile />} />
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

        <Route
          path="/doctor"
          element={
            <RouteProtection>
              <DoctorMainBar />
            </RouteProtection>
          }
        >
          <Route
            path="profile"
            element={
              <RouteProtection>
                <DoctorProfile />
              </RouteProtection>
            }
          />
          <Route
            path="appointments"
            element={
              <RouteProtection>
                <DoctorAppointments />
              </RouteProtection>
            }
          />
          <Route
            path="pending-requests"
            element={
              <RouteProtection>
                <DoctorPendingRequests />
              </RouteProtection>
            }
          />
          <Route
            path="dashboard"
            element={
              <RouteProtection>
                <DoctorDash />
              </RouteProtection>
            }
          />
        </Route>
        <Route path="DoctorDetails/:id" element={<DoctorDetails />} />
      </Routes>
    </>
  );
}

export default App;
