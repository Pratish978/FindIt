import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Instagram, Github, Linkedin, ArrowUp } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#0f172a] text-slate-200 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Section */}
        <div className="space-y-6">
          <div 
            className="text-3xl font-bold cursor-pointer inline-block"
            onClick={scrollToTop}
          >
            Find<span className="text-blue-500">It</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-sm">
            Bridging the gap between lost belongings and their owners through 
            a secure, community-driven campus ecosystem.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-all duration-300">
              <Instagram size={18} />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-all duration-300">
              <Github size={18} />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-all duration-300">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6">Explore</h3>
          <ul className="space-y-4 text-slate-400">
            <li>
              <Link to="/" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-block">Home</Link>
            </li>
            <li>
              <Link to="/lost-items" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-block">Lost Items</Link>
            </li>
            <li>
              <Link to="/found-items" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-block">Found Items</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-blue-400 hover:translate-x-1 transition-all inline-block">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6">Support</h3>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer transition">Terms of Service</li>
            <li className="hover:text-white cursor-pointer transition">Safety Guidelines</li>
            <li className="hover:text-white cursor-pointer transition">FAQs</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <h3 className="text-white font-bold text-lg mb-6">Get in Touch</h3>
          <div className="space-y-4">
            <a 
              href="mailto:bhonglepratish@gmail.com" 
              className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition group"
            >
              <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-400">
                <Mail size={18} />
              </div>
              <span className="text-sm">bhonglepratish@gmail.com</span>
            </a>
            <div className="flex items-center gap-3 text-slate-400">
              <div className="p-2 bg-slate-800 rounded-lg">
                <MapPin size={18} />
              </div>
              <span className="text-sm">College Campus, Maharashtra, India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Find It. Crafted with care for students.</p>
        <button 
          onClick={scrollToTop}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
        >
          Back to top <ArrowUp size={16} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;