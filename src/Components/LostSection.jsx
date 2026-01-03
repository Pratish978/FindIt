import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Ensure this path is correct
import { useAuthState } from "react-firebase-hooks/auth";
import lostImage from "../assets/lost.jpg";

const LostSection = () => {
  const [show, setShow] = useState(false);
  const [user] = useAuthState(auth); // Check if user is logged in
  const navigate = useNavigate();

  useEffect(() => {
    // Intersection Observer to trigger animation when scrolled into view
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
      // If logged in, go to the report page
      // Note: Make sure your path in App.jsx is "/lost-items" or "/report-lost"
      navigate("/lost-items"); 
    } else {
      // If not logged in, go to sign up
      navigate("/signup");
    }
  };

  return (
    <section
      id="lost"
      className="w-full py-28 px-6 flex justify-center bg-gray-50/50"
    >
      <div
        className={`bg-white rounded-4xl shadow-2xl max-w-6xl w-full
        flex flex-col md:flex-row items-center gap-12 p-8 md:p-12
        border border-gray-100 transition-all duration-1000 ease-out
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
      >
        {/* Image Container with Hover Effect */}
        <div className="w-full md:w-1/2 group relative overflow-hidden rounded-2xl shadow-lg">
          <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
          <img
            src={lostImage}
            alt="Lost item"
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
        </div>

        {/* Content */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
          <div className="inline-block px-4 py-1.5 mb-2 rounded-full bg-blue-50 text-blue-600 text-sm font-bold uppercase tracking-wider">
            Reunite with your things
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
            Lost <span className="text-blue-600">Items</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-md">
            Misplaced your keys, bag, or electronics? Report your missing items 
            to our community database and let others help you find them.
          </p>

          <div className="pt-4">
            <button
              onClick={handleAction}
              className="group relative px-10 py-4 text-lg font-bold rounded-full
              bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]
              hover:bg-blue-700 hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)]
              hover:-translate-y-1 active:scale-95
              transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Report Lost Item</span>
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LostSection;