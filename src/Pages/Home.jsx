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
    // Fetches all items from the backend
    fetch(`${API_BASE_URL}/api/items/all`) 
      .then(res => res.json())
      .then(data => {
        // Filter: Only show items where a student has actually typed a feedback story
        const feedbackStories = data.filter(item => item.feedback && item.feedback.trim() !== "");
        
        // Logic: .reverse() ensures the newest feedback appears at the top
        // Removed .slice(0, 3) so ALL stories are now displayed
        setStories(feedbackStories.reverse());
      })
      .catch(err => console.error("Error fetching stories:", err));
  }, []);

  return (
    <div className="overflow-x-hidden bg-[#f8fafc]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center animate-fade-down">
        <Hero />
      </div>

      {/* Action Sections */}
      <div className="min-h-screen flex items-center justify-center animate-fade-up">
        <LostSection />
      </div>
      
      <div className="min-h-screen flex items-center justify-center animate-fade-up">
        <FindSection />
      </div>

      {/* Recent Activity */}
      <div className="py-24 animate-fade-up">
        <RecentItems />
      </div>

      {/* ALL Student Feedback Section */}
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

          {/* Grid Layout: Displays 3 per row on Desktop, 1 per row on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div 
                key={story._id} 
                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative flex flex-col justify-between"
              >
                {/* Visual Quote Icon */}
                <Quote 
                  className="absolute top-4 right-6 text-blue-50 group-hover:text-blue-100 transition-colors" 
                  size={48} 
                />
                
                {/* Feedback Text */}
                <p className="text-slate-600 text-sm italic mb-8 leading-relaxed relative z-10 pt-4">
                  "{story.feedback}"
                </p>

                {/* User Info Footer */}
                <div className="flex items-center gap-3 border-t border-slate-50 pt-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-lg shadow-blue-200">
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

      {/* Informational Sections */}
      <WhyFindIt />
      <Statistics />
      <Footer />
    </div>
  );
};

export default Home;