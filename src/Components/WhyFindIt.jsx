import React, { useEffect, useState } from "react";
import { ShieldCheck, Zap, GraduationCap, Rocket } from "lucide-react";

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
      title: "Verified Reports",
      desc: "Our team and community verify item details to prevent spam and ensure you get back what's yours.",
      icon: <ShieldCheck size={32} />,
      color: "blue",
    },
    {
      title: "Easy Reporting",
      desc: "A streamlined 3-step process to list items. Upload photos, add locations, and publish in seconds.",
      icon: <Zap size={32} />,
      color: "amber",
    },
    {
      title: "Campus Focused",
      desc: "Tailored specifically for university students. Filter by specific buildings, labs, or cafeteria areas.",
      icon: <GraduationCap size={32} />,
      color: "indigo",
    },
    {
      title: "Fast Recovery",
      desc: "Real-time notifications and an active community lead to a 70% faster recovery rate than traditional bins.",
      icon: <Rocket size={32} />,
      color: "green",
    },
  ];

  return (
    <section 
      id="why-section" 
      className="w-full py-24 bg-[#f8fafc] relative overflow-hidden px-6"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Why Choose <span className="text-blue-600">Find It</span>?
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
            The smartest way to reconnect students with their lost belongings using technology and community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, i) => (
            <div
              key={i}
              style={{ transitionDelay: `${i * 100}ms` }}
              className={`group relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 
              border border-white shadow-xl hover:shadow-2xl 
              transition-all duration-700 ease-out
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
            >
              {/* Icon Container */}
              <div className={`w-16 h-16 flex items-center justify-center rounded-2xl mb-8
                group-hover:scale-110 group-hover:rotate-6 transition-all duration-500
                ${i === 0 ? "bg-blue-100 text-blue-600" : ""}
                ${i === 1 ? "bg-amber-100 text-amber-600" : ""}
                ${i === 2 ? "bg-indigo-100 text-indigo-600" : ""}
                ${i === 3 ? "bg-green-100 text-green-600" : ""}
              `}>
                {item.icon}
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              
              <p className="text-slate-600 leading-relaxed font-medium">
                {item.desc}
              </p>

              {/* Decorative Corner Element */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-600/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}} />
    </section>
  );
};

export default WhyFindIt;