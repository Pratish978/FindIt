import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  Loader2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Inbox
} from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= EMAIL SIGNUP ================= */
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create the user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // 2. Update their profile with Full Name
      await updateProfile(userCredential.user, {
        displayName: formData.fullName,
      });

      // 3. Define Action Code Settings (Crucial for Localhost testing)
      const actionCodeSettings = {
        // This URL must be added to your 'Authorized Domains' in Firebase Console
        url: window.location.origin + "/login", 
        handleCodeInApp: true,
      };

      // 4. Send Verification Email with settings
      await sendEmailVerification(userCredential.user, actionCodeSettings);

      console.log("Verification email sent successfully");
      setIsVerificationSent(true); 
      
    } catch (error) {
      console.error("Signup Error:", error.code);
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already registered. Try logging in!");
      } else if (error.code === 'auth/invalid-email') {
        alert("Please provide a valid email address.");
      } else if (error.code === 'auth/too-many-requests') {
        alert("Too many attempts. Please wait a few minutes.");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE SIGNUP ================= */
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        navigate("/"); 
      }
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <section className="max-w-md mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 transition-all duration-500">
          
          {!isVerificationSent ? (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex p-3 bg-blue-50 rounded-2xl text-blue-600 mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Join the Hub</h2>
                <p className="text-slate-500 font-medium mt-2">Start reporting and finding items</p>
              </div>

              <form onSubmit={handleSignUp} className="flex flex-col gap-5">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900"
                  />
                </div>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-600 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>Create Account <ArrowRight size={20} /></>
                  )}
                </button>
              </form>

              <div className="relative my-10 text-center">
                <hr className="border-slate-100" />
                <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-white px-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">OR</span>
              </div>

              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 rounded-2xl py-4 font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-100 transition-all mb-8 disabled:opacity-50"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                {loading ? "Connecting..." : "Continue with Google"}
              </button>
            </>
          ) : (
            /* SUCCESS STATE: Verification Sent */
            <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
              <div className="inline-flex p-5 bg-green-50 rounded-full text-green-600 mb-6">
                <Inbox size={48} className="animate-bounce" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Verify Email</h2>
              <p className="text-slate-500 font-medium mb-8">
                A verification link has been sent to:<br />
                <span className="text-slate-900 font-bold">{formData.email}</span>. <br /><br />
                Please click the link in your email to activate your account.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-700 transition-all"
              >
                Go to Login
              </button>
            </div>
          )}

          {!isVerificationSent && (
            <p className="text-center text-slate-500 font-medium">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-blue-600 font-black hover:underline underline-offset-4">
                Log In
              </button>
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;