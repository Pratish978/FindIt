import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Trash2, Clock, Loader2, Ticket, Gift, Download, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Coupons Import (Ensure these paths match your folder structure)
import cup1 from "../assets/cup1.png";
import cup2 from "../assets/cup2.png";
import cup3 from "../assets/cup3.jpeg";
import cup4 from "../assets/cup4.jpeg";
import cup5 from "../assets/cup5.jpeg";
import cup6 from "../assets/cup6.jpeg";
import cup7 from "../assets/cup7.jpeg";
import cup8 from "../assets/cup8.jpeg";
import cup9 from "../assets/cup9.jpeg";

const ALL_COUPONS = [cup1, cup2, cup3, cup4, cup5, cup6, cup7, cup8, cup9];

const Account = () => {
  const [myItems, setMyItems] = useState([]);   
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); 
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => { 
    fetchItems(); 
  }, [user]);

  const fetchItems = () => {
    if (user?.email) {
      setLoading(true);
      fetch('https://findit-backend-n3fm.onrender.com/api/items/all')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(item => 
            item.userEmail?.toLowerCase() === user.email.toLowerCase()
          );
          setMyItems(filtered.reverse());
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  const getUniqueCoupon = (itemId) => {
    if (!itemId) return ALL_COUPONS[0];
    let hash = 0;
    for (let i = 0; i < itemId.length; i++) {
      hash = itemId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % ALL_COUPONS.length;
    return ALL_COUPONS[index];
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (currentStatus === 'recovered') return;
    const feedbackMsg = window.prompt("🎉 Reward Unlock! Share your story for the community:");
    if (feedbackMsg === null || !feedbackMsg.trim()) return;

    setActionId(id);
    try {
      const res = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/safe-hands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedbackMsg, status: 'recovered' })
      });

      if (res.ok) {
        // Instant UI Update
        setMyItems(prev => prev.map(item => 
          item._id === id ? { ...item, status: 'recovered', feedback: feedbackMsg } : item
        ));
        alert("🎊 Reward Unlocked in your Vault!");
      }
    } catch (err) { 
        console.error("Toggle error:", err); 
    } finally { 
        setActionId(null); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report permanently?")) return;
    setActionId(id);
    try {
      const response = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/user-delete/${id}`, { method: 'DELETE' });
      if (response.ok) setMyItems(prev => prev.filter(item => item._id !== id));
    } catch (err) { console.error(err); } finally { setActionId(null); }
  };

  // ✅ FIXED LOGIC: Any item that is recovered gets a reward
  const earnedRewards = myItems.filter(item => 
    String(item.status || "").toLowerCase().trim() === 'recovered'
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        
        {/* Profile Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-3 bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-black italic">Verified <span className="text-blue-600">Student</span></h1>
              <p className="text-slate-500 text-sm font-bold">{user?.email}</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-8 text-center text-white border-b-8 border-blue-600 shadow-xl">
            <p className="text-[10px] font-black uppercase opacity-50">Reports</p>
            <h2 className="text-4xl font-black italic">{myItems.length}</h2>
          </div>
        </div>

        {/* Rewards Vault */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 rounded-2xl text-pink-600 shadow-sm"><Gift size={24} /></div>
              <h2 className="text-2xl font-black italic uppercase">Rewards Vault</h2>
            </div>
            {earnedRewards.length > 0 && (
              <span className="bg-pink-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                {earnedRewards.length} Unlocked
              </span>
            )}
          </div>
          
          {earnedRewards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {earnedRewards.map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-[2.5rem] shadow-lg border border-pink-100 text-center group hover:scale-105 transition-transform">
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-[1.5rem] bg-slate-50 border-2 border-dashed border-pink-200">
                    <img src={getUniqueCoupon(item._id)} className="w-full h-full object-contain p-4" alt="Coupon" />
                    <div className="absolute inset-0 bg-pink-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                       <Download size={24} className="mb-2" />
                       <p className="text-[10px] font-black uppercase">Save SS</p>
                    </div>
                  </div>
                  <h3 className="text-[10px] font-black uppercase text-slate-800 truncate px-2">{item.name}</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-12 text-center">
              <Ticket size={48} className="mx-auto mb-4 text-slate-200" />
              <p className="font-black italic uppercase tracking-widest text-slate-400 text-xs">
                Mark an item as reunited to unlock exclusive campus rewards
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-50">
          <h2 className="text-xl font-black italic mb-8 flex items-center gap-3">
            <Clock className="text-blue-600" /> Recent Activity
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : myItems.length > 0 ? (
              myItems.map(item => (
                <div key={item._id} className={`p-6 rounded-[2rem] border-2 transition-all ${item.status === 'recovered' ? 'bg-green-50/40 border-green-200' : 'bg-slate-50/50 border-slate-100'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <div className="relative">
                        <img src={item.image || "https://via.placeholder.com/100"} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" alt="item" />
                        <span className={`absolute -top-2 -left-2 text-[8px] font-black uppercase px-2 py-1 rounded-lg ${item.itemType === 'found' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                          {item.itemType}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg leading-none mb-1">{item.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button 
                        disabled={actionId === item._id || item.status === 'recovered'}
                        onClick={() => handleToggleStatus(item._id, item.status)}
                        className={`flex-1 md:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${
                          item.status === 'recovered' 
                            ? 'bg-green-100 text-green-600 border-2 border-green-200' 
                            : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg active:scale-95'
                        }`}
                      >
                        {actionId === item._id ? <Loader2 size={16} className="animate-spin" /> : (item.status === 'recovered' ? 'Reunited' : 'Mark Reunited')}
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-3 text-slate-300 hover:text-red-500 transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="mx-auto text-slate-200 mb-2" size={40} />
                <p className="text-slate-400 font-bold italic uppercase text-xs">No reports found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;