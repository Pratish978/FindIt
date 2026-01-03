import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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

  const baseLinks = ["Home", "Lost Items", "Found Items", "Contact"];
  const navItems = user ? baseLinks : [...baseLinks, "Login", "SignUp"];

  return (
    <nav className={`fixed w-full z-50 bg-white shadow-md px-6 md:px-24 py-4 flex items-center justify-between transform transition-all duration-700 ${showNav ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"}`}>
      <div className="text-4xl font-bold cursor-pointer" onClick={() => navigate("/")}>
        Find<span className="text-blue-600">It</span>
      </div>

      <div className={`md:flex gap-10 items-center ${menuOpen ? "flex flex-col absolute top-16 left-0 w-full bg-white py-6" : "hidden"}`}>
        {navItems.map((item) => (
          <a key={item} href={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`} className="text-xl font-medium hover:text-blue-600 transition">
            {item}
          </a>
        ))}

        {user && (
          <div 
            onClick={() => navigate("/account")} 
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold cursor-pointer hover:scale-110 transition shadow-md border-2 border-white"
            title="My Account"
          >
            {getInitial()}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;