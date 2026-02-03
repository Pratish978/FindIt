import React, { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, Image as ImageIcon, Send, X, CheckCircle, Loader2, Search, Smartphone, AlertCircle, Lock } from "lucide-react";
import { API_BASE_URL } from "../config"; 

const LostItems = () => {
  const [items, setItems] = useState([]); 
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimMessage, setClaimMessage] = useState("");
  const [finderContact, setFinderContact] = useState("");
  const [foundImei, setFoundImei] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState(false);

  const SERVICE_ID = "service_dvcav7d"; 
  const TEMPLATE_ID = "template_znhipc8"; 
  const PUBLIC_KEY = "yGQvKRVl3H9XxkXk8"; 

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/items/all`)
      .then(res => res.json())
      .then(data => {
        const activeLost = data.filter(i => i.itemType === 'lost' && i.status !== 'recovered');
        setItems(activeLost.reverse());
        setFilteredItems(activeLost);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let results = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (activeFilter !== "All") results = results.filter(item => item.aiCategory === activeFilter);
    setFilteredItems(results);
  }, [searchTerm, items, activeFilter]);

  // Validation Logic for Numeric Inputs
  const handleNumericInput = (val, setter, length) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    if (cleaned.length <= length) setter(cleaned);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    
    // --- NEW VALIDATION LOGIC ---
    const category = (selectedItem.aiCategory || "").toLowerCase();
    const nameLower = selectedItem.name.toLowerCase();
    const isElectronic = category.includes("phone") || category.includes("laptop") || nameLower.includes("iphone") || nameLower.includes("macbook");

    // 1. Validate IMEI length if electronic
    if (isElectronic && foundImei.length !== 15) {
      alert("❌ Invalid IMEI: Ownership ID must be exactly 15 digits.");
      return;
    }

    // 2. Validate Finder Contact length (Assuming mobile number)
    if (finderContact.length !== 10) {
      alert("❌ Invalid Contact: Please enter a 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    setVerificationError(false);
    
    try {
      // 1. Backend Verification
      if (isElectronic) {
        const verifyRes = await fetch(`${API_BASE_URL}/api/items/verify-claim/${selectedItem._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userInput: foundImei })
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok || !verifyData.success) {
          setVerificationError(true);
          setIsSubmitting(false);
          return; 
        }
      }

      // 2. EmailJS Notification
      const templateParams = {
        to_email: selectedItem.userEmail, 
        item_name: selectedItem.name,
        message: `MATCH FOUND! Someone has found your ${selectedItem.name} and verified the ID.\n\nMessage: ${claimMessage}`,
        contact_info: finderContact, 
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      
      setShowSuccess(true);
      setTimeout(() => {
        setSelectedItem(null); 
        setShowSuccess(false);
        setClaimMessage(""); 
        setFinderContact(""); 
        setFoundImei("");
      }, 3000);

    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to process request.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* ... Header and Search code remains same ... */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Reported <span className="text-blue-600">Lost</span>
          </h1>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search item or location..." 
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:border-blue-500 outline-none transition-all font-medium" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {loading ? <Loader2 className="animate-spin mx-auto mt-20" size={48} /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-50 flex flex-col group hover:shadow-2xl transition-all duration-500">
                <div className="h-64 bg-slate-50 flex items-center justify-center relative">
                  {item.image ? (
                    <img src={item.image} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" alt={item.name} />
                  ) : (
                    <ImageIcon size={60} className="opacity-10" />
                  )}
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-blue-600 uppercase tracking-tighter shadow-sm">
                    {item.aiCategory}
                  </span>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 text-slate-400 mb-2 text-[10px] font-black uppercase tracking-widest">
                    <MapPin size={12} /> {item.location}
                  </div>
                  <h3 className="text-xl font-black mb-6 text-slate-900">{item.name}</h3>
                  <button 
                    onClick={() => {setSelectedItem(item); setVerificationError(false);}} 
                    className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-lg shadow-slate-100"
                  >
                    <Send size={16} /> I Have Found This
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-12 relative shadow-2xl">
            <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>
            
            {!showSuccess ? (
              <form onSubmit={handleClaimSubmit} className="space-y-6">
                <h2 className="text-3xl font-black uppercase italic leading-none tracking-tight">Verify Item</h2>
                
                {(selectedItem.aiCategory?.toLowerCase().includes("phone") || 
                  selectedItem.name.toLowerCase().includes("iphone") || 
                  selectedItem.aiCategory?.toLowerCase().includes("laptop")) && (
                  <div className={`p-6 rounded-[2rem] border-2 border-dashed transition-all ${verificationError ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-blue-50 border-blue-200'}`}>
                    <label className={`text-[10px] font-black uppercase flex items-center gap-2 mb-4 ${verificationError ? 'text-red-600' : 'text-blue-600'}`}>
                      <Lock size={16} /> Security: 15-Digit IMEI Required
                    </label>
                    <input 
                      required 
                      type="text" 
                      maxLength={15}
                      placeholder="Enter 15-digit ID" 
                      className="w-full p-4 bg-white border border-blue-100 rounded-xl font-mono text-sm outline-none focus:border-blue-500 transition-all" 
                      value={foundImei} 
                      onChange={(e) => handleNumericInput(e.target.value, setFoundImei, 15)} 
                    />
                    {verificationError && (
                      <p className="text-[9px] font-black text-red-500 uppercase mt-2 flex items-center gap-1">
                        <AlertCircle size={10}/> Verification Failed. Check the ID.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Message to Owner</label>
                  <textarea 
                    required 
                    placeholder="Where did you find it?" 
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl h-32 outline-none focus:border-blue-600 transition-all" 
                    value={claimMessage} 
                    onChange={(e) => setClaimMessage(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400">Your Contact (10 Digits)</label>
                   <input 
                    required 
                    type="text"
                    maxLength={10}
                    placeholder="e.g. 9876543210" 
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 transition-all" 
                    value={finderContact} 
                    onChange={(e) => handleNumericInput(e.target.value, setFinderContact, 10)} 
                   />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-sm flex items-center justify-center gap-3 shadow-lg hover:bg-slate-900 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Notify Owner</>}
                </button>
              </form>
            ) : (
              <div className="py-12 text-center">
                <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black uppercase italic leading-none">Match Verified!</h3>
                <p className="text-slate-400 mt-3 font-bold uppercase text-[10px] tracking-widest">Notification sent to owner.</p>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default LostItems;