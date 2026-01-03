import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const SignUp = () => {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // 1. Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // 2. Add the name to their profile
      await updateProfile(userCredential.user, { displayName: formData.fullName });
      
      alert("Account created successfully!");
      navigate("/");
    } catch (err) { alert(err.message); }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <section className="max-w-md mx-auto py-24 px-6 bg-gray-50 rounded-xl shadow-md mt-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Sign Up</h2>
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} className="p-4 rounded-lg border" required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} className="p-4 rounded-lg border" required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} className="p-4 rounded-lg border" required />
          <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">Sign Up</button>
        </form>
        <div className="my-4 text-center text-gray-500">or</div>
        <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:shadow-md transition">
          <img src="https://cdn-teams-slug.flaticon.com/google.jpg" alt="Google" className="w-6 h-6" />
          Continue with Google
        </button>
      </section>
      <Footer />
    </div>
  );
};

export default SignUp;