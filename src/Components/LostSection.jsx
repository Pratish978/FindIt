import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- import
import lostImage from "../assets/lost.jpg";

const LostSection = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate(); // <-- hook

  useEffect(() => {
    setShow(true);
  }, []);

  const goToReportLost = () => {
    navigate("/report-lost"); // <-- navigate to ReportLostItem page
  };

  return (
    <section
      id="lost"
      className="w-full py-28 px-6 flex justify-center bg-gray-100"
    >
      <div
        className={`bg-white rounded-3xl shadow-xl max-w-5xl w-full
        flex flex-col md:flex-row items-center gap-12 p-10 md:p-16
        transition-all duration-1000 ease-out
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
      >
        {/* Image */}
        <img
          src={lostImage}
          alt="Lost item"
          className="w-full md:w-1/2 rounded-2xl shadow-md
          hover:scale-105 transition-transform duration-500"
        />

        {/* Content */}
        <div className="text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Lost Items
          </h2>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            If you lost something, report it here and help us return it to you.
          </p>

          <button
            onClick={goToReportLost} // <-- navigate on click
            className="px-8 py-4 text-lg font-semibold rounded-full
            bg-blue-600 text-white shadow-md
            hover:bg-blue-700 hover:scale-105
            transition-all duration-300"
          >
            Report Lost Item
          </button>
        </div>
      </div>
    </section>
  );
};

export default LostSection;
