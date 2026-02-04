import React, { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, Image as ImageIcon, Send, X, CheckCircle, Loader2, Search, Lock, Radio } from "lucide-react";
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

  const handleNumericInput = (val, setter, length) => {
    const cleaned = val.replace(/[^0-9]/g, ''); 
    if (cleaned.length <= length) setter(cleaned);
  };

  const handleClaimSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/items/verify-claim/${selectedItem._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: foundImei }) 
      });
      const data = await res.json();

      // --- EXACT MAIL FORMAT UPDATED HERE ---
      const templateParams = {
        to_email: selectedItem.userEmail, 
        name: "Owner", 
        item_name: selectedItem.name,
        message: `${data.matchStatus || "A potential match was found."}\n\nFinder's Note: ${claimMessage}`, 
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
      }, 4000);

    } catch (error) {
      console.error("Submission error:", error);
      alert("Notification failed. Please check your connection.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header UI remains exactly the same */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
              <Radio size={16} className="animate-pulse" /> Live Vault
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-slate-900">
              Reported <span className="text-blue-600">Lost</span>
            </h1>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search lost items..." 
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm outline-none focus:border-blue-600 transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Accessing Vault...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredItems.map((item) => (
              <div key={item._id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-50 flex flex-col transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                <div className="h-72 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                  {item.image ? (
                    <img src={item.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                  ) : (
                    <ImageIcon size={60} className="opacity-10" />
                  )}
                  <span className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-blue-600 uppercase shadow-sm">
                    {item.aiCategory}
                  </span>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-3 text-[10px] font-black uppercase tracking-widest">
                    <MapPin size={14} className="text-blue-500" /> {item.location}
                  </div>
                  <h3 className="text-2xl font-black mb-8 text-slate-900 leading-tight">
                    {item.name}
                  </h3>
                  <button 
                    onClick={() => setSelectedItem(item)} 
                    className="mt-auto w-full py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all duration-300"
                  >
                    <Send size={16} /> I Have Found This
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CLAIM MODAL UI remains exactly the same */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-all">
              <X size={28} />
            </button>
            
            {!showSuccess ? (
              <form onSubmit={handleClaimSubmit} className="space-y-6">
                <div>
                  <h2 className="text-3xl font-black uppercase italic text-slate-900">Notify Owner</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase">Item: {selectedItem.name}</p>
                </div>

                {(selectedItem.aiCategory?.toLowerCase().includes("phone") || 
                  selectedItem.name.toLowerCase().includes("iphone") || 
                  selectedItem.aiCategory?.toLowerCase().includes("laptop")) && (
                  <div className="p-6 rounded-[2rem] border-2 border-dashed bg-blue-50 border-blue-100">
                    <label className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2 mb-4 tracking-widest">
                      <Lock size={14} /> Item Identity (Serial/IMEI)
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Enter ID for owner verification" 
                      className="w-full p-4 bg-white border border-blue-100 rounded-xl font-mono text-sm outline-none" 
                      value={foundImei} 
                      onChange={(e) => handleNumericInput(e.target.value, setFoundImei, 15)} 
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Found at (Location)</label>
                  <textarea 
                    required 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl h-24 outline-none focus:bg-white focus:border-blue-600 transition-all resize-none" 
                    value={claimMessage} 
                    onChange={(e) => setClaimMessage(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Your Phone Number</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="10-digit mobile" 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-blue-600" 
                    value={finderContact} 
                    onChange={(e) => handleNumericInput(e.target.value, setFinderContact, 10)} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-3 hover:bg-slate-900 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Notify Owner</>}
                </button>
              </form>
            ) : (
              <div className="text-center py-14 space-y-6">
                <CheckCircle size={100} className="text-green-500 mx-auto" />
                <h3 className="text-4xl font-black uppercase italic text-slate-900">Report Sent</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  The owner has been notified. They will contact you shortly.
                </p>
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