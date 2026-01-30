import React, { useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { 
  CheckCircle, Trash2, Package, MapPin, Loader2, 
  Calendar, PartyPopper, ArrowUpRight, ShieldCheck, Clock, Download, ShieldAlert
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

  // --- NEW: RECEIPT DOWNLOAD LOGIC ---
  const handleDownloadReceipt = (item) => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date(item.verifiedAt || Date.now()).toLocaleDateString();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Official Receipt - ${item.policeCaseId}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 4px solid #2563eb; padding-bottom: 20px; }
            .badge { background: #dbeafe; color: #2563eb; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
            .details { margin-top: 40px; line-height: 1.6; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
            .footer { margin-top: 100px; text-align: center; font-size: 12px; color: #94a3b8; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OFFICIAL POLICE VERIFICATION</h1>
            <p class="badge">CASE ID: ${item.policeCaseId}</p>
          </div>
          <div class="details">
            <div class="row"><strong>Item Name:</strong> <span>${item.name}</span></div>
            <div class="row"><strong>Reported By:</strong> <span>${item.userName || item.userEmail}</span></div>
            <div class="row"><strong>Location:</strong> <span>${item.location}</span></div>
            <div class="row"><strong>Date Verified:</strong> <span>${dateStr}</span></div>
            <div class="row"><strong>Status:</strong> <span>Officially Escalated to Security Portal</span></div>
          </div>
          <div class="footer">
            <p>This is a computer-generated document verified via the FindIt Security Protocol.</p>
            <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">Print Official Copy</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this report? This action cannot be undone.")) return;
    try {
      const response = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/${id}`, { method: "DELETE" });
      if (response.ok) setItems(prev => prev.filter((item) => item._id !== id));
    } catch (err) { console.error("Delete Error:", err); }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'recovered' ? 'active' : 'recovered';
    try {
      const response = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/safe-hands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        setItems(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
      }
    } catch (err) { console.error("Status update failed"); }
  };

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
        
        {/* Header Section */}
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {items.map((item) => (
              <div key={item._id} className={`bg-white rounded-[3rem] overflow-hidden shadow-xl transition-all duration-500 border-2 group flex flex-col ${item.status === 'recovered' ? 'border-green-100 opacity-90' : 'border-transparent hover:border-blue-100'}`}>
                
                {/* Image Section */}
                <div className="relative h-64 bg-slate-100 overflow-hidden">
                  <img src={item.image || "/api/placeholder/400/320"} alt={item.name} className="w-full h-full object-contain" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${item.itemType === 'lost' ? 'bg-red-500/90 text-white' : 'bg-indigo-600/90 text-white'}`}>
                      {item.itemType}
                    </span>
                    {item.status === 'verified' && (
                      <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <ShieldAlert size={12} /> Police Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-10 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-slate-800">{item.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase mt-1">
                      <Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* POLICE VERIFIED RECEIPT SECTION */}
                  {item.status === 'verified' && (
                    <div className="mb-6 bg-blue-50 border border-blue-100 p-5 rounded-[2rem]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase">Case ID</span>
                        <span className="text-sm font-black text-slate-900">{item.policeCaseId}</span>
                      </div>
                      <button 
                        onClick={() => handleDownloadReceipt(item)}
                        className="w-full bg-blue-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                      >
                        <Download size={14} /> Download Receipt
                      </button>
                    </div>
                  )}

                  <div className="flex items-start gap-3 text-slate-600 text-sm font-bold mb-10 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <MapPin size={18} className="text-blue-600 shrink-0" />
                    <span className="line-clamp-2">{item.location}</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-4">
                    <button onClick={() => handleStatusUpdate(item._id, item.status)} className={`flex-[2] py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest ${item.status === 'recovered' ? 'bg-green-50 text-green-600' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
                      {item.status === 'recovered' ? 'Re-open' : 'Safe Hands'}
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="flex-1 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center">
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