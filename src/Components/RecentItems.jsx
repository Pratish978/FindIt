import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Package, ChevronLeft, ChevronRight, Sparkles, CheckCircle, Lock } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const RecentItem = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://findit-backend-n3fm.onrender.com/api/items/all')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // Using a larger slice ensures the loop has enough items to stay "continuous"
        setRecentItems(sorted.slice(0, 15)); 
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-24 bg-[#f8fafc] overflow-hidden">
      {/* CSS for Seamless Linear Motion */}
      <style>{`
        .continuous-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] bg-blue-50 w-fit px-4 py-1.5 rounded-full border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Live Campus Feed
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1]">
              Recent <span className="text-blue-600">Activity</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button className="swiper-prev-btn p-4 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <ChevronLeft size={20} />
              </button>
              <button className="swiper-next-btn p-4 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black uppercase tracking-widest text-xs">Syncing Feed...</p>
          </div>
        ) : (
          <div className="relative group">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              loop={true}
              // --- HIGH SPEED SETTINGS ---
              speed={2000} 
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true, 
              }}
              // ---------------------------
              navigation={{ nextEl: ".swiper-next-btn", prevEl: ".swiper-prev-btn" }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 }, // Added a tier for wider screens/faster feel
              }}
              className="pb-12 px-2 continuous-swiper"
            >
              {recentItems.map((item) => {
                const isRecovered = item.status === 'recovered';
                const isFoundType = item.itemType === 'found';
                
                return (
                  <SwiperSlide key={item._id} className="h-auto">
                    <div className={`bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-xl transition-all duration-500 group/card h-full flex flex-col ${isRecovered ? 'opacity-90' : 'hover:shadow-blue-200/30'}`}>
                      
                      {/* Image Container */}
                      <div className="relative h-64 w-full rounded-[2rem] overflow-hidden mb-6 bg-slate-100 flex items-center justify-center">
                        {item.image ? (
                          <>
                            <img 
                              src={item.image} 
                              alt="" 
                              className={`absolute inset-0 w-full h-full object-contain blur-2xl opacity-40 ${isRecovered ? 'grayscale' : ''}`} 
                            />
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className={`relative z-10 max-w-full max-h-full object-contain transition-all duration-700 
                                ${isRecovered ? 'grayscale' : ''}
                                ${isFoundType && !isRecovered ? 'blur-xl grayscale opacity-60' : ''} 
                              `} 
                            />
                          </>
                        ) : (
                          <Package size={48} className="text-slate-300" />
                        )}

                        {/* Lock Overlay for Found Items */}
                        {isFoundType && !isRecovered && (
                           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/5 backdrop-blur-[2px]">
                              <div className="bg-white/90 p-3 rounded-full shadow-lg mb-2">
                                <Lock size={20} className="text-slate-800" />
                              </div>
                              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest bg-white/80 px-3 py-1 rounded-full">
                                Details Protected
                              </span>
                           </div>
                        )}

                        {/* RECOVERED OVERLAY */}
                        {isRecovered && (
                          <div className="absolute inset-0 z-30 bg-green-600/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                            <CheckCircle size={48} className="mb-2 animate-bounce" />
                            <span className="font-black uppercase tracking-[0.2em] text-xs">Returned</span>
                          </div>
                        )}
                        
                        {!isRecovered && (
                          <div className="absolute top-5 left-5 z-20">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border ${
                              item.itemType === 'lost' ? 'bg-red-500 text-white border-red-400' : 'bg-indigo-600 text-white border-indigo-400'
                            }`}>
                              {item.itemType}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="px-4 pb-4 grow flex flex-col">
                        <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-[0.15em] mb-3">
                          <MapPin size={12} /> {item.location || "Campus"}
                        </div>
                        
                        <h3 className={`text-2xl font-black mb-3 line-clamp-1 transition-colors ${isRecovered ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {item.name}
                        </h3>
                        
                        <p className={`text-slate-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed transition-all duration-500 ${isFoundType && !isRecovered ? 'blur-md select-none opacity-40' : ''}`}>
                          {isRecovered ? "Case solved successfully." : item.description}
                        </p>
                        
                        <Link 
                          to={item.itemType === 'lost' ? "/all-lost" : "/all-found"}
                          className={`mt-auto w-full py-4 rounded-2xl font-bold text-sm transition-all text-center flex items-center justify-center gap-2 ${
                            isRecovered 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-200'
                          }`}
                        >
                          {isRecovered ? "Case Closed" : "Verify & View"} <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentItem;