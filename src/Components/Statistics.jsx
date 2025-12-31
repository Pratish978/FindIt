const Statistics = () => {
  return (
    <section className="w-full py-8 bg-white px-6">
      <h2 className="text-5xl font-bold text-center mb-16">
        Our <span className="text-blue-600">Impact</span>
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {[
          { value: "1200+", label: "Items Recovered" },
          { value: "300+", label: "Active Students" },
          { value: "50+", label: "Colleges Supported" },
          { value: "95%", label: "Success Rate" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-gray-50 rounded-3xl p-10 text-center
            shadow-md hover:shadow-2xl
            hover:-translate-y-2 transition-all duration-500"
          >
            <h3 className="text-6xl font-extrabold text-gray-900 mb-4">
              {stat.value}
            </h3>
            <p className="text-xl text-gray-600 font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Statistics;
