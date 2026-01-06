import React, { useState } from "react";
import { Camera, MapPin, User, UploadCloud, X, AlertCircle } from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import mumbaiColleges from "../data/MumbaiColleges"; 
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const ReportFoundItem = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file)); 
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
    data.append("itemType", "found"); // Critical: Mark as found
    data.append("userEmail", auth.currentUser?.email || "anonymous@student.com");
    
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      // Changed to localhost:5000 to match your backend setup
      const response = await fetch('http://localhost:5000/api/items/report', {
        method: 'POST',
        body: data, 
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("✅ Success! Your found item report has been published.");
        setFormData({ name: "", description: "", location: "", college: "", contact: "" });
        setImageFile(null);
        setPreview(null);
        
        // Redirect to Found Gallery
        navigate("/all-found");
      } else {
        alert(`❌ Failed: ${result.error || "Check backend connection"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Server not reached. Check if your backend is running on port 5000.");
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
            <span className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              Community Service
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-4">
              Report <span className="text-indigo-600">Found</span> Item
            </h2>
            <p className="text-slate-500">Help someone find what they've lost.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Section: Image Upload */}
            <div className="md:w-1/3 bg-slate-50 p-8 md:p-10 border-r border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Camera size={20} className="text-indigo-600" /> Item Photo
              </h3>
              
              <div className="relative group">
                {preview ? (
                  <div className="relative aspect-square rounded-4xl overflow-hidden border-2 border-indigo-500 shadow-lg">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => {setPreview(null); setImageFile(null);}} 
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-square rounded-4xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all group">
                    <UploadCloud size={40} className="text-slate-300 mb-3 group-hover:text-indigo-500 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-slate-400 uppercase text-center">
                      Upload <br/> Found Item
                    </p>
                    {/* Added webp and other formats */}
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp" 
                      className="hidden" 
                      onChange={handleImageChange} 
                    />
                  </label>
                )}
              </div>
              <p className="mt-6 text-[11px] text-slate-400 flex gap-2 leading-relaxed">
                <AlertCircle size={14} className="shrink-0 text-indigo-400" />
                Note: Don't show extremely valuable details (like cash inside a wallet) so you can verify the true owner.
              </p>
            </div>

            {/* Right Section: Form */}
            <form onSubmit={handleSubmit} className="md:w-2/3 p-8 md:p-12 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">What did you find?</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="e.g. Sony Headphones" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-transparent outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-600" /> College
                  </label>
                  <select 
                    name="college" 
                    value={formData.college} 
                    onChange={handleChange} 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-transparent outline-none appearance-none cursor-pointer focus:border-indigo-500" 
                    required
                  >
                    <option value="">Select Campus</option>
                    {mumbaiColleges.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Exact Discovery Spot</label>
                <input 
                  type="text" 
                  name="location" 
                  placeholder="e.g. Canteen Table or Room 402" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-transparent outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea 
                  name="description" 
                  rows="3" 
                  placeholder="Condition, color, any distinguishing marks..." 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-transparent outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 resize-none" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <User size={16} className="text-indigo-600" /> Your Contact Info
                </label>
                <input 
                  type="text" 
                  name="contact" 
                  placeholder="Phone number or Email" 
                  value={formData.contact} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-transparent outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publishing...
                  </div>
                ) : (
                  "Publish Found Item"
                )}
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