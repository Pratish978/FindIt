const RecentItems = () => {
  const items = [
    {
      name: "Black Wallet",
      location: "Library",
      date: "2 days ago",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlEVV8kAoLZflAqitpWryfK_hwfOj6lukBxA&s",
    },
    {
      name: "Earpods",
      location: "Cafeteria",
      date: "1 day ago",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBKz9VABvbHchWUNVpHAhK5nsBB4NuGCK3sw&s",
    },
    {
      name: "Silver Laptop",
      location: "Computer Lab",
      date: "5 days ago",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <section className="w-full py-4 bg-white px-6">
      <h2 className="text-4xl font-bold text-center mb-14">
        Recent Lost & Found Items
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-gray-100 rounded-2xl shadow-md p-6 hover:scale-105 transition duration-300 flex flex-col items-center"
          >
            {/* Image with object-contain */}
            <img
              src={item.image}
              alt={item.name}
              className="h-48 w-full object-contain rounded-xl mb-4"
            />

            <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
            <p className="text-gray-600">Location: {item.location}</p>
            <p className="text-gray-500 text-sm mt-2">{item.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentItems;
