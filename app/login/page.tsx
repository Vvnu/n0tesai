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
    <div className="flex h-screen items-center justify-center">
      <button
      
        onClick={handleLogin}
        
        className="rounded bg-amber-400 px-6 py-3 text-white "
      
      
      >
                <img width="44" height="44" src="https://img.icons8.com/3d-fluency/94/google-logo.png" alt="google-logo"/>

        Continue with Google
      </button>
    </div>
  );
}
