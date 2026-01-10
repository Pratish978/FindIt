import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { 
  Trash2, Package, MapPin, Clock, CheckCircle, 
  AlertCircle, Loader2, ShieldCheck, PartyPopper, RefreshCcw 
} from "lucide-react";

const Account = () => {
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // Track specific item being updated
  const user = auth.currentUser;

  useEffect(() => {
    fetchItems();
  }, [user]);

  const fetchItems = () => {
    if (user?.email) {
      fetch('http://localhost:5000/api/items/all')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(item => item.userEmail === user.email);
          setMyItems(filtered.reverse());
          setLoading(false);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setLoading(false);
        });
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setActionId(id);
    try {
      const response = await fetch(`http://localhost:5000/api/items/safe-hands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        setMyItems(prev => prev.map(item => 
          item._id === id ? { ...item, status: item.status === 'recovered' ? 'active' : 'recovered' } : item
        ));
      }
    } catch (err) {
      console.error("Status update failed");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this report? This cannot be undone.")) {
      setActionId(id);
      try {
        const response = await fetch(`http://localhost:5000/api/items/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMyItems(myItems.filter(item => item._id !== id));
        }
      } catch (error) {
        alert("Error deleting item");
      } finally {
        setActionId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        
        {/* Profile & Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-3 bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-200">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verified <span className="text-blue-600">Student</span></h1>
              <p className="text-slate-500 font-bold text-lg mt-1">{user?.email}</p>
              <div className="flex gap-2 mt-4 justify-center md:justify-start">
                 <span className="bg-slate-100 text-slate-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Campus Member</span>
                 <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active Reporter</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-[3rem] p-10 shadow-xl flex flex-col justify-center items-center text-white text-center">
            <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Total Posts</p>
            <h2 className="text-6xl font-black italic">{myItems.length}</h2>
          </div>
        </div>

        {/* Activity Section */}
        <div className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
              <Clock className="text-blue-600" size={32} /> Central Activity Log
            </h2>
          </div>

          <div className="grid gap-6">
            {loading ? (
              <div className="flex flex-col items-center py-24 text-slate-400">
                <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
                <p className="font-black uppercase tracking-widest text-xs">Decrypting Vault...</p>
              </div>
            ) : myItems.length === 0 ? (
              <div className="text-center py-24 border-4 border-dashed border-slate-50 rounded-[3rem]">
                <Package size={64} className="mx-auto text-slate-200 mb-6" />
                <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Records Found</h3>
                <p className="text-slate-300 mt-2 font-medium">Report a lost or found item to see it here.</p>
              </div>
            ) : (
              myItems.map(item => (
                <div key={item._id} className={`group relative rounded-[2.5rem] p-8 border-2 transition-all duration-500 ${item.status === 'recovered' ? 'bg-green-50/50 border-green-100 opacity-80' : 'bg-slate-50 border-transparent hover:border-blue-200 hover:bg-white'}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${item.itemType === 'lost' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {item.itemType === 'lost' ? <AlertCircle size={32} /> : <CheckCircle size={32} />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-black text-slate-800 text-2xl tracking-tight">{item.name}</h4>
                          <span className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest ${item.itemType === 'lost' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}>
                            {item.itemType}
                          </span>
                          {item.status === 'recovered' && (
                            <span className="bg-green-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Resolved</span>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-slate-500 text-sm font-bold">
                          <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-500" /> {item.location}</span>
                          <span className="flex items-center gap-2"><Clock size={16} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Mark Recovered / Re-open Toggle */}
                      <button 
                        onClick={() => handleToggleStatus(item._id, item.status)}
                        disabled={actionId === item._id}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                          item.status === 'recovered' 
                          ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200' 
                          : 'bg-slate-900 text-white hover:bg-green-600'
                        }`}
                      >
                        {actionId === item._id ? <Loader2 className="animate-spin" size={18} /> : item.status === 'recovered' ? <RefreshCcw size={18} /> : <PartyPopper size={18} />}
                        {item.status === 'recovered' ? "Re-open" : "Mark Recovered"}
                      </button>

                      {/* Delete */}
                      <button 
                        onClick={() => handleDelete(item._id)}
                        disabled={actionId === item._id}
                        className="p-4 bg-white text-red-500 border border-red-100 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-md"
                        title="Delete Forever"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;