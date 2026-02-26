import React from "react";
import HomePage from "./Pages/HomePage";
import Login from "./component/LoginComponents/Login";
import { Route, Routes, Link } from "react-router-dom";
import NavbarComponent from "./component/BoilerplateComponents/NavbarComponent";
import Register from "./component/RegisterComponent/Register";
import { ToastContainer } from "react-toastify";
import RegisterAsADoctor from "./component/RegisterComponent/RegisterAsADoctor";

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
      </Routes>
    </>
  );
}

export default App;
