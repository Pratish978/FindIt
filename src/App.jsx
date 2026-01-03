import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Home from "./Pages/Home";
import ReportLostItem from "./Pages/ReportLostItem";
import ReportFoundItem from "./Pages/ReportFoundItem";
import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Account from "./Pages/Account";

// Protected Route Component
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected - User must be logged in */}
        <Route path="/lost-items" element={<ProtectedRoute><ReportLostItem /></ProtectedRoute>} />
        <Route path="/found-items" element={<ProtectedRoute><ReportFoundItem /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;