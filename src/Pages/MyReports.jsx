import React, { useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { CheckCircle, Trash2, Package, MapPin, Loader2, Calendar } from "lucide-react";

const MyReports = () => {
  const [user] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/items/all");
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report permanently?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(prev => prev.filter((item) => item._id !== id));
      } else {
        alert("Failed to delete.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleSafeHands = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/items/safe-hands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        setItems(prev => prev.map(item => 
          item._id === id ? { ...item, status: 'recovered' } : item
        ));
      }
    } catch (err) {
      console.error("Status update failed");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold animate-pulse">Syncing your reports...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="pt-32 px-6 max-w-7xl mx-auto pb-20">
        
        <header className="mb-12">
          <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            User Dashboard
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-4">
            My <span className="text-blue-600">Reports</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Manage your listings and mark items as found to remove them from public view.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm">
            <Package className="mx-auto text-slate-200 mb-6" size={80} />
            <h3 className="text-2xl font-bold text-slate-800">No activity yet</h3>
            <p className="text-slate-400 mt-2">Items you report will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group">
                
                {/* Image Section - Updated to object-contain with styled container */}
                <div className="relative h-64 bg-slate-200 flex items-center justify-center overflow-hidden">
                  {/* Background Blur for aesthetics */}
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110" 
                    />
                  )}
                  
                  <img 
                    src={item.image || "/api/placeholder/400/320"} 
                    alt={item.name} 
                    className="relative z-10 max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                  />
                  
                  {/* Status Overlay */}
                  {item.status === 'recovered' ? (
                    <div className="absolute inset-0 z-20 bg-green-600/80 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="text-white text-center p-4">
                        <CheckCircle size={48} className="mx-auto mb-2 drop-shadow-md" />
                        <span className="font-black uppercase tracking-widest text-sm">Item Recovered</span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-4 left-4 z-20">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${
                        item.itemType === 'lost' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'
                      }`}>
                        {item.itemType}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4 line-clamp-1">{item.name}</h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-2 text-slate-500 text-sm font-medium">
                      <MapPin size={16} className="text-blue-500 mt-0.5 shrink-0" />
                      <span>{item.location}, {item.college}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Calendar size={14} />
                      Reported on {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-3">
                    {item.status === 'active' && (
                      <button 
                        onClick={() => handleSafeHands(item._id)}
                        className="flex-1 bg-slate-900 hover:bg-green-600 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Mark Found
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="p-4 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                      title="Delete Report"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyReports;