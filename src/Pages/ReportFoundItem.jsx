import React, { useState, useEffect } from "react";
import { Camera, MapPin, User, Info, CheckCircle2, UploadCloud, ChevronDown } from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
// Default import for your MumbaiColleges data
import mumbaiColleges from "../data/MumbaiColleges"; 

const ReportFoundItem = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    college: "",
    contact: "",
    photo: null,
  });
  
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, photo: file });
        setPreview(URL.createObjectURL(file)); 
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Found Item Data:", formData);
    alert("Thank you for being helpful! Your found item report is now live.");
    
    // Reset Form
    setFormData({ name: "", description: "", location: "", college: "", contact: "", photo: null });
    setPreview(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              Community Service
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-4">
              Report <span className="text-indigo-600">Found</span> Item
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
              Help a fellow student by providing accurate details about the item you discovered on campus.
            </p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Sidebar: Image Upload */}
            <div className="md:w-1/3 bg-slate-50 p-8 md:p-10 border-r border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Camera size={20} className="text-indigo-600" /> Item Photo
              </h3>
              
              <label className="relative group cursor-pointer block">
                <div className={`aspect-square rounded-4xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
                  preview ? "border-indigo-600 bg-white shadow-md" : "border-slate-300 bg-white hover:border-indigo-400"
                }`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <UploadCloud size={40} className="mx-auto text-slate-300 mb-3 group-hover:text-indigo-500 transition-colors" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">
                        Upload <br /> Found Item
                      </p>
                    </div>
                  )}
                </div>
                <input type="file" name="photo" accept="image/*" onChange={handleChange} className="hidden" required />
              </label>

              <div className="mt-10 space-y-4">
                <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                  <p className="text-xs text-slate-600 leading-normal font-medium">
                    Try to take a photo where the item is clearly visible.
                  </p>
                </div>
                <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Info size={20} className="text-indigo-500 shrink-0" />
                  <p className="text-xs text-slate-600 leading-normal font-medium">
                    Do not hand over items to anyone without verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Form Details */}
            <form onSubmit={handleSubmit} className="md:w-2/3 p-8 md:p-12 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Item Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">What did you find?</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Black Sony Headphones"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                    required
                  />
                </div>

                {/* College Selection */}
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-600" /> Discovery College
                  </label>
                  <div className="relative">
                    <select
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer pr-10 text-slate-700"
                      required
                    >
                      <option value="">Select Campus</option>
                      {mumbaiColleges && mumbaiColleges.map((college, index) => (
                        <option key={index} value={college}>
                          {college}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                       <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Discovery Location */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Where exactly was it found?</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Bench near Canteen or Library Floor 2"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe the condition or any specific features (mention if you kept it with security)..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  required
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                  <User size={16} className="text-indigo-600" /> How should the owner contact you?
                </label>
                <input
                  type="text"
                  name="contact"
                  placeholder="Phone, Email, or Social Handle"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all duration-300 mt-4 flex items-center justify-center gap-2"
              >
                Publish Found Item
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportFoundItem;