import React, { useEffect, useState, useRef, Fragment } from "react";
import { auth } from "../firebase";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Trash2, Clock, Loader2, Ticket, Gift, X, Share2, CornerDownRight, RefreshCcw, Star } from "lucide-react";
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

// --- Scratch Card Sub-Component ---
const ScratchCard = ({ image, name, itemId, onReveal }) => {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const uniqueCanvasId = useRef(`scratch-canvas-${itemId}`);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // --- 1. Draw Background Cover (Slate Grey Scratch Surface) ---
    ctx.fillStyle = "#CBD5E1"; // slate-300
    ctx.fillRect(0, 0, width, height);

    // --- 2. Add "GPay Style" Decorative Elements on Surface ---
    // Add dots or pattern
    ctx.fillStyle = "#94a3b8"; // slate-400 for pattern
    for(let i=0; i<30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add large question mark or central text
    ctx.font = "bold 20px Inter, sans-serif";
    ctx.fillStyle = "#64748b"; // slate-500
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH ME!", width / 2, height / 2);

    // Add star icons
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.fillText("★", width/2 - 70, height/2 - 40);
    ctx.fillText("★", width/2 + 70, height/2 + 40);
    ctx.fillText("★", width/2 - 20, height/2 + 80);


    // --- 3. Internal State & Logic ---
    let isDrawing = false;

    // Draw scratch mark
    const scratch = (x, y) => {
      ctx.globalCompositeOperation = "destination-out"; // Crucial: removes pixels
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
      checkReveal();
    };

    // Check if scratched enough area
    const checkReveal = () => {
      if(isRevealed) return; // Already revealed

      const imageData = ctx.getImageData(0, 0, width, height);
      let count = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] === 0) count++; // Count fully transparent pixels
      }
      // If > 50% scratched, reveal everything and open modal
      if (count > (imageData.data.length / 4) * 0.5) {
        setIsRevealed(true);
        ctx.clearRect(0, 0, width, height); // Clear entire canvas

        // Trigger parent callback to show modal
        onReveal(image, name, itemId);
      }
    };

    // Mouse/Touch Handlers
    const handleMove = (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      // Need clientX/Y from touch or mouse event
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      scratch(x, y);
    };

    const handleDown = () => (isDrawing = true);
    const handleUp = () => (isDrawing = false);

    canvas.addEventListener("mousedown", handleDown);
    canvas.addEventListener("touchstart", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("touchmove", handleMove);

    return () => {
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [onReveal, image, name, itemId]); // Re-run if props change (important)

  return (
    <div className="bg-white p-4 rounded-[2.5rem] shadow-lg border border-pink-100 text-center relative group overflow-hidden">
      {/* Container to maintain aspect ratio */}
      <div className="relative aspect-square mb-4 rounded-[1.5rem] bg-slate-50 border-2 border-dashed border-pink-200 overflow-hidden">
        
        {/* Hidden Coupon Image (Behind Canvas) */}
        <img src={image} className="w-full h-full object-contain p-4" alt="Coupon Reward" />

        {/* Scratch Canvas Overlay */}
        <canvas
          id={uniqueCanvasId.current}
          ref={canvasRef}
          width={300}
          height={300}
          className={`absolute top-0 left-0 w-full h-full cursor-pointer transition-opacity duration-300 ${
            isRevealed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        />
        
        {/* "Click to view" overlay for already scratched cards (UX improvement) */}
        {isRevealed && (
          <button
            onClick={() => onReveal(image, name, itemId)} // Open modal again
            className="absolute inset-0 bg-pink-950/70 text-white flex flex-col items-center justify-center gap-2 animate-in fade-in duration-300 opacity-0 group-hover:opacity-100"
          >
            <Star size={32} className="text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">View Reward</span>
          </button>
        )}

      </div>
      
      {/* Title Below Card */}
      <h3 className="text-[10px] font-black uppercase text-slate-800 truncate px-2">
        {isRevealed ? name : "?? Reward ??"}
      </h3>
      <p className="text-[9px] font-bold text-pink-500 mt-1 uppercase">
        {isRevealed ? "Reward Unlocked!" : "Scratch to Reveal"}
      </p>
    </div>
  );
};



// --- Main Account Component ---
const Account = () => {
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const user = auth.currentUser;
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null); // Stores {image, name, itemId}

  useEffect(() => {
    fetchItems();
  }, [user]);

  const fetchItems = () => {
    if (user?.email) {
      setLoading(true);
      fetch("https://findit-backend-n3fm.onrender.com/api/items/all")
        .then((res) => res.json())
        .then((data) => {
          const filtered = data.filter(
            (item) => item.userEmail?.toLowerCase() === user.email.toLowerCase()
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

  // --- NEW: Callback to show Reward Modal ---
  const handleRewardReveal = (imgSrc, itemName, itemId) => {
    setSelectedReward({ image: imgSrc, name: itemName, itemId: itemId });
    setIsModalOpen(true);
  };


  const handleToggleStatus = async (id, currentStatus) => {
    if (currentStatus === "recovered") {
      const confirmOpen = window.confirm(
        "Do you want to reopen this case? The reward will be removed from your vault."
      );
      if (!confirmOpen) return;

      setActionId(id);
      try {
        const res = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/safe-hands/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "active" }),
        });

        if (res.ok) {
          setMyItems((prev) =>
            prev.map((item) => (item._id === id ? { ...item, status: "active" } : item))
          );
        }
      } catch (err) {
        console.error("Error reopening case:", err);
      } finally {
        setActionId(null);
      }
      return;
    }

    const feedbackMsg = window.prompt("🎉 Reward Unlock! Share your story for the community:");
    if (feedbackMsg === null || !feedbackMsg.trim()) return;

    setActionId(id);
    try {
      const res = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/safe-hands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedbackMsg, status: "recovered" }),
      });

      if (res.ok) {
        setMyItems((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, status: "recovered", feedback: feedbackMsg } : item
          )
        );
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
      const response = await fetch(
        `https://findit-backend-n3fm.onrender.com/api/items/user-delete/${id}`,
        { method: "DELETE" }
      );
      if (response.ok) setMyItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const earnedRewards = myItems.filter(
    (item) => String(item.status || "").toLowerCase().trim() === "recovered"
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] relative">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-3 bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-black italic">
                Verified <span className="text-blue-600">Student</span>
              </h1>
              <p className="text-slate-500 text-sm font-bold">{user?.email}</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-8 text-center text-white border-b-8 border-blue-600 shadow-xl">
            <p className="text-[10px] font-black uppercase opacity-50">Reports</p>
            <h2 className="text-4xl font-black italic">{myItems.length}</h2>
          </div>
        </div>

        {/* Rewards Vault Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 rounded-2xl text-pink-600 shadow-sm">
                <Gift size={24} />
              </div>
              <h2 className="text-2xl font-black italic uppercase">Rewards Vault</h2>
            </div>
          </div>

          {earnedRewards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {earnedRewards.map((item) => (
                <ScratchCard
                  key={item._id}
                  image={getUniqueCoupon(item._id)}
                  name={item.name}
                  itemId={item._id}
                  onReveal={handleRewardReveal} // Call parent on reveal
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-12 text-center text-slate-400">
              <Ticket size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-black italic uppercase text-xs">Reunite items to unlock rewards</p>
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-50 overflow-hidden">
          <h2 className="text-xl font-black italic mb-8 flex items-center gap-3">
            <Clock className="text-blue-600" /> Recent Activity
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              myItems.map((item) => (
                <div
                  key={item._id}
                  className={`p-6 rounded-[2rem] border-2 transition-all ${
                    item.status === "recovered" ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <img
                        src={item.image || "https://via.placeholder.com/100"}
                        className="w-16 h-16 rounded-2xl object-cover"
                        alt="item"
                      />
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">{item.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{item.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={actionId === item._id}
                        onClick={() => handleToggleStatus(item._id, item.status)}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
                          item.status === "recovered"
                            ? "bg-green-600 text-white hover:bg-orange-500 shadow-md"
                            : "bg-slate-900 text-white hover:bg-blue-600 shadow-md"
                        }`}
                      >
                        {actionId === item._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : item.status === "recovered" ? (
                          <>
                            <RefreshCcw size={14} /> Reopened Case
                          </>
                        ) : (
                          "Mark Reunited"
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-3 text-slate-300 hover:text-red-500"
                      >
                        <Trash2 size={20} />
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

      {/* --- NEW: GPay Style REWARD POPUP MODAL --- */}
      {isModalOpen && selectedReward && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
          
          <div className="bg-white rounded-[3.5rem] p-10 max-w-lg w-full relative shadow-2xl border-4 border-pink-100 animate-in zoom-in-95 duration-500">
            
            {/* Close Button */}
            <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-3 bg-slate-100 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors"
            >
                <X size={20} />
            </button>

            {/* Title / Celebration Icon */}
            <div className="text-center mb-8 mt-2">
                <Gift className="mx-auto text-pink-500 w-16 h-16 p-3 bg-pink-100 rounded-3xl mb-4" />
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">Reward <span className="text-pink-600">Unlocked!</span></h3>
                <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase flex items-center justify-center gap-2">You reunited <CornerDownRight size={10} className="text-blue-500" /> {selectedReward.name}</p>
            </div>

            {/* The Actual Coupon (Larger View) */}
            <div className="bg-slate-50 rounded-[2.5rem] p-6 border-2 border-dashed border-pink-200 shadow-inner mb-8">
                <img 
                    src={selectedReward.image} 
                    className="w-full h-auto max-h-64 object-contain mx-auto animate-in zoom-in-75 duration-300 delay-150" 
                    alt="Unlocked Coupon" 
                />
            </div>

            {/* Modal Actions (GPay style share buttons) */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-slate-900 text-white p-5 rounded-[2rem] text-xs font-black uppercase transition-all flex items-center justify-center gap-2 hover:bg-slate-700"
                >
                    <Star size={16} className="text-yellow-400" /> Great!
                </button>
                <button 
                  onClick={() => alert(`Sharing Reward: ${selectedReward.name}`)}
                  className="w-full bg-blue-600 text-white p-5 rounded-[2rem] text-xs font-black uppercase transition-all flex items-center justify-center gap-2 hover:bg-blue-700"
                >
                    <Share2 size={16} /> Share Now
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Account;