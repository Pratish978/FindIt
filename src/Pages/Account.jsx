import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { 
  Trash2, Clock, Loader2, 
  Send, Ticket, Gift, MessageSquare, Download 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Coupons Import
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
    if (!user) {
        // navigate('/login');
    }
    fetchItems(); 
  }, [user]);

  const fetchItems = () => {
    if (user?.email) {
      // API call to fetch all items
      fetch('https://findit-backend-n3fm.onrender.com/api/items/all')
        .then(res => res.json())
        .then(data => {
          // FIX: Case-insensitive email check to ensure items are found
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
    let hash = 0;
    for (let i = 0; i < itemId.length; i++) {
      hash = itemId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % ALL_COUPONS.length;
    return ALL_COUPONS[index];
  };

  const handleToggleStatus = async (id, currentStatus) => {
    let feedbackMsg = "";
    
    if (currentStatus !== 'recovered') {
      feedbackMsg = window.prompt("🎉 Reward Unlock! Share how you found/returned the item for the Success Stories:");
      if (feedbackMsg === null) return; 
      if (!feedbackMsg.trim()) return alert("Success story is required to unlock rewards!");
    }

    setActionId(id);
    try {
      const res = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/safe-hands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          feedback: feedbackMsg, 
          // Logic to toggle status
          status: currentStatus === 'recovered' ? 'active' : 'recovered' 
        })
      });
      if (res.ok) {
          // Give a small delay for DB sync before re-fetching
          setTimeout(() => fetchItems(), 500);
          if (currentStatus !== 'recovered') alert("🎊 Reward Unlocked in your Vault!");
      }
    } catch (err) { 
        console.error(err); 
    } finally { 
        setActionId(null); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report permanently?")) return;
    setActionId(id);
    try {
      const response = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/user-delete/${id}`, { 
        method: 'DELETE'
      });
      if (response.ok) {
        setMyItems(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) { console.error(err); } finally { setActionId(null); }
  };

  // REWARDS LOGIC FIX: 
  // 1. Convert itemType to lowercase to avoid 'Found' vs 'found' issues.
  // 2. Ensure status is strictly 'recovered'.
  const earnedRewards = myItems.filter(item => 
    item.itemType?.toLowerCase() === 'found' && 
    item.status === 'recovered'
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        
        {/* Profile Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-3 bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black italic">Verified <span className="text-blue-600">Student</span></h1>
              <p className="text-slate-500 text-sm font-bold">{user?.email}</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-8 text-center text-white border-b-8 border-blue-600">
            <p className="text-[10px] font-black uppercase opacity-50">Reports</p>
            <h2 className="text-4xl font-black italic">{myItems.length}</h2>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-pink-100 rounded-2xl text-pink-600"><Gift size={24} /></div>
            <h2 className="text-2xl font-black italic uppercase">Rewards Vault</h2>
          </div>
          
          {earnedRewards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {earnedRewards.map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-[2rem] shadow-lg border border-pink-50 text-center group">
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl bg-slate-50 border-2 border-pink-50">
                    <img 
                      src={getUniqueCoupon(item._id)} 
                      className="w-full h-full object-contain p-2" 
                      alt="Coupon" 
                    />
                    <div className="absolute inset-0 bg-pink-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                       <Download size={24} className="mb-2" />
                       <p className="text-[10px] font-bold uppercase">Screenshot to use</p>
                    </div>
                  </div>
                  <h3 className="text-xs font-black uppercase text-slate-800 truncate">{item.name}</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-12 text-center text-slate-400">
              <Ticket size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-black italic uppercase tracking-widest text-xs">Help someone find their item to unlock rewards</p>
            </div>
          )}
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-50">
          <h2 className="text-xl font-black italic mb-8 flex items-center gap-3">
            <Clock className="text-blue-600" /> Recent Activity
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : myItems.map(item => (
              <div key={item._id} className={`p-5 rounded-3xl border-2 transition-all ${item.status === 'recovered' ? 'bg-green-50/30 border-green-100' : 'bg-slate-50 border-transparent'}`}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    {item.image && (
                        <img src={item.image} className="w-12 h-12 rounded-xl object-cover border border-slate-200" alt="item" />
                    )}
                    <div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${item.itemType?.toLowerCase() === 'found' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                        {item.itemType}
                      </span>
                      <h4 className="font-black text-slate-800">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{item.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      disabled={actionId === item._id}
                      onClick={() => handleToggleStatus(item._id, item.status)}
                      className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                        item.status === 'recovered' 
                          ? 'bg-white text-slate-400 border border-slate-200' 
                          : 'bg-slate-900 text-white hover:bg-blue-600'
                      }`}
                    >
                      {actionId === item._id ? <Loader2 size={14} className="animate-spin" /> : (item.status === 'recovered' ? 'Item Reunited' : 'Mark Reunited')}
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;