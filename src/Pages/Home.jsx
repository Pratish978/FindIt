import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Hero from "../Components/HeroSection";
import LostSection from "../Components/LostSection";
import FindSection from "../Components/FindSection";
import RecentItems from "../Components/RecentItems";
import WhyFindIt from "../Components/WhyFindIt";
import Statistics from "../Components/Statistics";
import Footer from "../Components/Footer";
import { Quote, MessageSquare } from "lucide-react";
import { API_BASE_URL } from "../config"; 

const Home = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    // API Call to fetch everything
    fetch(`${API_BASE_URL}/api/items/all`) 
      .then(res => res.json())
      .then(data => {
        // FILTER LOGIC:
        // 1. Item status 'recovered' hona chahiye
        // 2. Feedback string empty nahi honi chahiye
        const feedbackStories = data.filter(item => 
          item.status === 'recovered' && item.feedback && item.feedback.trim() !== ""
        );
        
        // Newest feedback top par dikhane ke liye reverse()
        setStories(feedbackStories.reverse());
      })
      .catch(err => console.error("Error fetching stories:", err));
  }, []);

  return (
    <div className="overflow-x-hidden bg-[#f8fafc]">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center animate-fade-down">
        <Hero />
      </div>

      <div className="min-h-screen flex items-center justify-center animate-fade-up">
        <LostSection />
      </div>
      
      <div className="min-h-screen flex items-center justify-center animate-fade-up">
        <FindSection />
      </div>

      <div className="py-24 animate-fade-up">
        <RecentItems />
      </div>

      {/* STUDENT SUCCESS STORIES SECTION */}
      {stories.length > 0 && (
        <section className="pb-24 px-6 max-w-6xl mx-auto animate-fade-up">
          <div className="flex items-center gap-3 mb-10 justify-center md:justify-start">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <MessageSquare size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">
              Student <span className="text-blue-600">Success Stories</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div 
                key={story._id} 
                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col"
              >
                {/* Image Box - CONTAIN added */}
                {story.image && (
                  <div className="w-full h-48 bg-slate-50 rounded-3xl mb-4 overflow-hidden flex items-center justify-center">
                    <img 
                      src={story.image} 
                      alt="Recovered" 
                      className="max-w-full max-h-full object-contain" 
                    />
                  </div>
                )}

                <div className="relative grow">
                  <Quote className="absolute top-0 right-0 text-blue-50" size={40} />
                  <p className="text-slate-600 text-sm italic mb-8 leading-relaxed relative z-10 pt-2">
                    "{story.feedback}"
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-slate-50 pt-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-xs font-black text-white">
                    {story.userEmail?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-slate-800 text-xs truncate">
                      {story.userEmail?.split('@')[0]}
                    </h4>
                    <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest truncate">
                      {story.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <WhyFindIt />
      <Statistics />
      <Footer />
    </div>
  );
};

export default Home;