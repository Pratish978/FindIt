import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles, ShieldCheck, Search } from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className={`border-b border-slate-100 transition-all duration-300 ${isOpen ? 'bg-blue-50/30' : ''}`}>
    <button 
      onClick={onClick}
      className="w-full py-7 px-6 flex items-center justify-between text-left group"
    >
      <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-700'}`}>
        {question}
      </span>
      <ChevronDown 
        className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-slate-600'}`} 
        size={20} 
      />
    </button>
    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
      <p className="px-6 pb-8 text-slate-500 font-medium leading-relaxed">
        {answer}
      </p>
    </div>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How do I report a found item?",
      answer: "Click on 'Report Item' in the Navbar, select 'I Found Something', and fill in the details. Remember to keep the image slightly vague or use our privacy tools to ensure only the true owner can claim it."
    },
    {
      question: "Is my contact information public?",
      answer: "No. Your email and phone number are never displayed publicly. When someone claims an item, our system sends you a secure email notification without exposing your address until you choose to reply."
    },
    {
      question: "How does the 'Verification' process work?",
      answer: "Since found item images are blurred, the owner must provide specific details (like a lock-screen wallpaper or a specific scratch) in their claim. If their description matches the item you have, you can then arrange a safe meeting."
    },
    {
      question: "Where should I meet someone to return an item?",
      answer: "We strictly recommend meeting in public campus areas during daylight hours, such as the library, canteen, or near campus security posts."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm mb-6">
              <Sparkles size={14} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Help Center</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
              Common <span className="text-blue-600">Questions</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Everything you need to know about the recovery process.</p>
          </div>

          <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {faqs.map((faq, index) => (
              <FAQItem 
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            ))}
          </div>

          <div className="mt-12 bg-blue-600 rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white mb-2">Still have questions?</h3>
              <p className="text-blue-100 mb-8 font-medium">We're here to help you get your belongings back.</p>
              <button 
                onClick={() => window.location.href = '/contact'}
                className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
              >
                Contact Support
              </button>
            </div>
            <HelpCircle className="absolute -left-10 -bottom-10 text-white/10" size={240} />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;