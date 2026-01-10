import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  sendEmailVerification 
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Mail, Lock, LogIn, Loader2, AlertCircle, Send } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const navigate = useNavigate();

  /* ================= RESEND VERIFICATION ================= */
  const handleResend = async () => {
    setResending(true);
    try {
      // Logic for resending requires the user to be signed in (even if unverified)
      if (auth.currentUser) {
        const actionCodeSettings = {
          // Redirects back to login after verification
          url: window.location.origin + "/login", 
          handleCodeInApp: true,
        };

        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        alert("✅ A new verification link has been sent to your email!");
      } else {
        setError("Please re-enter your password to request a new link.");
      }
    } catch (err) {
      console.error("Resend Error:", err);
      setError("Could not resend email. Please wait a moment and try again.");
    } finally {
      setResending(false);
    }
  };

  /* ================= EMAIL LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUnverified(false);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setUnverified(true);
        setError("Your email is not verified yet.");
        setLoading(false);
        return; 
      }
      
      console.log("Login Success:", user);
      navigate("/"); 
    } catch (error) {
      console.error("Login Error:", error.code);
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Try again later.");
      } else {
        setError("Login failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        navigate("/");
      }
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message);
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
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium mt-2">Log in to manage your reports</p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-2 text-red-600 text-sm font-bold">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} />
                {error}
              </div>
              
              {unverified && (
                <button 
                  onClick={handleResend}
                  disabled={resending}
                  className="mt-2 flex items-center gap-2 text-xs bg-white border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors w-fit text-red-600"
                >
                  {resending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  {resending ? "Sending..." : "Resend Verification Link"}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Authenticating...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="relative my-10 text-center">
            <hr className="border-slate-100" />
            <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-white px-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">OR</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 rounded-2xl py-4 font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all mb-8 disabled:opacity-50"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            {loading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="text-center">
            <p className="text-slate-500 font-medium">
              New to the platform?{" "}
              <button 
                onClick={() => navigate("/signup")} 
                className="text-blue-600 font-black hover:underline underline-offset-4"
              >
                Create Account
              </button>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Login;