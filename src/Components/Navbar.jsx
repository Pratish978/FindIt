import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, LayoutDashboard, ShieldCheck, User } from "lucide-react"; 

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ONLY THIS EMAIL CAN SEE THE ADMIN CONSOLE
  const ADMIN_EMAIL = "bhonglepratish@gmail.com"; 

  useEffect(() => {
    setShowNav(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await signOut(auth);
        setMenuOpen(false);
        navigate("/login");
      } catch (error) {
        console.error("Logout Error:", error);
      }
    }
  };

  const getInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Lost Items", path: "/all-lost" },
    { name: "Found Items", path: "/all-found" },
    { name: "Contact", path: "/contact" },
    ...(user ? [{ name: "My Reports", path: "/my-reports" }] : []),
    ...(user ? [] : [
      { name: "Login", path: "/login" },
      { name: "SignUp", path: "/signup" }
    ])
  ];

  // Logic to determine if current user is the admin
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      <nav
        className={`fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-md px-6 md:px-24 py-4 flex items-center justify-between transform transition-all duration-700 ${
          showNav ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
        }`}
      >
        {/* Brand Logo */}
        <div className="text-3xl md:text-4xl font-black cursor-pointer tracking-tighter" onClick={() => navigate("/")}>
          Find<span className="text-blue-600">It</span>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex flex-col gap-1.5 cursor-pointer z-[60]" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`w-7 h-1 bg-black transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2.5" : ""}`}></span>
          <span className={`w-7 h-1 bg-black transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}></span>
          <span className={`w-7 h-1 bg-black transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2.5" : ""}`}></span>
        </div>

        {/* Nav Links Container */}
        <div
          className={`absolute md:static top-0 left-0 w-[75%] md:w-auto h-screen md:h-auto bg-white md:bg-transparent
          flex flex-col md:flex-row gap-8 md:gap-10 items-start md:items-center justify-start md:justify-end
          p-10 md:p-0 transition-all duration-500 ease-in-out shadow-2xl md:shadow-none
          ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} md:flex`}
        >
          <div className="md:hidden text-2xl font-black mb-4 border-b pb-2 w-full text-slate-800 uppercase tracking-widest">Menu</div>

          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className="text-xl md:text-sm lg:text-base font-black text-slate-700 hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full uppercase tracking-widest"
            >
              {item.name}
            </Link>
          ))}

          {/* ADMIN LINK: Only visible to you */}
          {isAdmin && (
            <Link 
              to="/admin" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 group"
            >
              <ShieldCheck size={16} className="text-blue-400 group-hover:text-white transition-colors" />
              <span>Admin Console</span>
            </Link>
          )}

          {user && (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-6 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-none w-full md:w-auto">
              {/* Profile Avatar */}
              <div 
                onClick={() => { navigate("/account"); setMenuOpen(false); }} 
                className="group relative flex items-center gap-3 cursor-pointer"
              >
                <div className="w-12 h-12 md:w-10 md:h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100 border-2 border-white transition-transform group-hover:scale-110">
                  {getInitial()}
                </div>
                <div className="md:hidden">
                  <p className="font-black text-slate-800 text-sm tracking-tight">Account Settings</p>
                  <p className="text-slate-400 text-xs truncate w-32">{user.email}</p>
                </div>
              </div>

              {/* Logout */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest hover:text-red-700 transition-colors"
              >
                <LogOut size={18} />
                <span className="md:hidden lg:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;