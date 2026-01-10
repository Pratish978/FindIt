import React, { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, Image as ImageIcon, Send, X, CheckCircle, Loader2, ShieldCheck, Search, Info } from "lucide-react";

const LostItems = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal & Email States
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimMessage, setClaimMessage] = useState("");
  const [finderContact, setFinderContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- CONFIGURATION ---
  const SERVICE_ID = "service_dvcav7d"; 
  const TEMPLATE_ID = "template_znhipc8"; 
  const PUBLIC_KEY = "yGQvKRVl3H9XxkXk8"; 

  useEffect(() => {
    fetch('http://localhost:5000/api/items/all')
      .then(res => res.json())
      .then(data => {
        const activeLost = data.filter(i => i.itemType === 'lost' && i.status !== 'recovered');
        const sortedItems = activeLost.reverse();
        setItems(sortedItems);
        setFilteredItems(sortedItems);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Handle Search
  useEffect(() => {
    const results = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(results);
  }, [searchTerm, items]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const templateParams = {
      to_email: selectedItem.userEmail, 
      name: selectedItem.userName || "Item Owner",
      item_name: selectedItem.name,
      activity_type: "Item Found Notification", 
      message: claimMessage,      
      contact_info: finderContact, 
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      setShowSuccess(true);
      
      setTimeout(() => {
        setSelectedItem(null);
        setShowSuccess(false);
        setClaimMessage("");
        setFinderContact("");
      }, 3000);
    } catch (error) {
      console.error("EmailJS Error:", error);
      alert("System busy. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4 bg-blue-50 w-fit px-4 py-1.5 rounded-full border border-blue-100">
                 <ShieldCheck className="text-blue-600 animate-pulse" size={16}/>
                 <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Active Recovery Feed</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                Reported <span className="text-blue-600">Lost</span>
              </h1>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Search items or locations..."
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 outline-none shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Safety Alert */}
          <div className="mb-10 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4 text-amber-800">
            <Info size={20} className="shrink-0" />
            <p className="text-sm font-medium">For your safety, always arrange item exchanges in public, well-lit campus areas or through campus security.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing campus vault...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[4rem] border border-slate-100">
               <ImageIcon className="mx-auto text-slate-200 mb-4" size={80} strokeWidth={1} />
               <p className="text-slate-500 font-bold text-xl uppercase tracking-tighter">No items found matching your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div key={item._id} className="bg-white rounded-[3rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 group flex flex-col hover:-translate-y-2 transition-all duration-500">
                  
                  {/* Image Section */}
                  <div className="relative h-72 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-300">
                        <ImageIcon size={60} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase mt-3 tracking-widest">Visual Missing</p>
                      </div>
                    )}
                    <div className="absolute bottom-5 left-5">
                      <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg uppercase tracking-widest">
                        Missing Since {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-blue-500 mb-4">
                      <MapPin size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.location}</span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                    <p className="text-slate-500 text-sm mb-8 line-clamp-3 font-medium leading-relaxed">{item.description}</p>
                    
                    <button 
                      onClick={() => setSelectedItem(item)} 
                      className="mt-auto w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                    >
                      <Send size={18} /> I Have Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECURE NOTIFICATION MODAL */}
          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !isSubmitting && setSelectedItem(null)}></div>
              
              <div className="relative bg-white w-full max-w-xl rounded-[3.5rem] p-12 shadow-2xl overflow-hidden border border-slate-100">
                {showSuccess ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={48} className="text-green-500 animate-bounce" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">Message Dispatched</h3>
                    <p className="text-slate-500 mt-3 font-medium">The owner will receive your contact details shortly.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 leading-none">Contact <span className="text-blue-600">Owner</span></h2>
                        <p className="text-slate-400 mt-2 text-sm font-medium">Helping find: {selectedItem.name}</p>
                      </div>
                      <button onClick={() => setSelectedItem(null)} className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
                        <X size={24} />
                      </button>
                    </div>

                    <form onSubmit={handleClaimSubmit} className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Contact Information</label>
                        <input 
                          required 
                          type="text" 
                          value={finderContact} 
                          onChange={(e) => setFinderContact(e.target.value)} 
                          placeholder="Phone number, Email, or Instagram" 
                          className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:border-blue-500 outline-none font-bold transition-all shadow-inner" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Recovery Details</label>
                        <textarea 
                          required 
                          value={claimMessage} 
                          onChange={(e) => setClaimMessage(e.target.value)} 
                          placeholder="Example: 'I found this near the library cafe. I've kept it safe, let me know when you can meet!'" 
                          className="w-full p-6 bg-slate-50 rounded-[2rem] border border-slate-100 focus:bg-white focus:border-blue-500 outline-none font-medium h-40 resize-none transition-all shadow-inner"
                        ></textarea>
                      </div>

                      <button 
                        disabled={isSubmitting} 
                        className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-blue-200"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Notify Owner Now"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LostItems;