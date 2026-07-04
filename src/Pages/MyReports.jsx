import React, { useEffect, useState, useCallback, useRef } from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { 
  CheckCircle, Trash2, Package, MapPin, Loader2, 
  Calendar, PartyPopper, ShieldCheck, Clock, Download, ShieldAlert, X, Gift, Share2, CornerDownRight, Star 
} from "lucide-react";

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

// --- Scratch Card Sub-Component ---
const ScratchCardSmall = ({ image, name, itemId, onReveal }) => {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#CBD5E1"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH", canvas.width / 2, canvas.height / 2);

    let isDrawing = false;
    const scratch = (x, y) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI * 2); ctx.fill();
      checkReveal();
    };

    const checkReveal = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let count = 0;
      for (let i = 0; i < imageData.data.length; i += 4) { if (imageData.data[i + 3] === 0) count++; }
      if (count > (imageData.data.length / 4) * 0.5) {
        setIsRevealed(true);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onReveal(image, name, itemId);
      }
    };

    const handleMove = (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      scratch(clientX - rect.left, clientY - rect.top);
    };

    canvas.addEventListener("mousedown", () => isDrawing = true);
    canvas.addEventListener("touchstart", () => isDrawing = true);
    window.addEventListener("mouseup", () => isDrawing = false);
    window.addEventListener("touchend", () => isDrawing = false);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("touchmove", handleMove);
  }, [image, name, itemId, onReveal]);

  return (
    <div className="relative w-full aspect-square bg-white rounded-2xl border-2 border-dashed border-pink-200 overflow-hidden">
      <img src={image} className="w-full h-full object-contain p-2" alt="coupon" />
      <canvas ref={canvasRef} width={200} height={200} className={`absolute top-0 left-0 w-full h-full cursor-pointer transition-opacity ${isRevealed ? "opacity-0 pointer-events-none" : "opacity-100"}`} />
      {isRevealed && (
        <button onClick={() => onReveal(image, name, itemId)} className="absolute inset-0 bg-pink-600/20 flex items-center justify-center animate-pulse">
            <Star className="text-pink-600 fill-pink-600" size={24} />
        </button>
      )}
    </div>
  );
};

const MyReports = () => {
  const [user] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  const fetchItems = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await fetch("https://findit-backend-n3fm.onrender.com/api/items/all");
      const data = await res.json();
      const userPosts = data.filter((item) => item.userEmail === user.email);
      setItems(userPosts.reverse()); 
    } catch (err) { console.error("Fetch error:", err); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // --- POLICE RECEIPT DOWNLOAD LOGIC ---
  const handleDownloadReceipt = (item) => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date(item.verifiedAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Police_Clearance_${item.policeCaseId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; background: #f1f5f9; padding: 20px; }
            .certificate { background: white; width: 700px; margin: auto; padding: 50px; border: 10px solid #1e293b; position: relative; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .case-badge { background: #1e293b; color: white; padding: 5px 15px; display: inline-block; margin-top: 10px; font-weight: bold; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 900; }
            .value { font-size: 15px; font-weight: 700; color: #1e293b; }
            .official-seal { border: 4px double #3b82f6; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #3b82f6; font-weight: 900; transform: rotate(-15deg); }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div style="font-size: 10px; letter-spacing: 2px; color: #64748b;">OFFICIAL DOCUMENT</div>
              <h1 style="margin: 5px 0;">FindIt Security Protocol</h1>
              <div class="case-badge">CASE ID: ${item.policeCaseId}</div>
            </div>
            <div class="info-grid">
              <div><div class="label">Item Name</div><div class="value">${item.name}</div></div>
              <div><div class="label">Date</div><div class="value">${dateStr}</div></div>
              <div><div class="label">Email</div><div class="value">${item.userEmail}</div></div>
              <div><div class="label">Location</div><div class="value">${item.location}</div></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 40px;">
              <div class="official-seal text-center">VERIFIED BY<br>CAMPUS POLICE</div>
              <div style="border-top: 1px solid #000; width: 150px; text-align: center; padding-top: 5px;">
                <div style="font-family: cursive;">Security_Auth</div>
                <div class="label">Digital Sign</div>
              </div>
            </div>
          </div>
          <button class="no-print" style="position:fixed; bottom:20px; right:20px; padding: 10px 20px; cursor:pointer;" onclick="window.print()">PRINT</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getUniqueCoupon = (itemId) => {
    if (!itemId) return ALL_COUPONS[0];
    let hash = 0;
    for (let i = 0; i < itemId.length; i++) { hash = itemId.charCodeAt(i) + ((hash << 5) - hash); }
    return ALL_COUPONS[Math.abs(hash) % ALL_COUPONS.length];
  };

  const handleRewardReveal = (imgSrc, itemName, itemId) => {
    setSelectedReward({ image: imgSrc, name: itemName, itemId: itemId });
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    if (currentStatus === 'recovered') {
        if (!window.confirm("Reopen this case? Your reward card will be reset.")) return;
        try {
            const res = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/safe-hands/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: 'active' })
            });
            if (res.ok) setItems(prev => prev.map(item => item._id === id ? { ...item, status: 'active' } : item));
        } catch (err) { console.error(err); }
        return;
    }

    const feedbackMsg = window.prompt("🎉 Reward Unlock! Share your story for the community:");
    if (feedbackMsg === null || !feedbackMsg.trim()) return;

    try {
      const response = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/safe-hands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedbackMsg, status: 'recovered' })
      });
      if (response.ok) {
        setItems(prev => prev.map(item => item._id === id ? { ...item, status: 'recovered', feedback: feedbackMsg } : item));
        alert("🎊 Reward Unlocked! Scratch your card below.");
      }
    } catch (err) { console.error("Status update failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this report?")) return;
    try {
      const response = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/user-delete/${id}`, { 
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email })
      });
      if (response.ok) setItems(prev => prev.filter((item) => item._id !== id));
    } catch (err) { console.error(err); }
  };

  const activeCount = items.filter(i => i.status !== 'recovered').length;
  const recoveredCount = items.filter(i => i.status === 'recovered').length;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Private Vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 px-6 max-w-7xl mx-auto pb-20">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-blue-600" size={20} />
              <span className="text-blue-600 text-xs font-black uppercase tracking-widest">My Personal Activity</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Report <span className="text-blue-600">History</span></h1>
          </div>
          <div className="flex gap-4">
            <StatPill icon={<Clock size={20}/>} label="Active" count={activeCount} color="blue" />
            <StatPill icon={<PartyPopper size={20}/>} label="Resolved" count={recoveredCount} color="green" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item._id} className={`bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-2 transition-all group ${item.status === 'recovered' ? 'border-green-100' : 'border-transparent hover:border-blue-100'}`}>
              
              <div className="relative h-56 bg-slate-50 overflow-hidden flex items-center justify-center">
                <img src={item.image || "/api/placeholder/400/320"} className="w-full h-full object-contain" alt="item" />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.itemType === 'lost' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}>{item.itemType}</span>
                  {item.status === 'verified' && (
                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                      <ShieldAlert size={12} /> Police Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="p-7">
                {item.status === 'recovered' ? (
                  <div className="mb-6 flex gap-4 items-center bg-white p-4 rounded-3xl border border-green-100 shadow-sm">
                     <div className="w-24 shrink-0">
                        <ScratchCardSmall image={getUniqueCoupon(item._id)} name={item.name} itemId={item._id} onReveal={handleRewardReveal} />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{item.name}</h3>
                        <p className="text-[9px] font-black uppercase text-green-600">Reward Unlocked ✨</p>
                     </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-black text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-4">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </>
                )}

                {/* POLICE RECEIPT BUTTON (Still here!) */}
                {item.status === 'verified' && (
                  <button onClick={() => handleDownloadReceipt(item)} className="w-full mb-4 bg-blue-50 text-blue-600 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                    <Download size={14} /> Download FIR Receipt
                  </button>
                )}

                <div className="flex items-center gap-2 text-slate-600 text-[11px] font-bold mb-6 p-3 bg-slate-50 rounded-xl">
                  <MapPin size={14} className="text-blue-500" />
                  <span className="truncate">{item.location}</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleStatusUpdate(item._id, item.status)} className={`flex-[3] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${item.status === 'recovered' ? 'bg-orange-100 text-orange-600' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
                    {item.status === 'recovered' ? 'Reopen Case' : 'Safe Hands'}
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="flex-1 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white"><Trash2 size={20} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- REWARD POPUP MODAL --- */}
      {isModalOpen && selectedReward && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[3.5rem] p-10 max-w-lg w-full relative shadow-2xl border-4 border-pink-100 animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-3 bg-slate-100 rounded-full text-slate-500 hover:bg-red-100 transition-colors"><X size={20} /></button>
            <div className="text-center mb-8">
                <Gift className="mx-auto text-pink-500 w-16 h-16 p-3 bg-pink-100 rounded-3xl mb-4" />
                <h3 className="text-2xl font-black italic uppercase text-slate-900">Reward <span className="text-pink-600">Unlocked!</span></h3>
            </div>
            <div className="bg-slate-50 rounded-[2.5rem] p-6 border-2 border-dashed border-pink-200 mb-8"><img src={selectedReward.image} className="w-full h-auto max-h-60 object-contain mx-auto" alt="Coupon" /></div>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsModalOpen(false)} className="bg-slate-900 text-white p-5 rounded-[2rem] text-xs font-black uppercase flex items-center justify-center gap-2"><Star size={16} className="text-yellow-400" /> Awesome</button>
                <button className="bg-blue-600 text-white p-5 rounded-[2rem] text-xs font-black uppercase flex items-center justify-center gap-2"><Share2 size={16} /> Share</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

const StatPill = ({ icon, label, count, color }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 px-6">
    <div className={`p-3 rounded-xl ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase text-slate-400">{label}</p>
      <p className="text-xl font-black text-slate-900 leading-tight">{count}</p>
    </div>
  </div>
);

export default MyReports;