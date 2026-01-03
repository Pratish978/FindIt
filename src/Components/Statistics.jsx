import React, { useEffect, useState } from "react";
import { ShieldCheck, Zap, GraduationCap } from "lucide-react";

const WhyFindIt = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    const element = document.getElementById("why-section");
    if (element) observer.observe(element);
    return () => element && observer.unobserve(element);
  }, []);

  const features = [
    {
      title: "Verified Community",
      desc: "Every report is cross-referenced by campus location and user data to ensure only legitimate items are listed.",
      icon: <ShieldCheck size={36} />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Instant Reporting",
      desc: "Our optimized workflow allows you to upload photos and tag locations in under 30 seconds.",
      icon: <Zap size={36} />,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Campus Focused",
      desc: "Unlike generic lost & found apps, FindIt is built specifically for your university's layout and safety protocols.",
      icon: <GraduationCap size={36} />,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
  ];

  return (
    <section 
      id="why-section" 
      className="w-full py-28 bg-[#ffffff] relative overflow-hidden px-6"
    >
      {/* Soft Background Accents */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-blue-50/50 rounded-full blur-3xl opacity-60"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Designed for <span className="text-blue-600 font-black">Success</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            We provide a secure and efficient ecosystem to bridge the gap between lost items and their owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((item, i) => (
            <div
              key={i}
              style={{ transitionDelay: `${i * 150}ms` }}
              className={`group relative bg-white rounded-4xl p-10 
              border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] 
              hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.15)]
              hover:-translate-y-2 transition-all duration-700
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              {/* Icon Circle */}
              <div className={`w-20 h-20 flex items-center justify-center rounded-2xl mb-8
                group-hover:rotate-10 transition-transform duration-500
                ${item.bgColor} ${item.iconColor}`}>
                {item.icon}
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">
                {item.title}
              </h3>
              
              <p className="text-slate-500 leading-relaxed text-lg">
                {item.desc}
              </p>

              {/* Minimalist Bottom Indicator */}
              <div className="mt-8 w-12 h-1 bg-slate-100 group-hover:w-full group-hover:bg-blue-600 transition-all duration-500 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyFindIt;