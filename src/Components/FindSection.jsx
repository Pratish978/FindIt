import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import foundImage from "../assets/find.jpg";
import { ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

const FoundSection = () => {
  const [show, setShow] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShow(true);
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("found");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const handleAction = () => {
    if (user) {
      // 🛡️ Security Check: Ensure they verified their email
      if (!user.emailVerified) {
        alert("Verification Required: Please check your inbox and verify your email before reporting found items.");
        return;
      }
      // Matches the path in App.jsx
      navigate("/report-found"); 
    } else {
      // Redirect to signup if not logged in
      navigate("/signup");
    }
  };

  return (
    <section id="found" className="w-full py-28 px-6 flex justify-center bg-white">
      <div
        className={`bg-slate-50 rounded-[3rem] shadow-2xl max-w-6xl w-full
        flex flex-col md:flex-row-reverse items-center gap-12 p-8 md:p-12
        border border-slate-100 transition-all duration-1000 ease-out
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
      >
        {/* Image Container */}
        <div className="w-full md:w-1/2 group relative overflow-hidden rounded-4xl shadow-lg h-112.5">
          <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
          <img
            src={foundImage}
            alt="Found item"
            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Content Area */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={14} /> Help Someone Today
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
            Found <span className="text-indigo-600">Items</span>
          </h2>

          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
            Did you find a phone, wallet, or keys? Help a fellow student by 
            listing the item here. Your small act of kindness matters!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAction}
              className="group flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold rounded-2xl
              bg-indigo-600 text-white shadow-xl shadow-indigo-100
              hover:bg-slate-900 hover:shadow-slate-200
              hover:-translate-y-1 active:scale-95
              transition-all duration-300"
            >
              Report Found Item <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {!user && (
            <p className="text-sm text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
              <AlertCircle size={14} /> Authentication required to list items
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FoundSection;