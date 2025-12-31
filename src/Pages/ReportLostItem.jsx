import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const ReportLostItem = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    contact: "",
    photo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Lost Item Reported:", formData);
    alert("Lost item reported successfully!");
    setFormData({ name: "", description: "", location: "", contact: "", photo: null });
  };

  return (
    <div className="overflow-x-hidden bg-gray-50 min-h-screen">
      <Navbar />

      <section className="max-w-3xl mx-auto py-24 px-6 bg-white rounded-2xl shadow-lg mt-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-blue-600">
          Report Lost Item
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
            className="p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Where you lost it?"
            value={formData.location}
            onChange={handleChange}
            className="p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            required
          />

          <input
            type="text"
            name="contact"
            placeholder="Your Contact (Phone or Email)"
            value={formData.contact}
            onChange={handleChange}
            className="p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            required
          />

          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
            {formData.photo ? (
              <span className="mb-2 text-gray-700">{formData.photo.name}</span>
            ) : (
              <span className="mb-2 text-gray-400">Click to upload photo</span>
            )}
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 hover:scale-105 transition-all font-semibold shadow-md"
          >
            Submit Report
          </button>
        </form>
      </section>

      <Footer />
    </div>
  );
};

export default ReportLostItem;
