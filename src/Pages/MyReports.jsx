import React, { useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { 
  CheckCircle, Trash2, Package, MapPin, Loader2, 
  Calendar, PartyPopper, ArrowUpRight, ShieldCheck, Clock 
} from "lucide-react";

const MyReports = () => {
  const [user] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await fetch("https://findit-backend-n3fm.onrender.com/api/items/all");
      const data = await res.json();
      const userPosts = data.filter((item) => item.userEmail === user.email);
      setItems(userPosts.reverse()); 
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this report? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(prev => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'recovered' ? 'active' : 'recovered';
    
    try {
      const response = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/safe-hands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        setItems(prev => prev.map(item => 
          item._id === id ? { ...item, status: newStatus } : item
        ));
      }
    } catch (err) {
      console.error("Status update failed");
    }
  };

  // Stats for the Dashboard
  const activeCount = items.filter(i => i.status !== 'recovered').length;
  const recoveredCount = items.filter(i => i.status === 'recovered').length;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Private Vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 px-6 max-w-7xl mx-auto pb-20">
        
        {/* Header & Stats Dashboard */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-blue-600" size={20} />
              <span className="text-blue-600 text-xs font-black uppercase tracking-widest">Personal Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              My <span className="text-blue-600">Activity</span>
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 px-8">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Clock size={24}/></div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Active</p>
                <p className="text-2xl font-black text-slate-900">{activeCount}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 px-8">
              <div className="bg-green-50 p-3 rounded-2xl text-green-600"><PartyPopper size={24}/></div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Resolved</p>
                <p className="text-2xl font-black text-slate-900">{recoveredCount}</p>
              </div>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-200 flex flex-col items-center shadow-sm">
            <Package className="text-slate-200 mb-6" size={80} />
            <h3 className="text-2xl font-black text-slate-800">Your vault is empty</h3>
            <p className="text-slate-400 mt-2 font-medium">Items you report on campus will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {items.map((item) => (
              <div key={item._id} className={`bg-white rounded-[3rem] overflow-hidden shadow-xl transition-all duration-500 border-2 group flex flex-col ${item.status === 'recovered' ? 'border-green-100 opacity-90' : 'border-transparent hover:border-blue-100'}`}>
                
                {/* Image Section */}
                <div className="relative h-64 bg-slate-100 overflow-hidden">
                  <img 
                    src={item.image || "/api/placeholder/400/320"} 
                    alt={item.name} 
                    className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-110 ${item.status === 'recovered' ? 'grayscale blur-[2px]' : ''}`} 
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20 backdrop-blur-md ${
                      item.itemType === 'lost' ? 'bg-red-500/90 text-white' : 'bg-indigo-600/90 text-white'
                    }`}>
                      {item.itemType}
                    </span>
                    {item.status === 'recovered' && (
                      <span className="bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <CheckCircle size={12} /> Recovered
                      </span>
                    )}
                  </div>

                  {item.status === 'recovered' && (
                    <div className="absolute inset-0 bg-green-600/20 backdrop-blur-[1px] z-10" />
                  )}
                </div>

                {/* Content Section */}
                <div className="p-10 flex-1 flex flex-col">
                  <div className="mb-6">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="text-2xl font-black text-slate-800 line-clamp-1">{item.name}</h3>
                      <ArrowUpRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={24} />
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Calendar size={14} />
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-slate-600 text-sm font-bold mb-10 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <MapPin size={18} className="text-blue-600 shrink-0" />
                    <span className="line-clamp-2 leading-relaxed">{item.location}</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-4">
                    <button 
                      onClick={() => handleStatusUpdate(item._id, item.status)}
                      className={`flex-[2] py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                        item.status === 'recovered' 
                        ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100' 
                        : 'bg-slate-900 text-white hover:bg-blue-600 shadow-blue-100'
                      }`}
                    >
                      {item.status === 'recovered' ? (
                        <>Re-open Post</>
                      ) : (
                        <><PartyPopper size={18} /> Safe Hands</>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-[1.5rem] transition-all border border-red-100 flex items-center justify-center shadow-lg shadow-red-50"
                      title="Delete Report"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyReports;