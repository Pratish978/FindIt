import React, { useState } from "react";
import { Camera, MapPin, User, UploadCloud, X, AlertCircle, Sparkles } from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import mumbaiColleges from "../data/MumbaiColleges"; 
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const ReportLostItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    college: "",
    contact: "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // UI State for AI feel

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file)); 
      
      // Simulate AI Scanning Effect
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("location", formData.location);
    data.append("college", formData.college);
    data.append("contact", formData.contact);
    data.append("itemType", "lost"); 
    data.append("userEmail", auth.currentUser?.email || "anonymous@student.com");
    
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      const response = await fetch('http://localhost:5000/api/items/report', {
        method: 'POST',
        body: data, 
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Direct Success Flow
        setFormData({ name: "", description: "", location: "", college: "", contact: "" });
        setImageFile(null);
        setPreview(null);
        navigate("/all-lost");
      } else {
        alert(`❌ Error: ${result.error || "Please check your backend"}`);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("❌ Server not reached. Check if Node.js is running on Port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 w-fit mx-auto">
              <Sparkles size={12} /> Urgent Help
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-4 leading-tight">
              Report <span className="text-red-600">Lost</span> Item
            </h2>
            <p className="text-slate-500 font-medium">Your report will be live on the campus feed instantly.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Column: Image Upload */}
            <div className="md:w-1/3 bg-slate-50 p-8 md:p-10 border-r border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Camera size={20} className="text-red-600" /> Item Photo
              </h3>
              
              <div className="relative group">
                {preview ? (
                  <div className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-red-500 shadow-lg">
                    <img src={preview} alt="Preview" className={`w-full h-full object-contain transition-opacity ${isScanning ? 'opacity-40' : 'opacity-100'}`} />
                    

                    <button 
                      type="button"
                      onClick={() => {setPreview(null); setImageFile(null);}} 
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg active:scale-90"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all group shadow-inner">
                    <UploadCloud size={40} className="text-slate-300 mb-3 group-hover:text-red-500 transition-colors" />
                    <p className="text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">
                      Upload <br/> Item Image
                    </p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange} 
                    />
                  </label>
                )}
              </div>
              <div className="mt-8 p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-[11px] font-bold text-red-700 leading-relaxed flex gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  Visual evidence increases recovery chances by 80% on campus.
                </p>
              </div>
            </div>

            {/* Right Column: Form Inputs */}
            <form onSubmit={handleSubmit} className="md:w-2/3 p-8 md:p-12 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Item Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="e.g. Blue Dell Laptop" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all font-medium" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Campus</label>
                  <div className="relative">
                    <select 
                      name="college" 
                      value={formData.college} 
                      onChange={handleChange} 
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none appearance-none cursor-pointer focus:bg-white focus:border-red-500 transition-all font-medium" 
                      required
                    >
                      <option value="">Select College</option>
                      {mumbaiColleges.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                    <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Specific Location</label>
                <input 
                  type="text" 
                  name="location" 
                  placeholder="Where did you see it last?" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-red-500 transition-all font-medium" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Item Details</label>
                <textarea 
                  name="description" 
                  rows="3" 
                  placeholder="Color, brand, or any identifying marks..." 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-red-500 transition-all resize-none font-medium" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Your Contact</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="contact" 
                    placeholder="WhatsApp or Mobile" 
                    value={formData.contact} 
                    onChange={handleChange} 
                    className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-red-500 transition-all font-medium" 
                    required 
                  />
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-slate-200 hover:bg-red-600 hover:shadow-red-200 transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
              >
                {loading ? "Syncing Database..." : "Publish Report"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />

      {/* Adding custom keyframe for the AI scan bar */}
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ReportLostItem;