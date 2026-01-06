import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup 
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Mail, Lock, LogIn, ShieldCheck, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ================= EMAIL LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        alert("Please verify your email before logging in. Check your inbox for the link!");
        setLoading(false);
        return;
      }

      navigate("/"); 
    } catch (error) {
      alert("Login Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN (FIXED) ================= */
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Switched to Popup to prevent the infinite reload/redirect loop
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        console.log("Login Success:", result.user);
        navigate("/");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      if (error.code === 'auth/popup-blocked') {
        alert("Popup blocked! Please allow popups for this site to sign in with Google.");
      } else {
        alert("Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <section className="max-w-md mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100">
          
          <div className="text-center mb-10">
            <div className="inline-flex p-3 bg-blue-50 rounded-2xl text-blue-600 mb-4">
              <LogIn size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 font-medium mt-2">Log in to manage your reports</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Checking...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <hr className="border-slate-100" />
            <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-white px-4 text-slate-400 text-sm font-bold uppercase tracking-widest">OR</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 rounded-2xl py-4 font-bold text-slate-600 hover:bg-slate-50 transition-all mb-8 disabled:opacity-50"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            {loading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="text-center space-y-3">
            <p className="text-slate-500 font-medium">
              Don't have an account?{" "}
              <button 
                onClick={() => navigate("/signup")} 
                className="text-blue-600 font-bold hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex gap-3 items-start border border-blue-100">
            <ShieldCheck className="text-blue-500 shrink-0" size={20} />
            <p className="text-[12px] text-blue-700 leading-tight font-medium">
              <strong>Tip:</strong> If you used Google to sign up, use the <b>Continue with Google</b> button to log in instantly.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Login;