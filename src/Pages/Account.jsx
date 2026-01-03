import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { LogOut, Package, Settings, Calendar, Mail, User } from "lucide-react";
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <Navbar />

      <main className="grow pt-24 pb-20">
        {/* Cover Header */}
        <div className="w-full h-48 bg-linear-to-r from-blue-600 to-indigo-700 shadow-inner"></div>

        <div className="max-w-4xl mx-auto px-6 -mt-24">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            
            {/* Profile Header Section */}
            <div className="p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-8 border-b border-slate-50">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-white transform transition-transform group-hover:scale-105">
                  {getInitial()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm" title="Active Account"></div>
              </div>

              <div className="grow space-y-2">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                  {user?.displayName || "User Account"}
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full text-sm">
                    <Mail size={16} className="text-blue-500" /> {user?.email}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full text-sm">
                    <Calendar size={16} className="text-blue-500" /> Joined {new Date(user?.metadata.creationTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-8 md:p-12 bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* My Reports Card */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Package size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">My Activity</h4>
                  <p className="text-slate-500 mb-6 leading-relaxed">
                    Track the items you've reported as lost or found across campus.
                  </p>
                  <div className="py-4 px-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 text-center font-medium">
                    No reports found yet
                  </div>
                </div>

                {/* Account Settings Card */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                    <Settings size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">Account Control</h4>
                  <p className="text-slate-500 mb-6 leading-relaxed">
                    Manage your profile security and session preferences.
                  </p>
                  
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition group">
                       <span className="flex items-center gap-3 text-slate-700 font-semibold">
                         <User size={18} className="text-slate-400 group-hover:text-blue-500" /> Edit Profile
                       </span>
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition group"
                    >
                       <span className="flex items-center gap-3 text-red-600 font-bold">
                         <LogOut size={18} className="group-hover:rotate-12 transition-transform" /> Sign Out
                       </span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;