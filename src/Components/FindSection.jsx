import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import foundImage from "../assets/find.jpg";

const FoundSection = () => {
  const [show, setShow] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Animation triggers when section enters the viewport
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
      // Navigate to found items report page if logged in
      navigate("/found-items"); 
    } else {
      // Redirect to signup if not logged in
      navigate("/signup");
    }
  };

  return (
    <section
      id="found"
      className="w-full py-28 px-6 flex justify-center bg-white"
    >
      <div
        className={`bg-gray-50 rounded-4xl shadow-2xl max-w-6xl w-full
        flex flex-col md:flex-row-reverse items-center gap-12 p-8 md:p-12
        border border-gray-100 transition-all duration-1000 ease-out
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
      >
        {/* Image Container - Now identical in behavior to LostSection */}
        <div className="w-full md:w-1/2 group relative overflow-hidden rounded-2xl shadow-lg">
          <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
          <img
            src={foundImage}
            alt="Found item"
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
        </div>

        {/* Content Area */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
          <div className="inline-block px-4 py-1.5 mb-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold uppercase tracking-wider">
            Help Someone Today
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
            Found <span className="text-indigo-600">Items</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-md">
            Did you find a phone, wallet, or keys? Help a fellow student by 
            listing the item here. Your small act of kindness matters!
          </p>

          <div className="pt-4">
            <button
              onClick={handleAction}
              className="group relative px-10 py-4 text-lg font-bold rounded-full
              bg-indigo-600 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)]
              hover:bg-indigo-700 hover:shadow-[0_15px_30px_rgba(79,70,229,0.4)]
              hover:-translate-y-1 active:scale-95
              transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Report Found Item</span>
              {/* Shine effect animation */}
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundSection;