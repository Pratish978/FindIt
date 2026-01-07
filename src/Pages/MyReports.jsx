import React, { useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { CheckCircle, Trash2, Package, MapPin, Loader2, Calendar, PartyPopper } from "lucide-react";

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
      // Filter items to only show those belonging to the logged-in user
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
    if (!window.confirm("Are you sure? This will permanently remove the report from the database.")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(prev => prev.filter((item) => item._id !== id));
      } else {
        alert("Failed to delete the item.");
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
        // Update local state to show 'recovered' status immediately
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
      <p className="text-slate-500 font-bold animate-pulse">Fetching your activity...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 px-6 max-w-7xl mx-auto pb-20">
        
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
              Personal Vault
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Manage <span className="text-blue-600">Reports</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-medium max-w-2xl">
            Track the status of items you've reported. Once an item is returned, mark it as found to clear it from the public feed.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center">
            <div className="bg-slate-50 p-8 rounded-full mb-6">
              <Package className="text-slate-200" size={60} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nothing here yet</h3>
            <p className="text-slate-400 mt-2 font-medium">Any lost or found items you report will appear in this list.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 flex flex-col group relative">
                
                {/* Image Section */}
                <div className="relative h-60 bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img 
                    src={item.image || "/api/placeholder/400/320"} 
                    alt={item.name} 
                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${item.status === 'recovered' ? 'blur-sm grayscale' : ''}`} 
                  />
                  
                  {/* Status Overlay for Recovered Items */}
                  {item.status === 'recovered' && (
                    <div className="absolute inset-0 z-20 bg-green-600/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6">
                       <CheckCircle size={48} className="mb-2 animate-bounce" />
                       <span className="font-black uppercase tracking-widest text-sm">Case Resolved</span>
                       <p className="text-[10px] opacity-80 mt-1">Hidden from public view</p>
                    </div>
                  )}

                  <div className="absolute top-4 right-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md ${
                      item.itemType === 'lost' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                      {item.itemType}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-2xl font-black text-slate-800 line-clamp-1 mb-1">{item.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <Calendar size={12} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-500 text-sm font-bold mb-8">
                    <MapPin size={16} className="text-blue-600 shrink-0" />
                    <span className="line-clamp-2">{item.location}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto flex gap-3 pt-6 border-t border-slate-50">
                    {item.status !== 'recovered' ? (
                      <button 
                        onClick={() => handleSafeHands(item._id)}
                        className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <PartyPopper size={18} className="group-hover/btn:rotate-12 transition-transform" />
                        Mark Found
                      </button>
                    ) : (
                      <div className="flex-1 bg-green-50 text-green-600 py-4 rounded-2xl font-black text-xs uppercase text-center border border-green-100">
                        Success Story
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="p-4 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-slate-100 hover:border-red-100"
                      title="Permanently Delete"
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

export default MyReports;