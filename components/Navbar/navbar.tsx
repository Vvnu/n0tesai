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
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 border border-white/10">
            {/* <p className="text-white/60 text-sm mb-4">Multi-color Letters</p> */}
            <a href="/dashboard" className="inline-block">
              <span className="text-2xl font-bold">
                <span className="text-purple-400">V</span>
                <span className="text-pink-400">N</span>
                <span className="text-yellow-400">0</span>
                <span className="text-blue-400">t</span>
                <span className="text-green-400">e</span>
                <span className="text-red-400">s</span>
              </span>
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
