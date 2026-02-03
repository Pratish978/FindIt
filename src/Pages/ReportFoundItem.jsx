import React, { useState, useEffect } from "react";
import { Camera, UploadCloud, X, Loader2, BrainCircuit, Lock, CheckCircle } from "lucide-react";
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
    imei: "" 
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isElectronic, setIsElectronic] = useState(false);
  const [matchData, setMatchData] = useState(null); 

  // Auto-detect if item is electronic based on name
  useEffect(() => {
    const electronicKeywords = ["phone", "iphone", "samsung", "laptop", "macbook", "ipad", "tablet", "airpods", "earbuds", "watch", "mobile"];
    const isDetected = electronicKeywords.some(k => formData.name.toLowerCase().includes(k));
    if (isDetected) setIsElectronic(true);
  }, [formData.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Strict numeric filtering for IMEI and Contact
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
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 2000); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) { alert("Please login first."); return; }

    // Logic Validations
    if (isElectronic && formData.imei.length !== 15) { 
      alert("⚠️ Verification ID (IMEI) must be exactly 15 digits."); 
      return; 
    }
    if (formData.contact.length !== 10) { 
      alert("⚠️ Contact must be exactly 10 digits."); 
      return; 
    }

    setLoading(true);

    // Prepare Multipart Form Data
    const data = new FormData();
    
    // Explicitly append fields to ensure type safety
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("location", formData.location);
    data.append("college", formData.college);
    data.append("contact", formData.contact);
    
    // IMPORTANT: Send IMEI as a clean string to avoid scientific notation bugs
    data.append("imei", String(formData.imei).trim());
    
    data.append("itemType", "found"); 
    data.append("userEmail", auth.currentUser?.email);
    
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      const response = await fetch('https://findit-backend-n3fm.onrender.com/api/items/report', { 
        method: 'POST', 
        body: data // Fetch automatically sets content-type to multipart/form-data
      });
      
      const result = await response.json();

      if (response.ok) {
        if (result.matchDetected) {
            setMatchData(result); // Trigger the "Owner Found" Modal
        } else {
            alert(`✅ Published Successfully!`);
            navigate("/all-found");
        }
      } else {
        alert(`❌ Error: ${result.message || "Upload failed"}`);
      }
    } catch (error) { 
      console.error("Submission error:", error);
      alert("❌ Server Connection Error."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-2 w-fit mx-auto animate-pulse">
            <BrainCircuit size={14} /> AI-Powered Recognition Active
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 leading-tight">
            Report <span className="text-indigo-600">Found</span> Item
          </h2>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar / Photo Upload */}
          <div className="md:w-1/3 bg-slate-50 p-8 md:p-10 border-r border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Camera size={20} className="text-indigo-600" /> Item Photo <span className="text-red-500">*</span>
            </h3>
            <div className="relative group">
              {preview ? (
                <div className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-indigo-500 shadow-lg bg-slate-200">
                  <img src={preview} alt="Preview" className={`w-full h-full object-cover transition-opacity ${isScanning ? 'opacity-40 blur-sm' : 'opacity-100'}`} />
                  {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_#6366f1] z-20 animate-scan"></div>}
                  <button type="button" onClick={() => {setPreview(null); setImageFile(null);}} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl shadow-lg"><X size={18} /></button>
                </div>
              ) : (
                <label className="aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group shadow-inner">
                  <UploadCloud size={40} className="text-slate-300 mb-3 group-hover:text-indigo-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Upload <br/> Found Photo</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} required />
                </label>
              )}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="md:w-2/3 p-8 md:p-12 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Item Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} placeholder="What did you find?" onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium" required />
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
                <input type="checkbox" id="isElectronicFound" checked={isElectronic} onChange={(e) => setIsElectronic(e.target.checked)} className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
                <label htmlFor="isElectronicFound" className="text-xs font-black uppercase text-slate-600 cursor-pointer">This is an electronic device</label>
            </div>

            {isElectronic && (
              <div className="space-y-3 p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <Lock size={14} /> Security: 15-Digit IMEI/Serial <span className="text-red-500">*</span>
                </label>
                <input type="text" name="imei" value={formData.imei} maxLength="15" onChange={handleChange} className="w-full p-4 rounded-2xl bg-white border border-indigo-200 outline-none focus:border-indigo-500 transition-all font-mono text-sm" placeholder="15-digit identifier" required />
                
                <div className="pt-2 border-t border-indigo-100 mt-2">
                  <p className="text-[10px] text-indigo-500 font-black uppercase mb-2 tracking-tighter">Guide:</p>
                  <div className="grid grid-cols-1 gap-1.5 text-[9px] font-bold text-slate-600 leading-tight uppercase">
                    <p>1. Dial <span className="text-indigo-600 underline">*#06#</span> to view IMEI</p>
                    <p>2. Check <span className="text-indigo-600">Battery Compartment</span> or <span className="text-indigo-600">Settings</span></p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Found At <span className="text-red-500">*</span></label>
              <input type="text" name="location" value={formData.location} placeholder="Campus location, canteen, etc." onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white transition-all font-medium" required />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Your Contact (10 Digits) <span className="text-red-500">*</span></label>
              <input type="text" name="contact" value={formData.contact} maxLength="10" placeholder="Mobile number" onChange={handleChange} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-indigo-500 transition-all" required />
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-indigo-600 transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-lg">
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Publish Found Item"}
            </button>
          </form>
        </div>
      </main>

      {/* Instant Match Modal */}
      {matchData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white max-w-md w-full rounded-[3rem] p-10 text-center shadow-2xl border-4 border-indigo-500">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-3xl font-black uppercase italic leading-tight mb-2">Instant Match!</h3>
            <p className="text-slate-500 font-medium mb-8">
              The ID matches a lost report. You can notify the owner directly:
              <span className="block mt-2 font-black text-slate-900 underline">{matchData.matchedEmail}</span>
            </p>
            <button onClick={() => navigate("/all-lost")} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all">Go to Lost Feed</button>
          </div>
        </div>
      )}

      <Footer />
      <style>{`
        @keyframes scan { 0% { top: 0% } 100% { top: 100% } } 
        .animate-scan { animation: scan 2s linear infinite; position: absolute; width: 100%; }
      `}</style>
    </div>
  );
};

export default ReportFoundItem;