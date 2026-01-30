"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center  relative overflow-hidden">
 
      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-200 rounded-lg flex items-center justify-center">
                <img width="60" height="60" src="https://img.icons8.com/doodle-line/60/737373/v.png" alt="v"/>
              </div>
              <h1 className="text-4xl font-bold text-white">N0tes</h1>
            </div>
            <p className="text-white/70 text-sm">Your intelligent note-taking companion</p>
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Welcome </h2>
            <p className="text-white/60 text-sm">Sign in to continue to your notes</p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            <img 
              width="24" 
              height="24" 
              src="https://img.icons8.com/3d-fluency/94/google-logo.png" 
              alt="google-logo"
              className="group-hover:scale-110 transition-transform"
            />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
          </div>

          {/* Additional info */}
          <div className="text-center">
            <p className="text-white/50 text-xs">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

       
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}