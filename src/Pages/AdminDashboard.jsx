import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { 
  Package, CheckCircle, AlertCircle, 
  Trash2, Lock, ShieldCheck, Search, 
  SearchIcon, RefreshCcw, MapPin, User, Mail, AlignLeft, ShieldAlert, ArrowRight
} from "lucide-react";
import { API_BASE_URL } from "../config";

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState({ totalItems: 0, lostCount: 0, foundCount: 0, recoveredCount: 0, escalatedCount: 0 });
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = "Pratishadmin"; 

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, itemsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/stats`),
        fetch(`${API_BASE_URL}/api/items/all`)
      ]);
      const statsData = await statsRes.json();
      const itemsData = await itemsRes.json();
      
      setStats(statsData);
      setItems(itemsData.reverse());
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
    } else {
      alert("Invalid Security Credentials");
      setPassword("");
    }
  };

  // --- FIXED RECOVER LOGIC ---
  const handleStatusUpdate = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/items/safe-hands/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.success) {
        // Update the item in the local list immediately
        setItems(items.map(item => item._id === id ? { ...item, status: data.item.status } : item));
        loadDashboardData(); // Refresh stats counters
      }
    } catch (err) { 
      console.error("Update Error:", err);
      alert("Failed to update status.");
    }
  };

  // --- FIXED DELETE LOGIC ---
  const handleDelete = async (id) => {
    if (window.confirm("CRITICAL: Permanent deletion of record. Proceed?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/items/admin-delete/${id}`, { 
          method: 'DELETE' 
        });
        const data = await response.json();

        if (data.success) {
          setItems(items.filter(item => item._id !== id));
          setStats(prev => ({ ...prev, totalItems: prev.totalItems - 1 }));
        } else {
          alert("Delete failed: " + data.message);
        }
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 text-center">
            <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12 shadow-xl shadow-indigo-200">
              <Lock className="text-white" size={32} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">System Locked</h2>
            <p className="text-slate-400 mb-10 font-bold uppercase text-[10px] tracking-widest">Admin Authentication Required</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder="Master Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-[1.5rem] outline-none text-center font-black tracking-widest transition-all" 
              />
              <button className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl">
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-[1700px] mx-auto">
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin <span className="text-indigo-600">Command</span></h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Database Oversight</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/police-portal" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2">
              <ShieldAlert size={16} /> Police Portal <ArrowRight size={14} />
            </Link>
            <button onClick={loadDashboardData} className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setIsAdmin(false)} className="bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
              Terminate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          <StatCard icon={<Package/>} label="Total Records" value={stats.totalItems} color="blue" />
          <StatCard icon={<AlertCircle/>} label="Active Lost" value={stats.lostCount} color="red" />
          <StatCard icon={<Search/>} label="Active Found" value={stats.foundCount} color="indigo" />
          <StatCard icon={<CheckCircle/>} label="Recovered" value={stats.recoveredCount} color="green" />
          <StatCard icon={<ShieldAlert/>} label="Escalated" value={stats.escalatedCount || 0} color="orange" />
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative w-full md:w-96">
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search database..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white rounded-[1.5rem] border-2 border-slate-200 focus:border-indigo-500 transition-all outline-none font-bold text-slate-700" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6">Item</th>
                  <th className="px-10 py-6">Type</th>
                  <th className="px-10 py-6">Reporter</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map(item => (
                  <tr key={item._id} className="hover:bg-indigo-50/10 transition-all group">
                    <td className="px-10 py-8 font-black text-slate-900">{item.name}</td>
                    <td className="px-10 py-8 uppercase text-[10px] font-bold">{item.itemType}</td>
                    <td className="px-10 py-8 text-xs">{item.userEmail}</td>
                    <td className="px-10 py-8">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.status === 'recovered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {item.status || 'Active'}
                       </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleStatusUpdate(item._id)} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    red: "text-red-600 bg-red-50 border-red-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    green: "text-green-600 bg-green-50 border-green-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100" 
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-lg transition-all group">
      <div className={`p-5 rounded-[1.5rem] border transition-all group-hover:scale-110 ${colors[color]}`}>
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;