import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Account = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const getInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <Navbar />

      <section className="max-w-2xl mx-auto py-32 px-6">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">My Account</h2>
          
          <div className="flex flex-col items-center gap-4 mb-10 border-b pb-10">
            {/* Large User Circle */}
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-gray-50">
              {getInitial()}
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-700">
                {user?.displayName || "User"}
              </h3>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-bold text-blue-600 mb-2">My Reports</h4>
              <p className="text-gray-600">You haven't reported any items yet.</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-bold text-blue-600 mb-2">Settings</h4>
              <button 
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 font-medium transition"
              >
                Sign Out from App
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Account;