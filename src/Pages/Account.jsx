import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { 
  Trash2, Clock, Loader2, 
  Send, Ticket, Gift, MessageSquare, Download 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import all 9 coupons
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
const BANNED_WORDS = ["spam", "abuse", "fake"]; 

const Account = () => {
  const [myItems, setMyItems] = useState([]);   
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); 
  const [generalFeedback, setGeneralFeedback] = useState(""); 
  
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => { 
    fetchItems(); 
  }, [user]);

  const fetchItems = () => {
    if (user?.email) {
      fetch('https://findit-backend-n3fm.onrender.com/api/items/all')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(item => item.userEmail === user.email);
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

  const downloadReward = (imageUrl, itemName) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `Reward-${itemName.replace(/\s+/g, "-")}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePostGeneralFeedback = async () => {
    if (!generalFeedback.trim()) return alert("Write your story!");
    if (BANNED_WORDS.some(w => generalFeedback.toLowerCase().includes(w))) return alert("Banned words detected.");
    
    const targetItem = myItems[0];
    if (!targetItem) return alert("Report an item first!");

    setActionId("general-feedback");
    try {
      const res = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/safe-hands/${targetItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: generalFeedback })
      });
      if (res.ok) {
        alert("🎉 Story Live on Home Page!");
        setGeneralFeedback("");
        fetchItems();
      }
    } catch (err) { console.error(err); } finally { setActionId(null); }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    let feedbackMsg = "";
    if (currentStatus !== 'recovered') {
      feedbackMsg = window.prompt("🎉 Success! Share your story for the Home page feedback section:");
      if (feedbackMsg === null) return;
      if (!feedbackMsg.trim()) return alert("Feedback is required to recover and earn rewards!");
    }

    setActionId(id);
    try {
      const res = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/safe-hands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          feedback: feedbackMsg, 
          status: currentStatus === 'recovered' ? 'active' : 'recovered' 
        })
      });
      if (res.ok) fetchItems();
    } catch (err) { console.error(err); } finally { setActionId(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    setActionId(id);
    try {
      await fetch(`https://findit-backend-n3fm.onrender.com/api/items/${id}`, { method: 'DELETE' });
      fetchItems();
    } finally { setActionId(null); }
  };

  const earnedRewards = myItems.filter(item => item.itemType === 'found' && item.status === 'recovered');

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-3 bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 flex items-center gap-8">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black">Verified <span className="text-blue-600">Student</span></h1>
              <p className="text-slate-500 font-bold">{user?.email}</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-10 text-center text-white border-b-8 border-blue-600">
            <p className="text-[10px] font-black uppercase opacity-50">Total Reports</p>
            <h2 className="text-5xl font-black italic">{myItems.length}</h2>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-pink-100 rounded-2xl text-pink-600"><Ticket size={24} /></div>
            <h2 className="text-2xl font-black italic uppercase">Rewards Vault</h2>
          </div>
          
          {earnedRewards.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {earnedRewards.map((item) => {
                const rewardImg = getUniqueCoupon(item._id);
                return (
                  <div key={item._id} className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-pink-50 text-center transform hover:scale-105 transition-all group">
                    <div className="relative mb-4 overflow-hidden rounded-3xl bg-slate-50 flex items-center justify-center">
                      <img 
                        src={rewardImg} 
                        className="w-full h-auto object-contain border-4 border-pink-50" 
                        alt="Reward" 
                      />
                      <button 
                        onClick={() => downloadReward(rewardImg, item.name)}
                        className="absolute inset-0 bg-pink-600/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Download size={32} className="mb-2" />
                        <span className="font-black text-[10px] uppercase">Download Coupon</span>
                      </button>
                    </div>
                    <p className="text-[10px] font-black uppercase text-pink-500 tracking-tighter mb-1">Unique Reward</p>
                    <h3 className="text-xs font-bold text-slate-800 truncate">{item.name}</h3>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-16 text-center text-slate-300">
              <Gift size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold italic uppercase tracking-widest text-sm">Recover a found item to unlock coupons</p>
            </div>
          )}
        </div>

        <div className="mb-12 bg-white rounded-[2.5rem] p-8 shadow-xl border-l-[12px] border-blue-600">
          <h2 className="text-xl font-black mb-4 uppercase italic">Share a Success Story</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-600 transition-colors" 
              placeholder="How did the recovery go? (Appears on Home page)"
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
            />
            <button 
              onClick={handlePostGeneralFeedback} 
              disabled={actionId === "general-feedback"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all"
            >
              {actionId === "general-feedback" ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} 
              Post Story
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-50">
          <h2 className="text-2xl font-black italic mb-8 flex items-center gap-3 text-slate-800">
            <Clock className="text-blue-600" /> My Activity Logs
          </h2>
          <div className="space-y-4">
            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : myItems.length > 0 ? (
              myItems.map(item => (
                <div key={item._id} className={`p-6 rounded-[2rem] border-2 transition-all ${item.status === 'recovered' ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-transparent'}`}>
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${item.itemType === 'found' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          {item.itemType}
                        </span>
                        <h4 className="font-black text-lg text-slate-800">{item.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{item.location} • {item.college}</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleStatus(item._id, item.status)} 
                        disabled={actionId === item._id}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm transition-all ${
                          item.status === 'recovered' 
                            ? 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50' 
                            : 'bg-slate-900 text-white hover:bg-blue-600'
                        }`}
                      >
                        {actionId === item._id ? <Loader2 className="animate-spin mx-auto" size={14} /> : (item.status === 'recovered' ? 'Re-open' : 'Mark Recovered')}
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)} 
                        disabled={actionId === item._id}
                        className="p-2 text-red-500 bg-white rounded-xl border border-red-50 hover:bg-red-50 shadow-sm transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {item.feedback && (
                    <div className="mt-4 p-4 bg-white/60 rounded-xl border border-white">
                      <p className="text-xs italic text-slate-500 flex items-start gap-2">
                        <MessageSquare size={14} className="mt-0.5 text-blue-400" />
                        "{item.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
                <p className="text-center text-slate-400 py-10 font-bold uppercase text-xs tracking-widest">No reports found</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;