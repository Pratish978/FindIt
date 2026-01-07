import React, { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, Search, Image as ImageIcon, Send, X, CheckCircle, Loader2, ShieldQuestion, Lock } from "lucide-react";

const FoundItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimDescription, setClaimDescription] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- EmailJS Config ---
  const SERVICE_ID = "service_dvcav7d"; 
  const TEMPLATE_ID = "template_znhipc8"; // Replace with your template ID
  const PUBLIC_KEY = "yGQvKRVl3H9XxkXk8"; // Replace with your public key

  useEffect(() => {
    fetch('http://localhost:5000/api/items/all')
      .then(res => res.json())
      .then(data => {
        // Only show items that are 'found' and NOT yet recovered
        const activeFound = data.filter(i => i.itemType === 'found' && i.status !== 'recovered');
        setItems(activeFound.reverse());
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const templateParams = {
      to_email: selectedItem.userEmail,
      item_name: selectedItem.name,
      finder_contact: ownerContact,
      message: `CLAIM VERIFICATION: ${claimDescription}`,
      location: selectedItem.location
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      setShowSuccess(true);
      
      // Auto-close modal after success
      setTimeout(() => {
        setSelectedItem(null);
        setShowSuccess(false);
        setClaimDescription("");
        setOwnerContact("");
      }, 3000);
    } catch (error) {
      alert("Error sending claim notification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-12">
            <span className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              Privacy Protected Hub
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-4">
              Verify & <span className="text-indigo-600">Claim</span>
            </h1>
            <p className="text-slate-500 mt-4 text-lg font-medium">
              Images are blurred for security. Provide specific details to the finder to verify ownership.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
              <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Scanning secure vault...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
               <ImageIcon className="mx-auto text-slate-200 mb-4" size={64} />
               <p className="text-slate-500 font-bold">No found items currently in the vault.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {items.map((item) => (
                <div key={item._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 group flex flex-col hover:-translate-y-2 transition-transform duration-300">
                  
                  {/* PRIVACY SHIELD: Blurred Image Container */}
                  <div className="relative h-64 bg-slate-900 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <>
                        <img src={item.image} alt="" className="w-full h-full object-cover blur-3xl opacity-50 scale-125 transition-all duration-700" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-black/20 backdrop-blur-[2px]">
                           <Lock size={40} className="mb-2 opacity-80" />
                           <p className="text-[10px] font-black uppercase tracking-[0.2em]">Visual ID Hidden</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-500 flex flex-col items-center">
                        <ImageIcon size={48} />
                        <p className="text-[10px] font-black mt-2 uppercase tracking-widest">No Image Provided</p>
                      </div>
                    )}
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-slate-800 leading-tight">{item.name}</h3>
                        <ShieldQuestion className="text-indigo-500" size={24} />
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-6 italic">
                      "Full description hidden for security. Click verify to provide proof of ownership to the finder."
                    </p>
                    
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600 mb-8 pt-4 border-t border-slate-50">
                      <MapPin size={18} className="text-indigo-500" />
                      {item.location}
                    </div>

                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                    >
                      Verify & Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VERIFICATION MODAL */}
          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !isSubmitting && setSelectedItem(null)}></div>
              
              <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl overflow-hidden border border-slate-100">
                {showSuccess ? (
                  <div className="text-center py-10">
                    <CheckCircle size={64} className="text-green-500 mx-auto mb-6 animate-bounce" />
                    <h3 className="text-2xl font-black text-slate-900">Proof Submitted</h3>
                    <p className="text-slate-500 mt-2 font-medium">The finder has been notified. They will review your description and contact you if it's a match.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black text-slate-900">Ownership <span className="text-indigo-600">Proof</span></h2>
                      <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                      </button>
                    </div>

                    <form onSubmit={handleClaimSubmit} className="space-y-6">
                      <div className="p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-1">Claiming item</p>
                        <p className="font-bold text-slate-800 text-xl">{selectedItem.name}</p>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Contact Info</label>
                        <input 
                          required 
                          type="text" 
                          value={ownerContact} 
                          onChange={(e) => setOwnerContact(e.target.value)} 
                          placeholder="Phone number or Student ID" 
                          className="w-full mt-1.5 p-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-medium" 
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Describe a Unique Detail</label>
                        <textarea 
                          required 
                          value={claimDescription} 
                          onChange={(e) => setClaimDescription(e.target.value)} 
                          placeholder="e.g. 'There is a stickers of a cat on the back' or 'The wallet has exactly $12 inside'." 
                          className="w-full mt-1.5 p-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-medium h-32 resize-none"
                        ></textarea>
                      </div>

                      <button 
                        disabled={isSubmitting} 
                        className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Sending Proof...
                          </>
                        ) : "Submit Proof of Ownership"}
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

export default FoundItems;