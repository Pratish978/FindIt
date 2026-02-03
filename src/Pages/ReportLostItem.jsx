import React, { useState, useEffect } from "react";
import { Camera, UploadCloud, X, BrainCircuit, Lock, Loader2, CheckCircle } from "lucide-react";
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
    imei: "",
    specificDetails: "" 
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isElectronic, setIsElectronic] = useState(false);
  const [matchData, setMatchData] = useState(null);

  useEffect(() => {
    const electronicKeywords = ["phone", "iphone", "mobile", "samsung", "android", "pixel", "laptop", "macbook", "ipad", "tablet", "airpods", "earbuds", "watch", "camera"];
    const isDetected = electronicKeywords.some(k => formData.name.toLowerCase().includes(k));
    if (isDetected) setIsElectronic(true);
  }, [formData.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "imei" || name === "contact") {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
    if (!auth.currentUser) { alert("Please login to report an item."); return; }
    
    if (isElectronic && formData.imei.length !== 15) { alert("IMEI must be exactly 15 digits."); return; }
    if (formData.contact.length !== 10) { alert("Contact must be exactly 10 digits."); return; }

    setLoading(true);

    // Using explicit appends to ensure string integrity for the 15-digit ID
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description || "");
    data.append("location", formData.location);
    data.append("college", formData.college);
    data.append("contact", formData.contact);
    data.append("specificDetails", formData.specificDetails || "");
    
    // CRITICAL FIX: Ensure IMEI is sent as a clean string
    data.append("imei", String(formData.imei).trim());
    
    data.append("itemType", "lost"); 
    data.append("userEmail", auth.currentUser.email);
    data.append("userName", auth.currentUser.displayName || "Student");
    
    if (imageFile) data.append("image", imageFile);

    try {
      const response = await fetch('https://findit-backend-n3fm.onrender.com/api/items/report', { 
        method: 'POST', 
        body: data 
      });
      
      const result = await response.json();
      
      if (response.ok) {
        if (result.matchDetected) {
            setMatchData(result);
        } else {
            alert(`✅ Registered Successfully!`);
            navigate("/all-lost");
        }
      } else {
        alert(`❌ Error: ${result.message || "Failed to register"}`);
      }
    } catch (error) { 
      console.error("Submission Error:", error);
      alert("❌ Server connection error."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-2 w-fit mx-auto animate-pulse">
            <BrainCircuit size={14} /> AI-Powered Recognition Active
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 leading-tight">
            Report <span className="text-red-600">Lost</span> Item
          </h2>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          {/* Left Sidebar: Photo Upload */}
          <div className="md:w-1/3 bg-slate-50 p-8 md:p-10 border-r border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Camera size={20} className="text-red-600" /> Reference Photo <span className="text-red-500">*</span>
            </h3>
            <div className="relative group">
              {preview ? (
                <div className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-red-500 shadow-lg bg-slate-200">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  <button type="button" onClick={() => {setPreview(null); setImageFile(null);}} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"><X size={18} /></button>
                </div>
              ) : (
                <label className="aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all group shadow-inner">
                  <UploadCloud size={40} className="text-slate-300 mb-3 group-hover:text-red-500 transition-colors" />
                  <p className="text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Upload <br/> Item Photo</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} required />
                </label>
              )}
            </div>
            <p className="mt-6 text-[11px] text-slate-400 font-medium leading-relaxed italic">
              * Uploading a clear photo helps our AI match your item faster with found reports.
            </p>
          </div>

          {/* Right Section: Form */}
          <form onSubmit={handleSubmit} className="md:w-2/3 p-8 md:p-12 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Item Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} placeholder="e.g. iPhone 13" onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-red-500 transition-all font-medium" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">College <span className="text-red-500">*</span></label>
                <select name="college" value={formData.college} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none appearance-none cursor-pointer focus:bg-white font-medium" required>
                  <option value="">Select College</option>
                  {mumbaiColleges.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <input type="checkbox" id="isElectronic" checked={isElectronic} onChange={(e) => setIsElectronic(e.target.checked)} className="w-5 h-5 accent-red-600 rounded cursor-pointer" />
               <label htmlFor="isElectronic" className="text-xs font-black uppercase text-slate-600 cursor-pointer">This is an electronic device (Phone/Laptop)</label>
            </div>

            {isElectronic ? (
              <div className="space-y-3 p-4 bg-red-50 rounded-3xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                  <Lock size={14} /> Ownership Proof (15-Digit IMEI) <span className="text-red-500">*</span>
                </label>
                <input type="text" name="imei" value={formData.imei} maxLength="15" onChange={handleChange} className="w-full p-4 rounded-2xl bg-white border border-red-200 outline-none focus:border-red-500 transition-all font-mono text-sm" placeholder="Enter 15-digit IMEI" required />
                <p className="text-[9px] text-red-400 font-bold uppercase tracking-tight">Required for electronic verification</p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Specific Identifying Mark <span className="text-red-500">*</span></label>
                <input type="text" name="specificDetails" value={formData.specificDetails} placeholder="e.g. Red sticker on back, cracked corner" onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white transition-all font-medium" required />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Last Seen At <span className="text-red-500">*</span></label>
              <input type="text" name="location" value={formData.location} placeholder="Campus location, canteen, classroom..." onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white transition-all font-medium" required />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Your Contact (10 Digits) <span className="text-red-500">*</span></label>
              <input type="text" name="contact" value={formData.contact} maxLength="10" placeholder="e.g. 9876543210" onChange={handleChange} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-red-500 font-medium transition-all" required />
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-red-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-slate-900 transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-lg shadow-red-200">
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Register Lost Item"}
            </button>
          </form>
        </div>
      </main>

      {/* Match Notification Modal */}
      {matchData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white max-w-md w-full rounded-[3rem] p-10 text-center shadow-2xl border-4 border-red-500">
            <CheckCircle className="text-red-600 mx-auto mb-6" size={60} />
            <h3 className="text-3xl font-black uppercase leading-tight mb-2">Instant Match!</h3>
            <p className="text-slate-500 mb-8">We found a matching item already reported by: <br/> <span className="font-black text-slate-900 underline">{matchData.matchedEmail}</span></p>
            <button onClick={() => navigate("/all-found")} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all">Go to Found Vault</button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ReportLostItem;