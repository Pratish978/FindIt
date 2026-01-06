import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Package, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
// Import Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const RecentItem = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/items/all')
      .then(res => res.json())
      .then(data => {
        // Sort by newest and take top 8
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentItems(sorted.slice(0, 8));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-24 bg-[#f8fafc] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] bg-blue-50 w-fit px-4 py-1.5 rounded-full border border-blue-100">
              <Sparkles size={12} className="animate-pulse" /> Live Campus Feed
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1]">
              Freshly <span className="text-blue-600">Discovered</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/all-lost" className="group hidden md:flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm hover:shadow-md">
              View All <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {/* Custom Navigation Arrows */}
            <div className="flex gap-2">
              <button className="swiper-prev-btn p-4 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-30">
                <ChevronLeft size={20} />
              </button>
              <button className="swiper-next-btn p-4 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-30">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-112.5 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black uppercase tracking-widest text-xs">Scanning Campus...</p>
          </div>
        ) : (
          <div className="relative group">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation={{
                nextEl: ".swiper-next-btn",
                prevEl: ".swiper-prev-btn",
              }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="pb-12! px-2!"
            >
              {recentItems.map((item) => (
                <SwiperSlide key={item._id} className="h-auto">
                  <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-200/30 transition-all duration-500 group/card h-full flex flex-col">
                    
                    {/* Image Container with Contain + Blur */}
                    <div className="relative h-64 w-full rounded-4xl overflow-hidden mb-6 bg-slate-100 flex items-center justify-center">
                      {item.image ? (
                        <>
                          {/* Blurred Background Layer */}
                          <img 
                            src={item.image} 
                            alt="" 
                            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125" 
                          />
                          {/* Main Image Layer */}
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="relative z-10 max-w-full max-h-full object-contain group-hover/card:scale-110 transition-transform duration-700" 
                          />
                        </>
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <Package size={64} strokeWidth={1} />
                        </div>
                      )}
                      
                      {/* Floating Type Badge */}
                      <div className="absolute top-5 left-5 z-20">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border ${
                          item.itemType === 'lost' 
                          ? 'bg-red-500 text-white border-red-400' 
                          : 'bg-indigo-600 text-white border-indigo-400'
                        }`}>
                          {item.itemType}
                        </span>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="px-4 pb-4 grow flex flex-col">
                      <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-[0.15em] mb-3">
                        <MapPin size={12} /> {item.college}
                      </div>
                      
                      <h3 className="text-2xl font-black text-slate-800 mb-3 line-clamp-1 group-hover/card:text-blue-600 transition-colors duration-300">
                        {item.name}
                      </h3>
                      
                      <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                        {item.description}
                      </p>
                      
                      <Link 
                        to={item.itemType === 'lost' ? "/all-lost" : "/all-found"}
                        className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                      >
                        View Details <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-8 md:hidden text-center">
            <Link to="/all-lost" className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 w-full justify-center">
              Explore All <ArrowRight size={18} />
            </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentItem;