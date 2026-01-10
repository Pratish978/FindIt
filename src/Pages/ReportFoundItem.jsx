import React, { useState } from "react";
import { Camera, MapPin, User, UploadCloud, X, AlertCircle, Sparkles, Loader2 } from "lucide-react";
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
  const [isScanning, setIsScanning] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large. Please select an image under 5MB.");
        return;
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file)); 
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser || !auth.currentUser.emailVerified) {
      alert("Please verify your email before publishing a found item.");
      navigate("/login");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("location", formData.location);
    data.append("college", formData.college);
    data.append("contact", formData.contact);
    data.append("itemType", "found"); 
    data.append("userEmail", auth.currentUser?.email || "anonymous@student.com");
    // Added for backend matching logic
    data.append("userName", auth.currentUser?.displayName || "Finder");
    
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      // POSTING TO BACKEND
      // The backend should now handle the "2-word match" check against "lost" items
      const response = await fetch('http://localhost:5000/api/items/report', {
        method: 'POST',
        body: data, 
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Notification logic: 
        // result.matchFound would be a boolean sent by your Node.js server
        if (result.matchFound) {
            alert("✅ Item Published! We found a potential match in our 'Lost' database and have notified the owner.");
        } else {
            alert("✅ Item Published! No immediate matches found; we'll notify you if someone claims it.");
        }

        setFormData({ name: "", description: "", location: "", college: "", contact: "" });
        setPreview(null);
        navigate("/all-found");
      } else {
        alert(`❌ Error: ${result.error || "Submission failed"}`);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("❌ Server Error. Please try again.");
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
            <span className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 w-fit mx-auto">
              <Sparkles size={12} /> Smart Verification Active
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-4 leading-tight">
              Report <span className="text-indigo-600">Found</span> Item
            </h2>
            <p className="text-slate-500 font-medium">Items are automatically cross-referenced with lost reports.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
            {/* Left Column */}
            <div className="md:w-1/3 bg-slate-50 p-8 md:p-10 border-r border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Camera size={20} className="text-indigo-600" /> Item Photo
              </h3>
              
              <div className="relative group">
                {preview ? (
                  <div className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-indigo-500 shadow-lg bg-slate-200">
                    <img src={preview} alt="Preview" className={`w-full h-full object-contain transition-opacity ${isScanning ? 'opacity-40' : 'opacity-100'}`} />
                    <button type="button" onClick={() => {setPreview(null); setImageFile(null);}} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg"><X size={18} /></button>
                  </div>
                ) : (
                  <label className="aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group shadow-inner">
                    <UploadCloud size={40} className="text-slate-300 mb-3 group-hover:text-indigo-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Upload <br/> Found Item</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Right Column */}
            <form onSubmit={handleSubmit} className="md:w-2/3 p-8 md:p-12 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Item Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">College</label>
                  <select name="college" value={formData.college} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none appearance-none cursor-pointer focus:bg-white font-medium" required>
                    <option value="">Select College</option>
                    {mumbaiColleges.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Discovery Spot</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white transition-all font-medium" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Item Details</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white transition-all resize-none font-medium" placeholder="E.g. Blue Milton bottle with a sticker" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Your Contact</label>
                <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white transition-all font-medium" required />
              </div>

              <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-indigo-600 transition-all disabled:opacity-70 flex items-center justify-center gap-3">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Publish Found Item"}
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