import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Trash2, Package, MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const Account = () => {
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    fetchItems();
  }, [user]);

  const fetchItems = () => {
    if (user?.email) {
      fetch('http://localhost:5000/api/items/all')
        .then(res => res.json())
        .then(data => {
          // Filter to show ONLY items belonging to the logged-in user
          const filtered = data.filter(item => item.userEmail === user.email);
          setMyItems(filtered);
          setLoading(false);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setLoading(false);
        });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Has this item been returned? Deleting will remove the report permanently.")) {
      setDeletingId(id);
      try {
        // We will call the delete API (Make sure to add this route in backend!)
        const response = await fetch(`http://localhost:5000/api/items/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Smoothly remove from UI without refreshing
          setMyItems(myItems.filter(item => item._id !== id));
        }
      } catch (error) {
        alert("Error deleting item");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Welcome, <span className="text-blue-600">Student</span></h1>
              <p className="text-slate-500 font-medium">{user?.email}</p>
            </div>
          </div>
          
          <div className="bg-blue-600 rounded-[2.5rem] p-8 shadow-xl shadow-blue-100 flex flex-col justify-center text-white">
            <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Total Actions</p>
            <h2 className="text-5xl font-black">{myItems.length}</h2>
          </div>
        </div>

        {/* My Activity Section */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Clock className="text-blue-600" /> My Recent Activity
            </h2>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-bold">Syncing your data...</p>
              </div>
            ) : myItems.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem]">
                <Package size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold text-lg">No activity found yet.</p>
                <p className="text-slate-300 text-sm">When you report items, they will appear here.</p>
              </div>
            ) : (
              myItems.map(item => (
                <div key={item._id} className="group relative bg-slate-50 rounded-[2rem] p-6 border border-transparent hover:border-blue-200 hover:bg-white transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      {/* Status Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.itemType === 'lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {item.itemType === 'lost' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-slate-800 text-lg">{item.name}</h4>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${item.itemType === 'lost' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                            {item.itemType}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                          <span className="flex items-center gap-1"><MapPin size={14} /> {item.college}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-red-500 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all duration-300"
                      >
                        {deletingId === item._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        Remove Report
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
    </div>
  );
};

export default Account;