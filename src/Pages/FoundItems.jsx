import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, X, CheckCircle, Loader2, Lock, Send, Smartphone, ShieldCheck, Filter } from "lucide-react";
import { API_BASE_URL } from "../config"; 

const FoundItems = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimDescription, setClaimDescription] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  const [claimImei, setClaimImei] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const SERVICE_ID = "service_dvcav7d"; 
  const TEMPLATE_ID = "template_znhipc8"; 
  const PUBLIC_KEY = "yGQvKRVl3H9XxkXk8"; 

  const categories = ["All", "Mobile Phone", "Laptop", "Keys", "Wallet", "Water Bottle", "Bag"];

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/items/all`)
      .then(res => res.json())
      .then(data => {
        const activeFound = data.filter(i => i.itemType === 'found' && i.status !== 'recovered');
        setItems(activeFound.reverse());
        setFilteredItems(activeFound);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFilteredItems(activeFilter === "All" ? items : items.filter(i => i.aiCategory === activeFilter));
  }, [activeFilter, items]);

  const handleNumericInput = (val, setter, length) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    if (cleaned.length <= length) setter(cleaned);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/items/verify-claim/${selectedItem._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: claimImei })
      });
      const data = await res.json();

      const templateParams = {
        to_email: selectedItem.userEmail, 
        item_name: selectedItem.name,
        message: `A user is claiming an item you found.
        
Verification Comparison:
- ID in Records: ${data.storedImei || "N/A"}
- ID Claimant Entered: ${claimImei}

Claimant's Proof: ${claimDescription}`,
        contact_info: ownerContact, 
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      
      setShowSuccess(true);
      setTimeout(() => {
        setSelectedItem(null);
        setShowSuccess(false);
        setClaimDescription(""); 
        setOwnerContact(""); 
        setClaimImei("");
      }, 4000);
    } catch (error) {
      alert("❌ System Error.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-indigo-100">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em]">
                <ShieldCheck size={16} /> Secure Database
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-slate-900">
                Found <span className="text-indigo-600 drop-shadow-sm">Vault</span>
              </h1>
            </div>

            {/* Filter Pill UI */}
            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveFilter(cat)} 
                  className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all duration-300 ${
                    activeFilter === cat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Decrypting Vault...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredItems.map((item) => (
                <div 
                  key={item._id} 
                  className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col relative transition-all duration-500 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:-translate-y-2"
                >
                  {/* Image Placeholder with Identity Blur */}
                  <div className="h-72 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-slate-900 z-0"></div>
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    <Lock size={48} className="text-white/20 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                    
                    <div className="absolute top-6 right-6">
                       <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                         Private Asset
                       </span>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 z-10">
                       <div className="bg-indigo-600 text-white py-2 rounded-xl text-center text-[9px] font-black uppercase tracking-widest shadow-xl">
                         Verification Required
                       </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                        <MapPin size={14} className="text-indigo-500" /> {item.location}
                      </span>
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">
                        {item.aiCategory}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-8 leading-tight group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h3>
                    <button 
                      onClick={() => setSelectedItem(item)} 
                      className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-200"
                    >
                      Claim Ownership
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modern Modal Overlays */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl transition-opacity animate-in fade-in" onClick={() => setSelectedItem(null)}></div>
          
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 relative shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-slate-100 z-10 overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            
            <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 hover:rotate-90 transition-all duration-300"><X size={28}/></button>
            
            {!showSuccess ? (
              <form onSubmit={handleClaimSubmit} className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Vault Access</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase mt-1">Providing proof for: {selectedItem.name}</p>
                </div>

                {(selectedItem.aiCategory?.toLowerCase().includes("phone") || selectedItem.name.toLowerCase().includes("iphone") || selectedItem.aiCategory?.toLowerCase().includes("laptop")) && (
                  <div className="group space-y-2">
                    <label className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2 tracking-widest">
                      <Smartphone size={14} /> Device Identity (IMEI)
                    </label>
                    <input 
                      required 
                      type="text" 
                      inputMode="numeric" 
                      className="w-full p-5 rounded-2xl font-mono text-sm outline-none border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-600 transition-all shadow-inner" 
                      placeholder="Enter unique ID number" 
                      value={claimImei} 
                      onChange={(e) => handleNumericInput(e.target.value, setClaimImei, 15)} 
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ownership Evidence</label>
                  <textarea 
                    required 
                    placeholder="E.g. Lockscreen photo, unique marks, case color..." 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl h-36 outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner resize-none" 
                    value={claimDescription} 
                    onChange={(e)=>setClaimDescription(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Your Contact</label>
                  <input 
                    required 
                    type="text" 
                    inputMode="tel" 
                    placeholder="Enter 10-digit mobile" 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner" 
                    value={ownerContact} 
                    onChange={(e) => handleNumericInput(e.target.value, setOwnerContact, 10)} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-3 hover:bg-slate-900 transition-all duration-500 shadow-2xl shadow-indigo-200 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18}/> Submit Evidence</>}
                </button>
              </form>
            ) : (
              <div className="text-center py-14 space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-100 scale-150 rounded-full animate-pulse"></div>
                  <CheckCircle size={100} className="text-green-500 relative z-10" />
                </div>
                <div>
                  <h3 className="text-4xl font-black uppercase italic text-slate-900">Dispatched</h3>
                  <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">
                    The finder has been notified of your evidence.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  ); 
};

export default FoundItems;