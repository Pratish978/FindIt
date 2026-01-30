import React, { useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { 
  CheckCircle, Trash2, Package, MapPin, Loader2, 
  Calendar, PartyPopper, ShieldCheck, Clock, Download, ShieldAlert 
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

  // --- UPGRADED: PROFESSIONAL RECEIPT LOGIC ---
  const handleDownloadReceipt = (item) => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date(item.verifiedAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Police_Clearance_${item.policeCaseId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 0; margin: 0; color: #1e293b; background: #f1f5f9; }
            .certificate {
              background: white; width: 750px; margin: 40px auto; padding: 60px;
              position: relative; border: 12px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2);
            }
            .certificate::before {
              content: "VERIFIED"; position: absolute; top: 50%; left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px;
              font-weight: 900; color: rgba(241, 245, 249, 0.6); z-index: 0; pointer-events: none;
            }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 30px; position: relative; z-index: 1; }
            .govt-text { text-transform: uppercase; font-size: 11px; letter-spacing: 3px; color: #64748b; margin-bottom: 5px; }
            h1 { margin: 10px 0; font-size: 26px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
            .case-badge { 
              display: inline-block; background: #1e293b; color: white; padding: 8px 20px; 
              border-radius: 4px; font-weight: bold; font-family: monospace; font-size: 16px; margin-top: 10px;
            }
            .content { margin-top: 40px; position: relative; z-index: 1; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
            .info-box { border-left: 4px solid #3b82f6; padding-left: 15px; }
            .label { font-size: 10px; text-transform: uppercase; font-weight: 900; color: #94a3b8; letter-spacing: 1px; }
            .value { font-size: 16px; font-weight: 700; color: #1e293b; margin-top: 4px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 1; }
            .official-seal {
              width: 110px; height: 110px; border: 4px double #3b82f6; border-radius: 50%;
              display: flex; align-items: center; justify-content: center; text-align: center;
              font-size: 10px; font-weight: 900; color: #3b82f6; transform: rotate(-15deg); opacity: 0.8;
            }
            .no-print-btn {
              position: fixed; bottom: 20px; right: 20px; padding: 15px 30px;
              background: #3b82f6; color: white; border: none; border-radius: 50px;
              font-weight: 900; cursor: pointer; box-shadow: 0 10px 15px rgba(0,0,0,0.1);
            }
            @media print { .no-print-btn { display: none; } body { background: white; } .certificate { margin: 0; border: 10px solid #1e293b; } }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="govt-text">Official Property Escalation Document</div>
              <h1>FindIt Security Protocol</h1>
              <div class="case-badge">CASE ID: ${item.policeCaseId}</div>
            </div>
            <div class="content">
              <div class="info-grid">
                <div class="info-box"><div class="label">Item Name</div><div class="value">${item.name}</div></div>
                <div class="info-box"><div class="label">Escalation Date</div><div class="value">${dateStr}</div></div>
                <div class="info-box"><div class="label">Registered Email</div><div class="value">${item.userEmail}</div></div>
                <div class="info-box"><div class="label">Location Reported</div><div class="value">${item.location}</div></div>
              </div>
              <p style="font-size: 12px; line-height: 1.6; color: #64748b; background: #f8fafc; padding: 15px; border-radius: 8px;">
                <strong>Note:</strong> This document serves as digital evidence of property loss. It has been automatically generated after the 24-hour escalation threshold and verified by the system administrator.
              </p>
            </div>
            <div class="footer">
              <div class="official-seal">VERIFIED BY<br>CAMPUS POLICE<br>PORTAL</div>
              <div style="text-align: center; border-top: 1px solid #1e293b; width: 180px; padding-top: 8px;">
                <div style="font-family: cursive; font-size: 18px;">Security_Auth</div>
                <div class="label" style="font-size: 8px;">Digital Signature</div>
              </div>
            </div>
          </div>
          <button class="no-print-btn" onclick="window.print()">PRINT RECEIPT</button>
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
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Private Vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 px-6 max-w-7xl mx-auto pb-20">
        
        {/* Stats Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-blue-600" size={20} />
              <span className="text-blue-600 text-xs font-black uppercase tracking-widest">My Personal Activity</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Report <span className="text-blue-600">History</span>
            </h1>
          </div>

          <div className="flex gap-4">
            <StatPill icon={<Clock size={20}/>} label="Active" count={activeCount} color="blue" />
            <StatPill icon={<PartyPopper size={20}/>} label="Resolved" count={recoveredCount} color="green" />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-200 shadow-sm">
            <Package className="text-slate-200 mx-auto mb-6" size={80} />
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">No records found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div key={item._id} className={`bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-2 transition-all group ${item.status === 'recovered' ? 'border-green-100' : 'border-transparent hover:border-blue-100'}`}>
                
                {/* Image & Type Badge */}
                <div className="relative h-60 bg-slate-50 overflow-hidden">
                  <img src={item.image || "/api/placeholder/400/320"} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-5 left-5 flex flex-col gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md ${item.itemType === 'lost' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}>
                      {item.itemType}
                    </span>
                    {item.status === 'verified' && (
                      <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1">
                        <ShieldAlert size={12} /> Police Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-1">{item.name}</h3>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                  </p>

                  {/* Receipt Download Box */}
                  {item.status === 'verified' && (
                    <div className="mb-6 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-3 px-1">
                        <span className="text-[9px] font-black text-blue-500 uppercase">Verification ID</span>
                        <span className="text-xs font-black text-slate-900">{item.policeCaseId}</span>
                      </div>
                      <button 
                        onClick={() => handleDownloadReceipt(item)}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                      >
                        <Download size={14} /> Download FIR Receipt
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-8 p-3 bg-slate-50 rounded-xl">
                    <MapPin size={16} className="text-blue-500" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleStatusUpdate(item._id, item.status)} 
                      className={`flex-[3] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${item.status === 'recovered' ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-200'}`}
                    >
                      {item.status === 'recovered' ? 'Unmark Found' : 'Safe Hands'}
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id)} 
                      className="flex-1 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
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

// Sub-component for stats
const StatPill = ({ icon, label, count, color }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 px-6">
    <div className={`p-3 rounded-xl ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black uppercase text-slate-400">{label}</p>
      <p className="text-xl font-black text-slate-900 leading-tight">{count}</p>
    </div>
  </div>
);

export default MyReports;