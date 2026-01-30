import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, X, CheckCircle, Loader2, Lock, Send, Smartphone, AlertCircle } from "lucide-react";
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
  const [verificationError, setVerificationError] = useState(false);

  const SERVICE_ID = "service_dvcav7d"; 
  const TEMPLATE_ID = "template_znhipc8"; 
  const PUBLIC_KEY = "yGQvKRVl3H9XxkXk8"; 

  const categories = ["All", "Mobile Phone", "Laptop", "Keys", "Wallet", "Water Bottle", "Bag"];

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/items/all`)
      .then(res => res.json())
      .then(data => {
        // Only show items reported as 'found' that haven't been recovered yet
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
      
      // Step 1: Verify via Backend for Electronic Items
      if (isElectronic) {
        const verifyRes = await fetch(`${API_BASE_URL}/api/items/verify-claim/${selectedItem._id}`, {
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

      // Step 2: If verification passes (or isn't electronic), send email to the finder
      const templateParams = {
        to_email: selectedItem.userEmail, 
        item_name: selectedItem.name,
        message: `OWNER FOUND: A user has claimed this item with verified credentials.\n\nDescription provided: ${claimDescription}`,
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
      }, 3000);

    } catch (error) {
      console.error("Claim Error:", error);
      alert("❌ System Error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 text-slate-900">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
              Found <span className="text-indigo-600">Vault</span>
            </h1>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveFilter(cat)} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeFilter === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Section */}
          {loading ? (
            <div className="flex justify-center mt-20">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div key={item._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col relative group">
                  {/* Vault Visual - Image Hidden for Privacy */}
                  <div className="h-64 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-xl"></div>
                    <Lock size={40} className="text-indigo-500/30 relative z-10" />
                    <span className="absolute bottom-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase z-10 tracking-widest">Identity Hidden</span>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={12}/> {item.location}</span>
                      <span className="text-indigo-600">{item.aiCategory}</span>
                    </div>
                    <h3 className="text-xl font-black mb-6 text-slate-900">{item.name}</h3>
                    <button 
                      onClick={() => {setSelectedItem(item); setVerificationError(false);}} 
                      className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-indigo-600 transition-all shadow-lg"
                    >
                      Claim Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-black uppercase text-sm tracking-widest">No items found in this category.</p>
            </div>
          )}
        </div>
      </main>

      {/* Claim Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 relative shadow-2xl overflow-hidden">
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={24}/>
            </button>

            {!showSuccess ? (
              <form onSubmit={handleClaimSubmit} className="space-y-5">
                <div className="mb-2">
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">Ownership Proof</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verifying: {selectedItem.name}</p>
                </div>

                {/* Verification Field for Electronics */}
                {(selectedItem.aiCategory?.toLowerCase().includes("phone") || 
                  selectedItem.name.toLowerCase().includes("iphone") || 
                  selectedItem.aiCategory?.toLowerCase().includes("laptop")) && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2">
                      <Smartphone size={14} /> Device IMEI / Serial Number
                    </label>
                    <input 
                      required 
                      type="text" 
                      className={`w-full p-4 rounded-xl font-mono text-sm outline-none border transition-all ${verificationError ? 'border-red-500 bg-red-50 animate-bounce' : 'border-indigo-100 bg-indigo-50 focus:border-indigo-600'}`} 
                      placeholder="Enter 15-digit ID" 
                      value={claimImei} 
                      onChange={(e)=>setClaimImei(e.target.value.replace(/[^0-9]/g, ''))} 
                    />
                    {verificationError && (
                      <p className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1">
                        <AlertCircle size={10}/> Invalid ID. Ownership could not be verified.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Visual Description</label>
                    <textarea 
                      required 
                      placeholder="Describe unique marks, stickers, or case details only the owner would know..." 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 outline-none focus:border-indigo-600 transition-all text-sm" 
                      value={claimDescription} 
                      onChange={(e)=>setClaimDescription(e.target.value)} 
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Your Contact Info</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Phone Number or Email" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm" 
                      value={ownerContact} 
                      onChange={(e)=>setOwnerContact(e.target.value)} 
                    />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-2 shadow-lg hover:bg-slate-900 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18}/> Verify & Notify Finder</>}
                </button>
              </form>
            ) : (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={48} className="text-green-500" />
                </div>
                <h3 className="text-3xl font-black uppercase italic leading-tight">Match Confirmed!</h3>
                <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">The finder has been notified of your claim.</p>
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