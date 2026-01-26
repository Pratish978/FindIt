import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, X, CheckCircle, Loader2, Lock, Send, Smartphone, AlertCircle } from "lucide-react";

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
  const [verificationError, setVerificationError] = useState(false);

  const SERVICE_ID = "service_dvcav7d"; 
  const TEMPLATE_ID = "template_znhipc8"; 
  const PUBLIC_KEY = "yGQvKRVl3H9XxkXk8"; 

  const categories = ["All", "Mobile Phone", "Laptop", "Keys", "Wallet", "Water Bottle", "Bag"];

  useEffect(() => {
    fetch('http://localhost:5000/api/items/all')
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

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setVerificationError(false);

    try {
      const category = (selectedItem.aiCategory || "").toLowerCase();
      const isElectronic = category.includes("phone") || category.includes("laptop") || selectedItem.name.toLowerCase().includes("iphone");
      
      if (isElectronic) {
        const verifyRes = await fetch(`http://localhost:5000/api/items/verify-claim/${selectedItem._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userInput: claimImei })
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          setVerificationError(true);
          setIsSubmitting(false);
          return; 
        }
      }

      const templateParams = {
        to_email: selectedItem.userEmail, 
        item_name: selectedItem.name,
        message: `VERIFIED CLAIM: Correct credentials provided.\n\nDescription: ${claimDescription}`,
        contact_info: ownerContact, 
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      setShowSuccess(true);
      
      setTimeout(() => {
        setSelectedItem(null);
        setShowSuccess(false);
        setClaimDescription(""); setOwnerContact(""); setClaimImei("");
      }, 3000);

    } catch (error) {
      alert("❌ System Error.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 text-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              Found <span className="text-indigo-600">Vault</span>
            </h1>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeFilter === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>{cat}</button>
              ))}
            </div>
          </div>

          {loading ? <Loader2 className="animate-spin mx-auto mt-20" size={48} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div key={item._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col relative group">
                  <div className="h-64 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-xl"></div>
                    <Lock size={40} className="text-indigo-500/30 relative z-10" />
                    <span className="absolute bottom-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase z-10">Identity Hidden</span>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={12}/> {item.location}</span>
                      <span className="text-indigo-600">{item.aiCategory}</span>
                    </div>
                    <h3 className="text-xl font-black mb-6">{item.name}</h3>
                    <button onClick={() => {setSelectedItem(item); setVerificationError(false);}} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-indigo-600 transition-all">Claim Item</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 relative">
            <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X size={24}/></button>
            {!showSuccess ? (
              <form onSubmit={handleClaimSubmit} className="space-y-5">
                <h2 className="text-2xl font-black uppercase italic tracking-tight">Ownership Proof</h2>
                {(selectedItem.aiCategory?.toLowerCase().includes("phone") || selectedItem.name.toLowerCase().includes("iphone") || selectedItem.aiCategory?.toLowerCase().includes("laptop")) && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2"><Smartphone size={14} /> IMEI / Serial</label>
                    <input required type="text" className={`w-full p-4 rounded-xl font-mono text-sm outline-none border ${verificationError ? 'border-red-500 bg-red-50' : 'border-indigo-100 bg-indigo-50'}`} placeholder="Enter ID" value={claimImei} onChange={(e)=>setClaimImei(e.target.value)} />
                    {verificationError && <p className="text-[9px] font-black text-red-500 uppercase">Invalid ID</p>}
                  </div>
                )}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Visual Description</label>
                    <textarea required placeholder="Unique marks..." className="w-full p-4 bg-slate-50 border rounded-2xl h-32 outline-none focus:border-indigo-600" value={claimDescription} onChange={(e)=>setClaimDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Your Contact</label>
                    <input required type="text" placeholder="Phone/Email" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={ownerContact} onChange={(e)=>setOwnerContact(e.target.value)} />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18}/> Verify & Notify</>}
                </button>
              </form>
            ) : (
              <div className="text-center py-10">
                <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
                <h3 className="text-3xl font-black uppercase italic">Match Confirmed!</h3>
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