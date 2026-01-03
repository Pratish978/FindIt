import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setShowNav(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const getInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  // Restored your nav items but changed paths to Gallery/Display pages
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Lost Items", path: "/all-lost" }, // Changed to browse page
    { name: "Found Items", path: "/all-found" }, // Changed to browse page
    { name: "Contact", path: "/contact" },
    ...(user ? [] : [
      { name: "Login", path: "/login" },
      { name: "SignUp", path: "/signup" }
    ])
  ];

  return (
    <>
      {/* Background Overlay for Mobile (Click to close) */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-45 md:hidden transition-opacity duration-300 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      <nav
        className={`fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-md px-6 md:px-24 py-4 flex items-center justify-between transform transition-all duration-700 ${
          showNav ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
        }`}
      >
        {/* Logo */}
        <div className="text-3xl md:text-4xl font-black cursor-pointer tracking-tighter" onClick={() => navigate("/")}>
          Find<span className="text-blue-600">It</span>
        </div>

        {/* Hamburger Menu Icon - Restored your exact custom CSS logic */}
        <div className="md:hidden flex flex-col gap-1.5 cursor-pointer z-60" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`w-7 h-1 bg-black transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2.5" : ""}`}></span>
          <span className={`w-7 h-1 bg-black transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}></span>
          <span className={`w-7 h-1 bg-black transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2.5" : ""}`}></span>
        </div>

        {/* Navigation Drawer - Restored your 60% Left Side Logic */}
        <div
          className={`absolute md:static top-0 left-0 w-[65%] md:w-auto h-screen md:h-auto bg-white md:bg-transparent
          flex flex-col md:flex-row gap-8 md:gap-10 items-start md:items-center justify-start md:justify-end
          p-10 md:p-0 transition-all duration-500 ease-in-out shadow-2xl md:shadow-none
          ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} md:flex`}
        >
          {/* Mobile Logo inside Drawer */}
          <div className="md:hidden text-2xl font-black mb-4 border-b pb-2 w-full">Menu</div>

          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className="text-xl md:text-lg font-bold text-slate-700 hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
            >
              {item.name}
            </Link>
          ))}

          {/* User Account Circle - Restored your exact circle logic */}
          {user && (
            <div 
              onClick={() => { navigate("/account"); setMenuOpen(false); }} 
              className="mt-4 md:mt-0 w-12 h-12 md:w-10 md:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold cursor-pointer hover:scale-110 transition shadow-lg border-2 border-white ring-2 ring-blue-50"
              title="My Account"
            >
              {getInitial()}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;