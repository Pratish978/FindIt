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
import LostItems from "./Pages/LostItem"; 
import FoundItems from "./Pages/FoundItems";
import MyReports from "./Pages/MyReports";
import AdminDashboard from "./Pages/AdminDashboard"; // Added Admin Import

// Protected Route Component
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/all-lost" element={<LostItems />} />
        <Route path="/all-found" element={<FoundItems />} />
        
        {/* --- Admin Route (with its own password protection) --- */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* --- Protected Routes --- */}
        <Route path="/report-lost" element={<ProtectedRoute><ReportLostItem /></ProtectedRoute>} />
        <Route path="/report-found" element={<ProtectedRoute><ReportFoundItem /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} /> 

        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;