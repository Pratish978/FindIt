import React from "react";

const RecentItems = () => {
  const items = [
    { name: "Black Wallet", location: "Library", date: "2 days ago", type: "Lost", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=400&auto=format&fit=crop" },
    { name: "Earpods", location: "Cafeteria", date: "1 day ago", type: "Found", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400&auto=format&fit=crop" },
    { name: "Silver Laptop", location: "Computer Lab", date: "5 days ago", type: "Lost", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80" },
    { name: "Blue Backpack", location: "Sports Complex", date: "3 hours ago", type: "Found", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop" },
    { name: "iPhone 13", location: "Lecture Hall 2", date: "4 days ago", type: "Lost", image: "https://images.moneycontrol.com/static-mcnews/2021/10/Apple-iPhone-13-4.jpg?impolicy=website&width=1280&height=720" },
    { name: "Spectacles", location: "Admin Block", date: "1 week ago", type: "Lost", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=400&auto=format&fit=crop" },
  ];

  return (
    <section className="w-full py-24 bg-white overflow-hidden">
      <div className="text-center mb-12 px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Recent Findings
        </h2>
        <p className="text-gray-500 text-lg">Scroll through the latest items reported by our community</p>
      </div>

      {/* Horizontal Scroller Container */}
      <div className="relative flex overflow-x-hidden group">
        {/* The Marquee Row */}
        <div className="flex animate-marquee whitespace-nowrap gap-8 py-4 group-hover:pause-marquee">
          {/* We map twice to create a seamless infinite loop */}
          {[...items, ...items].map((item, index) => (
            <div
              key={index}
              className="inline-block w-75 bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-md ${
                  item.type === "Lost" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                }`}>
                  {item.type}
                </div>
              </div>

              {/* Info */}
              <div className="p-5 whitespace-normal">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                <div className="flex items-center text-gray-500 text-sm gap-1 mb-1">
                   <span className="font-semibold text-blue-600">📍 {item.location}</span>
                </div>
                <p className="text-gray-400 text-xs italic">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tailwind Custom Styles for Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .pause-marquee:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
};

export default RecentItems;