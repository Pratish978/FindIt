import { useEffect, useState } from "react";

const HeroSection = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <section
      className={`min-h-[90vh] flex flex-col items-center justify-center text-center px-6
      transition-all duration-1000 ease-out
      ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      {/* Heading */}
      <h1 className="text-5xl md:text-7xl font-bold mb-6">
        Welcome to{" "}
        <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Find It
        </span>
      </h1>

      {/* Tagline */}
      <p className="text-xl md:text-2xl text-gray-600 mb-6">
        Your college’s official Lost & Found platform
      </p>

      {/* Description */}
      <p className="max-w-3xl text-lg md:text-xl text-gray-700 leading-relaxed mb-10">
        Misplaced something on campus? Or did you find an item that isn’t yours?
        <br />
        “Find It” makes it easy for students to report lost items, check found
        items, and reconnect belongings with their rightful owners.
        <br />
        <br />
        Start searching today and help your friends and classmates recover what’s
        missing!
      </p>

      {/* CTA Button */}
      <a
        href="#lost"
        className="px-8 py-4 text-lg font-semibold rounded-full
        bg-blue-600 text-white shadow-lg
        hover:bg-blue-700 hover:scale-105
        transition-all duration-300"
      >
        Get Started
      </a>
    </section>
  );
};

export default HeroSection;
