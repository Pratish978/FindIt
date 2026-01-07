import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import lostImage from "../assets/lost.jpg";
import { AlertCircle, ArrowRight } from "lucide-react";

const LostSection = () => {
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

    const element = document.getElementById("lost");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const handleAction = () => {
    if (user) {
      // 1. Check if the user is "Real" (Email Verified)
      if (!user.emailVerified) {
        alert("Verification Required: Please check your email and click the verification link before reporting an item.");
        return;
      }
      
      // 2. Navigate to the correct route
      navigate("/report-lost"); 
    } else {
      // 3. Not logged in? Go to signup
      navigate("/signup");
    }
  };

  return (
    <section id="lost" className="w-full py-28 px-6 flex justify-center bg-gray-50/50">
      <div
        className={`bg-white rounded-[3rem] shadow-2xl max-w-6xl w-full
        flex flex-col md:flex-row items-center gap-12 p-8 md:p-12
        border border-slate-100 transition-all duration-1000 ease-out
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
      >
        {/* Image Container */}
        <div className="w-full md:w-1/2 group relative overflow-hidden rounded-4xl shadow-lg h-[450px]">
          <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
          <img
            src={lostImage}
            alt="Lost item"
            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Content */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-[0.2em]">
             Reunite with your things
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
            Lost <span className="text-blue-600">Items</span>
          </h2>

          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
            Misplaced your keys, bag, or electronics? Report your missing items 
            to our community database and let others help you find them.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAction}
              className="group flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold rounded-2xl
              bg-blue-600 text-white shadow-xl shadow-blue-200
              hover:bg-slate-900 hover:shadow-slate-200
              hover:-translate-y-1 active:scale-95
              transition-all duration-300"
            >
              Report Lost Item <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          {!user && (
            <p className="text-sm text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
              <AlertCircle size={14} /> You must be logged in to report
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default LostSection;