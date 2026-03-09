"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 relative overflow-hidden">

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">

          {/* Original logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-200 rounded-lg flex items-center justify-center">
                <img width="60" height="60" src="https://img.icons8.com/doodle-line/60/737373/v.png" alt="v"/>
              </div>
              <h1 className="text-4xl font-bold text-white">N0tes</h1>
            </div>
            <p className="text-white/70 text-sm">Your intelligent note-taking companion</p>
          </div>

          {/* Welcome */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Welcome</h2>
            <p className="text-white/60 text-sm">Sign in to continue to your notes</p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleLogin}
            className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 group"
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

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
          </div>

          <p className="text-center text-white/50 text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Feature hints */}
        <div className="flex justify-center gap-6 mt-6">
          {['Rich text editor', 'AI-powered', 'Auto-sync'].map(f => (
            <div key={f} className="flex items-center gap-1.5 text-white/30 text-xs">
              <div className="w-1 h-1 rounded-full bg-purple-400/60" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          animation: blobMove 12s infinite ease-in-out;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #7c3aed, #4f46e5);
          top: -150px; left: -100px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #db2777, #9333ea);
          bottom: -100px; right: -80px;
          animation-delay: -4s;
        }
        .blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #2563eb, #7c3aed);
          top: 40%; left: 50%;
          animation-delay: -8s;
          animation-name: blobMove3;
        }
        @keyframes blobMove {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.08); }
          50% { transform: translate(-20px, 30px) scale(0.94); }
          75% { transform: translate(40px, 20px) scale(1.04); }
        }
        @keyframes blobMove3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33% { transform: translate(calc(-50% + 40px), calc(-50% - 30px)) scale(1.1); }
          66% { transform: translate(calc(-50% - 30px), calc(-50% + 40px)) scale(0.9); }
        }
      `}</style>
    </div>
  );
}