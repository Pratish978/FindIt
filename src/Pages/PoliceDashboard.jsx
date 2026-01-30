import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { ShieldCheck, Clock, FileText, CheckCircle, AlertCircle, Search } from "lucide-react";

const PoliceDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchEscalatedItems = async () => {
    try {
      const res = await fetch("https://findit-backend-n3fm.onrender.com/api/items/escalated-list");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch escalated items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalatedItems();
  }, []);

  const handleVerify = async (id) => {
    if (!window.confirm("Verify this report and generate an official Case ID?")) return;

    try {
      const res = await fetch(`https://findit-backend-n3fm.onrender.com/api/items/police-verify/${id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        alert("Verification Successful! Official Case ID Generated.");
        fetchEscalatedItems(); // Refresh list
      }
    } catch (err) {
      alert("Verification failed.");
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(filter.toLowerCase()) || 
    item.userEmail.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-bold text-slate-500">
      Verifying Security Protocols...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-28 px-6 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <ShieldCheck className="text-blue-600" size={36} /> Police Verification Portal
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Monitoring Escalated Lost Reports (24h+ Inactive)</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Item or Email..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl w-full md:w-80 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Pending Review</p>
            <h2 className="text-4xl font-black text-orange-500">{items.filter(i => i.status !== 'verified').length}</h2>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Verified Cases</p>
            <h2 className="text-4xl font-black text-green-600">{items.filter(i => i.status === 'verified').length}</h2>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Escalations</p>
            <h2 className="text-4xl font-black text-slate-900">{items.length}</h2>
          </div>
        </div>

        {/* Items List */}
        <div className="grid grid-cols-1 gap-4 mb-20">
          {filteredItems.length > 0 ? filteredItems.map((item) => (
            <div key={item._id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
              
              <div className="flex items-center gap-5 w-full">
                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden">
                  {item.image ? <img src={item.image} alt="item" className="h-full w-full object-cover" /> : <FileText />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500"><Clock size={14}/> {new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-600"><AlertCircle size={14}/> {item.userEmail}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                {item.status === 'verified' ? (
                  <div className="bg-green-50 text-green-700 px-6 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm w-full justify-center">
                    <CheckCircle size={18} /> Verified: {item.policeCaseId}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleVerify(item._id)}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-blue-600 transition-colors w-full md:w-auto whitespace-nowrap"
                  >
                    Verify & Issue Case ID
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-400 font-bold">No items currently requiring police intervention.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;