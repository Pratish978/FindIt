import React, { useState } from "react";
import { Camera, MapPin, User, UploadCloud, X, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
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
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic size validation (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large. Please select an image under 5MB.");
        return;
      }
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
    data.append("itemType", "found"); 
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
        setIsSuccess(true);
        // Show success animation for 2 seconds before navigating
        setTimeout(() => {
          navigate("/all-found");
        }, 2500);
      } else {
        alert(`❌ Error: ${result.error || "Submission failed"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Connectivity Error: Is your backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center">
          <div className="relative inline-block">
            <CheckCircle2 size={120} className="text-green-500 animate-[bounce_1s_infinite]" />
            <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" size={32} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mt-8 mb-2">Item Published!</h2>
          <p className="text-slate-500 font-medium">Redirecting you to the Found Gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full mb-4 border border-indigo-100">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Community Action</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Report <span className="text-indigo-600">Found</span> Item
            </h2>
            <p className="text-slate-500 text-lg">Help a fellow student by reporting what you've discovered.</p>
          </div>

          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-indigo-100">
            
            {/* Left Column: Visuals */}
            <div className="md:w-1/3 bg-slate-50 p-8 md:p-10 border-r border-slate-100">
              <div className="sticky top-10">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Camera size={20} className="text-indigo-600" /> Item Photo
                </h3>
                
                <div className="relative group">
                  {preview ? (
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => {setPreview(null); setImageFile(null);}} 
                        className="absolute top-3 right-3 p-2 bg-red-500/90 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-square rounded-[2rem] border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group shadow-inner">
                      <div className="p-6 bg-slate-50 rounded-full group-hover:bg-indigo-100 transition-colors">
                        <UploadCloud size={32} className="text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:scale-110" />
                      </div>
                      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Drop Image or <br/> <span className="text-indigo-600">Browse</span>
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

                <div className="mt-8 p-5 bg-yellow-50 rounded-2xl border border-yellow-100">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="shrink-0 text-yellow-600" />
                    <div>
                      <p className="text-xs font-bold text-yellow-800 uppercase tracking-tight mb-1">Privacy Advice</p>
                      <p className="text-[11px] text-yellow-700 leading-relaxed font-medium">
                        Omit one key detail (like a specific keychain or serial number). Use this to verify the owner later.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form Logic */}
            <form onSubmit={handleSubmit} className="md:w-2/3 p-8 md:p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Item Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="e.g. Blue Water Bottle" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Campus Location</label>
                  <div className="relative">
                    <select 
                      name="college" 
                      value={formData.college} 
                      onChange={handleChange} 
                      className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:bg-white transition-all font-medium pr-10" 
                      required
                    >
                      <option value="">Select College</option>
                      {mumbaiColleges.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Discovery Spot</label>
                <input 
                  type="text" 
                  name="location" 
                  placeholder="e.g. Near Library Gate or Table 5 in Canteen" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Distinguishing Features</label>
                <textarea 
                  name="description" 
                  rows="3" 
                  placeholder="Describe colors, stickers, or current condition..." 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium resize-none" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  Public Contact Info
                </label>
                <input 
                  type="text" 
                  name="contact" 
                  placeholder="Where can the owner reach you?" 
                  value={formData.contact} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-5 bg-slate-900 text-white font-black text-lg rounded-[2rem] shadow-xl hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Publish to Gallery <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                  </div>
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