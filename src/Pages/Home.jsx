import React from "react";
import Navbar from "../Components/Navbar";
import Hero from "../Components/HeroSection";
import LostSection from "../Components/LostSection";
import FindSection from "../Components/FindSection";
import RecentItems from "../Components/RecentItems";
import WhyFindIt from "../Components/WhyFindIt";
import Statistics from "../Components/Statistics";
import Footer from "../Components/Footer";

const Home = () => {
  return (
    <div className="overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <div className="min-h-screen flex items-center justify-center animate-fade-down">
        <Hero />
      </div>

      {/* Lost Section */}
      <div className="min-h-screen flex items-center justify-center animate-fade-up">
        <LostSection />
      </div>

      {/* Found Section */}
      <div className="min-h-screen flex items-center justify-center animate-fade-up">
        <FindSection />
      </div>

      {/* Recent Items */}
      <div className="py-24 animate-fade-up">
        <RecentItems />
      </div>

      {/* Why Find It */}
    
        <WhyFindIt />
      {/* Statistics */}
        <Statistics />
      <Footer />
    </div>
  );
};

export default Home;
