import React, { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, Image as ImageIcon, Send, X, CheckCircle, Loader2, Search, Lock } from "lucide-react";
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
      // 1. Fetch the stored ID from backend
      const res = await fetch(`${API_BASE_URL}/api/items/verify-claim/${selectedItem._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: foundImei }) 
      });
      const data = await res.json();

      // 2. Prepare Email - NO MATCH/MISMATCH LOGIC
      const templateParams = {
        to_email: selectedItem.userEmail, 
        item_name: selectedItem.name,
        message: `A finder has contacted you regarding your item.
        
Verification Comparison:
- ID in Records: ${data.storedImei || "N/A"}
- ID Finder Entered: ${foundImei}
        
Finder's Message: ${claimMessage}`,
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
      alert("System error. Please check connection.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Reported <span className="text-blue-600">Lost</span>
          </h1>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {loading ? <Loader2 className="animate-spin mx-auto mt-20" size={48} /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-50 flex flex-col group hover:shadow-2xl transition-all duration-500">
                <div className="h-64 bg-slate-50 flex items-center justify-center relative">
                  {item.image ? <img src={item.image} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" alt={item.name} /> : <ImageIcon size={60} className="opacity-10" />}
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-blue-600 uppercase tracking-tighter shadow-sm">{item.aiCategory}</span>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 text-slate-400 mb-2 text-[10px] font-black uppercase tracking-widest"><MapPin size={12} /> {item.location}</div>
                  <h3 className="text-xl font-black mb-6 text-slate-900">{item.name}</h3>
                  <button onClick={() => setSelectedItem(item)} className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-lg shadow-slate-100"><Send size={16} /> I Have Found This</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-12 relative shadow-2xl">
            <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            {!showSuccess ? (
              <form onSubmit={handleClaimSubmit} className="space-y-6">
                <h2 className="text-3xl font-black uppercase italic leading-none tracking-tight">Notify Owner</h2>
                {(selectedItem.aiCategory?.toLowerCase().includes("phone") || selectedItem.name.toLowerCase().includes("iphone") || selectedItem.aiCategory?.toLowerCase().includes("laptop")) && (
                  <div className="p-6 rounded-[2rem] border-2 border-dashed bg-blue-50 border-blue-200">
                    <label className="text-[10px] font-black uppercase flex items-center gap-2 mb-4 text-blue-600"><Lock size={16} /> Verification: Provide Item ID/Serial</label>
                    <input required type="text" inputMode="numeric" placeholder="Enter the item's ID" className="w-full p-4 bg-white border border-blue-100 focus:border-blue-500 rounded-xl font-mono text-sm outline-none" value={foundImei} onChange={(e) => handleNumericInput(e.target.value, setFoundImei, 15)} />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Message to Owner</label>
                  <textarea required placeholder="Where did you find it?" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl h-32 outline-none focus:border-blue-600" value={claimMessage} onChange={(e) => setClaimMessage(e.target.value)} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400">Your Contact (10 Digits)</label>
                   <input required type="text" inputMode="tel" placeholder="Mobile number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600" value={finderContact} onChange={(e) => handleNumericInput(e.target.value, setFinderContact, 10)} />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-sm flex items-center justify-center gap-3 shadow-lg hover:bg-slate-900 transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Send Notification</>}
                </button>
              </form>
            ) : (
              <div className="py-12 text-center">
                <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black uppercase italic leading-none">Email Sent!</h3>
                <p className="text-slate-400 mt-3 font-bold uppercase text-[10px] tracking-widest">The owner has been notified of your message.</p>
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