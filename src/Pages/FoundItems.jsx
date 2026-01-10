import React, { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, Image as ImageIcon, X, CheckCircle, Loader2, ShieldQuestion, Lock, EyeOff, AlertTriangle } from "lucide-react";

const FoundItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimDescription, setClaimDescription] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // EmailJS Keys
  const SERVICE_ID = "service_dvcav7d"; 
  const TEMPLATE_ID = "template_znhipc8"; 
  const PUBLIC_KEY = "yGQvKRVl3H9XxkXk8"; 

  useEffect(() => {
    fetch('http://localhost:5000/api/items/all')
      .then(res => res.json())
      .then(data => {
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
    
    // 1. Basic length check
    if (claimDescription.length < 10) {
      alert("Please provide a more detailed description for verification.");
      return;
    }

    setIsSubmitting(true);

    // 2. VERIFICATION LOGIC
    // We compare the user's input with the original description from the database
    const userInput = claimDescription.toLowerCase().trim();
    const actualDescription = selectedItem.description.toLowerCase().trim();

    // Strategy: Check if user input contains at least two significant words from the original description
    // We filter out common short words like 'the', 'and', 'with' to focus on unique identifiers
    const significantKeywords = actualDescription
        .split(/\s+/)
        .filter(word => word.length > 3);

    const matchedKeywords = significantKeywords.filter(word => userInput.includes(word));

    // Threshold: User must match at least 1 keyword (you can increase this to 2 for stricter security)
    if (matchedKeywords.length < 1) {
      alert("Verification Failed: The details provided do not sufficiently match the hidden records for this item. Please include specific identifying features (brands, colors, specific marks).");
      setIsSubmitting(false);
      return;
    }

    // 3. SEND EMAIL (Only reached if verification passes)
    const templateParams = {
      to_email: selectedItem.userEmail,
      name: selectedItem.userName || "Finder",
      item_name: selectedItem.name,
      activity_type: "SECURE OWNERSHIP CLAIM - VERIFIED MATCH",
      message: `A user has successfully passed the keyword match filter. \n\nProof Provided: ${claimDescription}`,
      contact_info: ownerContact,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      setShowSuccess(true);
      setTimeout(() => {
        setSelectedItem(null);
        setShowSuccess(false);
        setClaimDescription("");
        setOwnerContact("");
      }, 3000);
    } catch (error) {
      console.error("Email Error:", error);
      alert("Security Protocol Error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <style>{`
        @keyframes noise {
          0% { transform: translate(0,0) }
          10% { transform: translate(-5%,-5%) }
          20% { transform: translate(-10%,5%) }
          30% { transform: translate(5%,-10%) }
          40% { transform: translate(-5%,15%) }
          50% { transform: translate(-10%,5%) }
          60% { transform: translate(15%,0) }
          70% { transform: translate(0,10%) }
          80% { transform: translate(-15%,0) }
          90% { transform: translate(10%,5%) }
          100% { transform: translate(5%,0) }
        }
        .noise-overlay {
          position: absolute;
          inset: -20%;
          background-image: url('https://grainy-gradients.vercel.app/noise.svg');
          opacity: 0.15;
          z-index: 5;
          pointer-events: none;
          animation: noise 0.2s infinite;
        }
      `}</style>

      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 w-fit px-4 py-1.5 rounded-full border border-indigo-100 mb-4">
                <ShieldQuestion size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Found-Item Vault</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
                Secure <span className="text-indigo-600">Verification</span>
              </h1>
              <p className="text-slate-500 mt-4 text-lg font-medium max-w-lg">
                Automated verification is active. Provide specific details to unlock the finder's contact information.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex gap-4 items-start max-w-sm">
              <AlertTriangle className="text-amber-600 shrink-0" size={24} />
              <p className="text-amber-800 text-xs font-bold leading-relaxed">
                WARNING: All claim attempts are filtered for accuracy. False claims will be reported to campus security.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
              <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Accessing Secure Database...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[4rem] border border-slate-200/60 shadow-inner">
               <EyeOff className="mx-auto text-slate-200 mb-6" size={80} />
               <p className="text-slate-400 font-black text-xl uppercase tracking-tighter">Vault Empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <div key={item._id} className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 group flex flex-col hover:-translate-y-3 transition-all duration-500">
                  
                  <div className="relative h-72 bg-slate-950 flex items-center justify-center overflow-hidden">
                    <div className="noise-overlay"></div>
                    {item.image ? (
                      <>
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-full h-full object-cover blur-[50px] opacity-40 scale-150 grayscale" 
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-indigo-900/20 backdrop-blur-sm">
                           <div className="p-5 rounded-full bg-white/10 border border-white/20 mb-4 backdrop-blur-xl">
                              <Lock size={32} className="text-white animate-pulse" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-indigo-600 px-4 py-1.5 rounded-full">Visual Redacted</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-700 flex flex-col items-center">
                        <ImageIcon size={60} strokeWidth={1} />
                        <p className="text-[9px] font-black mt-3 uppercase tracking-widest opacity-50">No Visual Data</p>
                      </div>
                    )}
                  </div>

                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                       <MapPin size={14} className="text-indigo-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.location}</span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h3>
                    
                    <div className="relative mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-slate-500 text-sm font-medium leading-relaxed">
                         {item.description.split(' ').slice(0, 4).join(' ')} ...
                       </p>
                       <span className="inline-block mt-2 text-[9px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded uppercase">Data Redacted</span>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="mt-auto w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                    >
                      Verify Ownership
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
              <div 
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" 
                onClick={() => !isSubmitting && setSelectedItem(null)}
              ></div>
              
              <div className="relative bg-white w-full max-w-xl rounded-[3.5rem] p-12 shadow-2xl overflow-hidden border border-white/20">
                {showSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100">
                       <CheckCircle size={48} className="text-green-500" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4">Identity Verified</h3>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                      Matches found! Your claim has been forwarded to the finder.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Proof of <span className="text-indigo-600">Ownership</span></h2>
                        <p className="text-slate-400 font-medium text-sm mt-1">Item Ref: #{selectedItem._id.slice(-6).toUpperCase()}</p>
                      </div>
                      <button onClick={() => setSelectedItem(null)} className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
                        <X size={24} />
                      </button>
                    </div>

                    <form onSubmit={handleClaimSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Method</label>
                          <input 
                            required 
                            type="text" 
                            value={ownerContact} 
                            onChange={(e) => setOwnerContact(e.target.value)} 
                            placeholder="WhatsApp or Email" 
                            className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:border-indigo-500 outline-none font-bold transition-all shadow-inner" 
                          />
                        </div>
                        <div className="space-y-2 text-center flex flex-col justify-center bg-indigo-50/50 rounded-2xl border border-indigo-100">
                           <p className="text-[10px] font-black text-indigo-600 uppercase">Target Item</p>
                           <p className="font-black text-slate-800 uppercase">{selectedItem.name}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unique Identifiers</label>
                        <textarea 
                          required 
                          value={claimDescription} 
                          onChange={(e) => setClaimDescription(e.target.value)} 
                          placeholder="What makes this yours? (e.g. 'Sticker of a cat', 'Blue keychain', 'Slight crack on top left'). Automated system will verify these details." 
                          className="w-full p-6 bg-slate-50 rounded-[2rem] border border-slate-100 focus:bg-white focus:border-indigo-500 outline-none font-medium h-40 resize-none transition-all shadow-inner"
                        ></textarea>
                      </div>

                      <button 
                        disabled={isSubmitting} 
                        className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Validate & Submit Claim"}
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