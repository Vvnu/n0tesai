"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between border-b px-8 py-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-md border border-white/10 ">
            <a href="/dashboard" className="inline-block">
              <div className="inline-flex items-center gap-2 mb-0">
              <div className="w-8 h-8 bg-linear-to-br from-red-500 to-pink-200 rounded-lg flex items-center justify-center">
                <img width="30" height="30" src="https://img.icons8.com/doodle-line/60/737373/v.png" alt="v"/>
              </div>
              <h1 className="text-2xl font-bold  from-red-400 to-gray-400">N0tes</h1>
            </div>  
            </a>
          </div>

      <div className="flex items-center gap-6">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/notes">Notes</Link>

        <button
          onClick={handleLogout}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
