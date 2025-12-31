import React, { useState, useEffect } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(false);

  // Slide-down animation on page load
  useEffect(() => {
    setShowNav(true);
  }, []);

  const handleLinkClick = () => {
    setMenuOpen(false); // Close mobile menu on link click
  };

  return (
    <nav
      className={`fixed w-full z-50 bg-white shadow-md px-6 md:px-24 py-4 flex items-center justify-between
      transform transition-all duration-700 ease-out
      ${showNav ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"}`}
    >
      {/* Logo */}
      <div className="text-4xl md:text-5xl font-bold cursor-pointer">
        Find<span className="text-blue-600">It</span>
      </div>

      {/* Mobile Menu Button */}
      <div
        className="md:hidden flex flex-col gap-1 cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="w-7 h-0.5 bg-black"></span>
        <span className="w-7 h-0.5 bg-black"></span>
        <span className="w-7 h-0.5 bg-black"></span>
      </div>

      {/* Nav Links */}
      <div
        className={`absolute md:static top-16 left-0 w-full md:w-auto bg-gray-100 md:bg-white
        flex flex-col md:flex-row gap-6 md:gap-10 items-center py-6 md:py-0
        transition-all duration-300
        ${menuOpen ? "block" : "hidden md:flex"}`}
      >
        {["Home", "Lost Items", "Found Items", "Contact", "Login", "SignUp"].map(
          (item, index) => (
            <a
              key={index}
              href={
                item === "Home"
                  ? "/"
                  : `/${item.toLowerCase().replace(" ", "-")}`
              }
              onClick={handleLinkClick}
              className="relative text-xl font-medium transition-all duration-300
              after:content-[''] after:absolute after:left-0 after:-bottom-2
              after:w-0 after:h-0.5 after:bg-blue-600
              after:transition-all after:duration-300 hover:after:w-full"
            >
              {item}
            </a>
          )
        )}
      </div>
    </nav>
  );
};

export default Navbar;
