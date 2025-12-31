import React, { useEffect, useState } from "react";
import foundImage from "../assets/find.jpg";

const FoundSection = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <section
      id="found"
      className="w-full py-28 px-6 flex justify-center bg-gray-100"
    >
      {/* White Container */}
      <div
        className={`bg-white rounded-3xl shadow-xl max-w-5xl w-300
        flex flex-col md:flex-row-reverse items-center gap-16
        p-12 md:p-20
        transition-all duration-1000 ease-out
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
      >
        {/* Image Wrapper (HEIGHT CONTROLLED) */}
        <div className="w-full md:h-100">
          <img
            src={foundImage}
            alt="Found item"
            className="w-full h-full object-cover rounded-3xl shadow-lg
            hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="text-center md:text-left md:w-[45%]">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Found Items
          </h2>

          <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
            Found something on campus? Submit the details here and help return
            it to its rightful owner.
          </p>

          <button
            className="px-10 py-4 text-lg font-semibold rounded-full
            bg-blue-600 text-white shadow-md
            hover:bg-blue-700 hover:scale-105
            transition-all duration-300"
          >
            Report Found Item
          </button>
        </div>
      </div>
    </section>
  );
};

export default FoundSection;
