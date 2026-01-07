import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { Users, Package, CheckCircle, AlertCircle, Trash2, Lock, ShieldCheck, Search, SearchIcon, ExternalLink } from "lucide-react";

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState({ totalItems: 0, lostCount: 0, foundCount: 0, recoveredCount: 0 });
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const ADMIN_PASSWORD = "Pratishadmin"; 

  useEffect(() => {
    if (isAdmin) {
      fetch('http://localhost:5000/api/admin/stats').then(res => res.json()).then(setStats);
      fetch('http://localhost:5000/api/items/all').then(res => res.json()).then(setItems);
    }
  }, [isAdmin]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAdmin(true);
    else alert("Incorrect Admin Password!");
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/items/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      // Refresh local list
      setItems(items.map(item => item._id === id ? { ...item, status: newStatus } : item));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this report?")) {
      await fetch(`http://localhost:5000/api/items/${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item._id !== id));
    }
  };

  // Filter items based on search
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6 font-sans">
        <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl text-center">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-600" size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Admin Portal</h2>
          <p className="text-slate-500 mb-8 font-medium">Restricted Access</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Master Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none text-center font-bold" />
            <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all">Authorize Access</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-12 px-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900">System <span className="text-blue-600">Command</span></h1>
            <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Management Dashboard</p>
          </div>
          <button onClick={() => setIsAdmin(false)} className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-2 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-all">Log Out</button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<Package/>} label="Total Reports" value={stats.totalItems} color="blue" />
          <StatCard icon={<AlertCircle/>} label="Active Lost" value={stats.lostCount} color="red" />
          <StatCard icon={<Search/>} label="Active Found" value={stats.foundCount} color="indigo" />
          <StatCard icon={<CheckCircle/>} label="Total Resolved" value={stats.recoveredCount} color="green" />
        </div>

        {/* Search & Table Area */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-black text-slate-800">Database Records</h2>
            <div className="relative w-full md:w-80">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search by item or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="p-6">Item Detail</th>
                  <th className="p-6">Type</th>
                  <th className="p-6">Reporter</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50/30 transition-all">
                    <td className="p-6">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.location}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${item.itemType === 'lost' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>
                        {item.itemType}
                      </span>
                    </td>
                    <td className="p-6 text-xs font-bold text-slate-500">{item.userEmail}</td>
                    <td className="p-6">
                      <div className={`flex items-center gap-2 text-xs font-black uppercase ${item.status === 'recovered' ? 'text-green-500' : 'text-orange-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.status === 'recovered' ? 'bg-green-500 animate-pulse' : 'bg-orange-400'}`}></div>
                        {item.status || 'Active'}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        {item.status !== 'recovered' && (
                          <button onClick={() => handleStatusUpdate(item._id, 'recovered')} title="Mark as Resolved" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><CheckCircle size={18} /></button>
                        )}
                        <button onClick={() => handleDelete(item._id)} title="Delete Post" className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
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
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
    indigo: "text-indigo-600 bg-indigo-50",
    green: "text-green-600 bg-green-50"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${colors[color]}`}>{React.cloneElement(icon, { size: 28 })}</div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;