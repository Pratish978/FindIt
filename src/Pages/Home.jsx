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
import { API_BASE_URL } from "../config"; // Added for production

const Home = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/items/all`) // Updated URL
      .then(res => res.json())
      .then(data => {
        const feedbackStories = data.filter(item => item.feedback && item.feedback.trim() !== "");
        setStories(feedbackStories.reverse().slice(0, 3));
      })
      .catch(err => console.error("Error:", err));
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
      {stories.length > 0 && (
        <section className="pb-24 px-6 max-w-6xl mx-auto animate-fade-up">
          <div className="flex items-center gap-3 mb-10 justify-center md:justify-start">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <MessageSquare size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">
              Student <span className="text-blue-600">Feedback</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div key={story._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                <Quote className="absolute top-4 right-6 text-blue-50 group-hover:text-blue-100 transition-colors" size={32} />
                <p className="text-slate-600 text-sm italic mb-6 leading-relaxed relative z-10">"{story.feedback}"</p>
                <div className="flex items-center gap-3 border-t border-slate-50 pt-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white">
                    {story.userEmail?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{story.userEmail?.split('@')[0]}</h4>
                    <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest">{story.name}</p>
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