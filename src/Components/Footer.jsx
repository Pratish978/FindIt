import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Instagram, Linkedin, ArrowUp, ShieldCheck } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#0f172a] text-slate-200 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        
        {/* Brand Section */}
        <div className="space-y-8">
          <div 
            className="text-4xl font-black cursor-pointer tracking-tighter"
            onClick={scrollToTop}
          >
            Find<span className="text-blue-500">It</span>.
          </div>
          <p className="text-slate-400 leading-relaxed text-sm font-medium">
            The official campus recovery network. Bridging the gap between lost belongings and their owners through a secure, community-driven ecosystem.
          </p>
          <div className="flex gap-4">
            <a 
              href="https://www.instagram.com/bhonglepratish/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://www.linkedin.com/in/pratish-bhongle-a2b784324/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Navigation</h3>
          <ul className="space-y-4 text-slate-400 font-bold text-sm">
            <li>
              <Link to="/" className="hover:text-blue-400 transition-colors">Home Base</Link>
            </li>
            <li>
              <Link to="/all-lost" className="hover:text-blue-400 transition-colors">Lost Database</Link>
            </li>
            <li>
              <Link to="/all-found" className="hover:text-blue-400 transition-colors">Found Registry</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-blue-400 transition-colors">Support Center</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Platform</h3>
          <ul className="space-y-4 text-slate-400 font-bold text-sm">
            <li className="hover:text-white cursor-pointer transition">Privacy Protocol</li>
            <li className="hover:text-white cursor-pointer transition">Terms of Service</li>
            <li className="hover:text-white cursor-pointer transition">Safety Standards</li>
            <li className="hover:text-white cursor-pointer transition">Admin Portal</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Connectivity</h3>
          <div className="space-y-5">
            <a 
              href="mailto:bhonglepratish@gmail.com" 
              className="flex items-center gap-4 text-slate-400 hover:text-blue-400 transition group"
            >
              <div className="p-2.5 bg-slate-800/50 border border-slate-700 rounded-xl group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                <Mail size={18} />
              </div>
              <span className="text-sm font-bold">bhonglepratish@gmail.com</span>
            </a>
            <div className="flex items-center gap-4 text-slate-400">
              <div className="p-2.5 bg-slate-800/50 border border-slate-700 rounded-xl">
                <MapPin size={18} />
              </div>
              <span className="text-sm font-bold tracking-tight">College Campus, Maharashtra, India</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg w-fit">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Verified System</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto border-t border-slate-800/50 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">
        <p>© {new Date().getFullYear()} Find It. Built for a better campus experience.</p>
        <button 
          onClick={scrollToTop}
          className="group flex items-center gap-3 px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl hover:bg-slate-700 hover:text-white transition-all shadow-xl"
        >
          Return to Top <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;