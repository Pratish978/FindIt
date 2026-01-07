import React, { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, Search, Image as ImageIcon, Send, X, CheckCircle, Loader2, ShieldCheck } from "lucide-react";

const LostItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
        // Filter only LOST items that are still ACTIVE
        const activeLost = data.filter(i => i.itemType === 'lost' && i.status !== 'recovered');
        setItems(activeLost.reverse());
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const templateParams = {
      to_email: selectedItem.userEmail, 
      item_name: selectedItem.name,
      finder_contact: finderContact,
      message: claimMessage,
      location: selectedItem.location
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
      alert("System busy. Please verify your EmailJS keys.");
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
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
               <ShieldCheck className="text-blue-600" size={20}/>
               <span className="text-blue-600 text-xs font-black uppercase tracking-widest">Secure Community Gallery</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900">Reported <span className="text-blue-600">Lost</span></h1>
            <p className="text-slate-500 mt-4 text-lg font-medium">Have you found one of these? Contact owners securely here.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing with campus vault...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
               <ImageIcon className="mx-auto text-slate-200 mb-4" size={64} />
               <p className="text-slate-500 font-bold">No lost reports at the moment. Everything seems to be in its place!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {items.map((item) => (
                <div key={item._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 group flex flex-col hover:-translate-y-2 transition-all duration-300">
                  
                  {/* Image Container */}
                  <div className="relative h-64 bg-slate-200 flex items-center justify-center overflow-hidden">
                    {item.image && <img src={item.image} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110" />}
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="relative z-10 max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="relative z-10 flex flex-col items-center text-slate-400">
                        <ImageIcon size={48} strokeWidth={1.5} />
                        <p className="text-[10px] font-black uppercase mt-2 tracking-widest">No Image</p>
                      </div>
                    )}
                    <div className="absolute top-5 left-5 z-20">
                      <span className="bg-white/90 backdrop-blur-md text-blue-600 text-[10px] font-black px-4 py-2 rounded-full shadow-sm border border-white">
                        {item.college || "Campus Wide"}
                      </span>
                    </div>
                  </div>

                  {/* Body Container */}
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black text-slate-800 mb-2 truncate">{item.name}</h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10 font-medium">{item.description}</p>
                    
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600 mb-8 pt-4 border-t border-slate-50">
                      <MapPin size={18} className="text-blue-500" /> 
                      <span className="truncate">{item.location}</span>
                    </div>

                    <button 
                      onClick={() => setSelectedItem(item)} 
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                    >
                      <Send size={18} /> I Found This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECURE CLAIM MODAL */}
          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSubmitting && setSelectedItem(null)}></div>
              
              <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl overflow-hidden border border-slate-100">
                {showSuccess ? (
                  <div className="text-center py-10">
                    <CheckCircle size={64} className="text-green-500 mx-auto mb-6 animate-bounce" />
                    <h3 className="text-2xl font-black text-slate-900">Notification Sent</h3>
                    <p className="text-slate-500 mt-2 font-medium">The owner will contact you via the info provided.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Contact <span className="text-blue-600">Owner</span></h2>
                      <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                      </button>
                    </div>

                    <form onSubmit={handleClaimSubmit} className="space-y-6">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Subject Item</p>
                        <p className="font-bold text-slate-800 text-lg">{selectedItem.name}</p>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Identity (Email/Username)</label>
                        <input 
                          required 
                          type="text" 
                          value={finderContact} 
                          onChange={(e) => setFinderContact(e.target.value)} 
                          placeholder="How should they reach you?" 
                          className="w-full mt-1.5 p-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-medium transition-all" 
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message to Owner</label>
                        <textarea 
                          required 
                          value={claimMessage} 
                          onChange={(e) => setClaimMessage(e.target.value)} 
                          placeholder="Tell the owner where you found it or where they can collect it." 
                          className="w-full mt-1.5 p-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-medium transition-all h-32 resize-none"
                        ></textarea>
                      </div>

                      <button 
                        disabled={isSubmitting} 
                        className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Sending...
                          </>
                        ) : "Notify Owner"}
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