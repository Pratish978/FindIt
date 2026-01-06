import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { MapPin, Search, Image as ImageIcon, MessageCircle, PackageCheck } from "lucide-react";

const FoundItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/items/all')
      .then(res => res.json())
      .then(data => {
        // Filter: ONLY 'found' AND ONLY 'active' (not recovered)
        const activeFound = data.filter(i => i.itemType === 'found' && i.status !== 'recovered');
        setItems(activeFound);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  }, []);

  const handleContact = (item) => {
    const contactInfo = item.contact.trim();
    const message = `Hi! I saw on FindIt that you found a "${item.name}" at ${item.college}. I think it belongs to me. Could we coordinate?`;
    const encodedMessage = encodeURIComponent(message);

    const isPhoneNumber = /^\d+$/.test(contactInfo.replace(/\+/g, '').replace(/\s/g, ''));

    if (isPhoneNumber) {
      const cleanNumber = contactInfo.replace(/\D/g, '');
      const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
      window.open(`https://wa.me/${finalNumber}?text=${encodedMessage}`, '_blank');
    } else if (contactInfo.includes('@')) {
      window.location.href = `mailto:${contactInfo}?subject=Regarding the ${item.name} you found&body=${message}`;
    } else {
      alert(`Contact Info: ${contactInfo}\n\nPlease reach out to them directly to claim your item.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-12">
            <span className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Recovery Hub</span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-4">Recent <span className="text-indigo-600">Found</span> Items</h1>
            <p className="text-slate-500 mt-4 text-lg">Is one of these yours? Contact the finder to get it back.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-slate-400 font-bold">Scanning for found items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {items.map((item) => (
                <div key={item._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 group">
                  
                  <div className="relative h-64 bg-slate-100 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <PackageCheck size={48} className="mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Photo Uploaded</p>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                        {item.college}
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-3">{item.name}</h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 h-14">{item.description}</p>
                    
                    <div className="space-y-3 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <MapPin size={16} className="text-indigo-500" />
                        </div>
                        {item.location}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleContact(item)}
                      className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:shadow-green-100"
                    >
                      <MessageCircle size={18} />
                      Claim This Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <Search size={64} className="mx-auto text-slate-100 mb-6" />
              <p className="text-slate-400 text-xl font-bold">No found items reported yet.</p>
              <p className="text-slate-300 mt-2 font-medium text-sm">Check back later or refresh the page.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FoundItems;