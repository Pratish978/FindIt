const WhyFindIt = () => {
  return (
    <section className="w-full py-8 bg-gradient-to-blue from-gray-50 to-white px-6">
      <h2 className="text-5xl font-bold text-center mb-16">
        Why Choose <span className="text-blue-600">Find It</span>?
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {[
          {
            title: "Verified Reports",
            desc: "All items are verified to ensure authenticity.",
            icon: "🛡️",
          },
          {
            title: "Easy Reporting",
            desc: "Submit lost or found items in just a few clicks.",
            icon: "⚡",
          },
          {
            title: "Campus Focused",
            desc: "Designed specially for college campuses.",
            icon: "🏫",
          },
          {
            title: "Fast Recovery",
            desc: "Reconnect with your belongings quickly.",
            icon: "🚀",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="backdrop-blur-lg bg-white/70 rounded-3xl p-8
            shadow-lg hover:shadow-2xl
            hover:-translate-y-3 transition-all duration-500"
          >
            <div className="w-16 h-16 flex items-center justify-center
            rounded-2xl bg-blue-600 text-white text-3xl mb-6">
              {item.icon}
            </div>
            <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyFindIt;
