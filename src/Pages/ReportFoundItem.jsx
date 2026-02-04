import React, { useState, useEffect } from "react";
import { Camera, UploadCloud, X, Loader2, BrainCircuit, Lock, CheckCircle, MapPin } from "lucide-react";
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

  // URL - Double-check if yours ends in 'm' or 'n' (Standard is 'n' usually)
  const BACKEND_URL = "https://findit-backend-n3fn.onrender.com/api/items/report";

  useEffect(() => {
    const electronicKeywords = ["phone", "iphone", "samsung", "laptop", "macbook", "ipad", "tablet", "airpods", "earbuds", "watch", "mobile"];
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
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 2000); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Auth Validation
    if (!auth.currentUser) { 
      alert("Please login first to report an item."); 
      return; 
    }

    // 2. Data Validation
    if (isElectronic && formData.imei.length !== 15) { 
      alert("⚠️ IMEI must be exactly 15 digits for electronic items."); 
      return; 
    }
    if (formData.contact.length !== 10) { 
      alert("⚠️ Contact number must be 10 digits."); 
      return; 
    }
    if (!imageFile) {
      alert("⚠️ Please upload a photo of the item.");
      return;
    }

    setLoading(true);

    // 3. Prepare Multipart Form Data
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description || "No description provided");
    data.append("location", formData.location);
    data.append("college", formData.college);
    data.append("contact", formData.contact);
    data.append("imei", isElectronic ? String(formData.imei) : "N/A");
    data.append("itemType", "found"); 
    data.append("userEmail", auth.currentUser.email);
    data.append("image", imageFile);

    try {
      // NOTE: Do NOT add 'Content-Type' header when sending FormData
      const response = await fetch(BACKEND_URL, { 
        method: 'POST', 
        body: data 
      });
      
      const result = await response.json();

      if (response.ok) {
        if (result.matchDetected) {
          setMatchData(result); 
        } else {
          alert(`✅ Published Successfully!`);
          navigate("/all-found");
        }
      } else {
        // This catches the 400 error and shows the backend's reason
        alert(`❌ Server Error: ${result.message || "Something went wrong"}`);
      }
    } catch (error) { 
      console.error("Submission error:", error);
      alert("❌ Could not connect to server. Check your internet or backend status."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <BrainCircuit size={14} /> AI-Powered Recognition Active
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4">
            Report <span className="text-indigo-600">Found</span> Item
          </h2>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          {/* Side Panel: Image Upload */}
          <div className="md:w-1/3 bg-slate-50 p-8 border-r border-slate-100">
            <h3 className="text-sm font-black uppercase text-slate-500 mb-6 flex items-center gap-2">
              <Camera size={18} /> Item Photo
            </h3>
            <div className="relative">
              {preview ? (
                <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-indigo-500 shadow-xl bg-slate-200">
                  <img src={preview} alt="Preview" className={`w-full h-full object-cover ${isScanning ? 'opacity-50 blur-sm' : 'opacity-100'} transition-all`} />
                  {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] animate-scan"></div>}
                  <button type="button" onClick={() => {setPreview(null); setImageFile(null);}} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"><X size={16} /></button>
                </div>
              ) : (
                <label className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
                  <UploadCloud size={48} className="text-slate-300 mb-2 group-hover:text-indigo-500 transition-colors" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Click to Upload</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} required />
                </label>
              )}
            </div>
          </div>

          {/* Form Panel */}
          <form onSubmit={handleSubmit} className="md:w-2/3 p-8 md:p-12 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">What did you find?</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 ring-indigo-500 outline-none" placeholder="e.g. Blue iPhone 13" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">College Location</label>
                <select name="college" value={formData.college} onChange={handleChange} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 ring-indigo-500 outline-none cursor-pointer" required>
                  <option value="">Select College</option>
                  {mumbaiColleges.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <input type="checkbox" id="elecCheck" checked={isElectronic} onChange={(e) => setIsElectronic(e.target.checked)} className="w-5 h-5 accent-indigo-600 rounded" />
                <label htmlFor="elecCheck" className="text-xs font-black uppercase text-slate-600 cursor-pointer">This is an electronic device</label>
            </div>

            {isElectronic && (
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-4">
                <label className="text-xs font-black uppercase text-indigo-600 flex items-center gap-2"><Lock size={14}/> 15-Digit IMEI / Serial Number</label>
                <input type="text" name="imei" value={formData.imei} maxLength="15" onChange={handleChange} className="w-full p-4 rounded-xl bg-white border border-indigo-200 outline-none focus:ring-2 ring-indigo-500 font-mono" placeholder="Enter 15 digits" required />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Specific Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 ring-indigo-500 outline-none" placeholder="e.g. Room 402, Canteen Table" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Your Contact Number</label>
              <input type="text" name="contact" value={formData.contact} maxLength="10" onChange={handleChange} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 ring-indigo-500 outline-none" placeholder="10-digit mobile number" required />
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Publish to Vault"}
            </button>
          </form>
        </div>
      </main>

      {/* Match Modal */}
      {matchData && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl border-4 border-indigo-500">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={60} />
            <h3 className="text-2xl font-black uppercase italic">Instant Match!</h3>
            <p className="text-slate-500 mt-2 mb-6">This item matches a lost report by:<br/><span className="font-bold text-slate-900">{matchData.matchedEmail}</span></p>
            <button onClick={() => navigate("/all-lost")} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest">Go to Lost Feed</button>
          </div>
        </div>
      )}

      <Footer />
      <style>{`
        @keyframes scan { 0% { top: 0% } 100% { top: 100% } }
        .animate-scan { animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
};

export default ReportFoundItem;