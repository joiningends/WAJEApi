import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/pages/login";
import Register from "./components/pages/register";
import Home from "./components/pages/home";
import ClientDetails from "./components/pages/tracking";
import CreateGroupUser from "./components/pages/createGroupUser";
import InstanceUserPage from "./components/pages/InstanceUserPage";
import NavigationBar from "./components/pages/NavigationBar";

function App() {
  // Retrieve the userRole from localStorage (you can modify this as needed)
  const userRole = localStorage.getItem("role");

  return (
    <Router>
      {userRole === "admin" || userRole === "user" ? <NavigationBar /> : null}
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {userRole === "admin" && (
          <>
            <Route path="/home" element={<Home />} />
            <Route path="/clients/:clientId" element={<ClientDetails />} />
          </>
        )}
        {userRole === "user" && (
          <>
            <Route path="/Contacts" element={<CreateGroupUser />} />
            <Route path="/textMessage/:userId" element={<InstanceUserPage />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
