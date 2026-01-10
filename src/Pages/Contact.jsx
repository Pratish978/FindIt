import React, { useState } from "react";
import { Link } from "react-router-dom"; // Added this
import emailjs from "@emailjs/browser";
import { 
  Mail, 
  MapPin, 
  Send, 
  MessageSquare, 
  Loader2, 
  CheckCircle, 
  ShieldCheck 
} from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const SERVICE_ID = "service_dvcav7d"; 
  const TEMPLATE_ID = "template_znhipc8"; 
  const PUBLIC_KEY = "yGQvKRVl3H9XxkXk8";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      activity_type: "Support Inquiry",
      contact_info: formData.email,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Contact Error:", error);
      alert("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="pt-32 pb-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-4">
             <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
               Support Center
             </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
            Get in <span className="text-blue-600">Touch</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Have questions about a lost item or need help with your account? 
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-2xl font-black text-slate-800 mb-8">Details</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Us</p>
                    <a href="mailto:bhonglepratish@gmail.com" className="text-slate-700 font-bold hover:text-blue-600 transition-colors">
                      bhonglepratish@gmail.com
                    </a>
                  </div>
                </div>
                {/* ... other info cards ... */}
              </div>

              {/* MODIFIED FAQ LINK CARD */}
              <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="font-black text-xl mb-2">Need a quick fix?</p>
                  <p className="text-slate-400 text-sm mb-6 font-medium">Browse our library of common questions and tutorials.</p>
                  <Link 
                    to="/faq" 
                    className="block w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all text-center"
                  >
                    Open FAQ
                  </Link>
                </div>
                <div className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 transition-transform duration-700">
                  <ShieldCheck size={140} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
              {isSuccess && (
                <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                  <div className="bg-green-100 p-5 rounded-full text-green-600 mb-6">
                    <CheckCircle size={54} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2">Message Delivered</h3>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold" required />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold" required />
                  </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full p-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
                  <textarea name="message" rows="6" value={formData.message} onChange={handleChange} className="w-full p-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none font-bold resize-none" required />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full md:w-max px-14 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Send Message <Send size={20} /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;