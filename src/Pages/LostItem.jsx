import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, Search, Image as ImageIcon, MessageCircle } from "lucide-react";

const LostItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/items/all')
      .then(res => res.json())
      .then(data => {
        // Filter: ONLY 'lost' AND ONLY 'active' (not recovered)
        const activeLost = data.filter(i => i.itemType === 'lost' && i.status !== 'recovered');
        setItems(activeLost);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  }, []);

  const handleContact = (item) => {
    const contactInfo = item.contact.trim();
    const message = `Hi! I found your "${item.name}" you reported lost at ${item.college}.`;
    const encodedMessage = encodeURIComponent(message);

    const isPhoneNumber = /^\d+$/.test(contactInfo.replace(/\+/g, '').replace(/\s/g, ''));

    if (isPhoneNumber) {
      const cleanNumber = contactInfo.replace(/\D/g, '');
      const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
      window.open(`https://wa.me/${finalNumber}?text=${encodedMessage}`, '_blank');
    } else if (contactInfo.includes('@')) {
      window.location.href = `mailto:${contactInfo}?subject=Found your ${item.name}&body=${message}`;
    } else {
      alert(`Contact Info: ${contactInfo}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Community Gallery</span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-4">Recent <span className="text-blue-600">Lost</span> Reports</h1>
            <p className="text-slate-500 mt-4 text-lg">Check if you found any of the items listed below.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-400 font-bold">Loading lost items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {items.map((item) => (
                <div key={item._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-slate-100 group">
                  <div className="relative h-64 bg-slate-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-contain justify-center text-slate-300">
                        <ImageIcon size={48} />
                        <p className="text-[10px] font-black uppercase mt-2">No Image</p>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-md text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm">
                        {item.college}
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{item.name}</h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">{item.description}</p>
                    
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600 mb-8 pt-4 border-t border-slate-50">
                      <MapPin size={16} className="text-blue-500" />
                      {item.location}
                    </div>

                    <button 
                      onClick={() => handleContact(item)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      I Found This!
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <Search size={64} className="mx-auto text-slate-100 mb-6" />
              <p className="text-slate-400 text-xl font-bold">All reported items have been returned! 🎉</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LostItems;