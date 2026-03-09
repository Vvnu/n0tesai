"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
          active
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        {label}
      </Link>
    );
  };

  // Get initials as fallback
  const initials = user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm px-6 py-3">

      {/* Left — original logo */}
      <Link href="/dashboard">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-md border border-white/10">
          <div className="inline-flex items-center gap-2 px-1 py-1">
            <div className="w-8 h-8 bg-linear-to-br from-red-500 to-pink-200 rounded-lg flex items-center justify-center">
              <img width="30" height="30" src="https://img.icons8.com/doodle-line/60/737373/v.png" alt="v" />
            </div>
            <h1 className="text-2xl text-blue-400 font-bold pr-1">N0tes</h1>
          </div>
        </div>
      </Link>

      {/* Right — nav links + profile + logout */}
      <div className="flex items-center gap-2">
        {navLink('/dashboard', 'Dashboard')}
        {navLink('/notes', 'Notes')}

        <div className="h-5 w-px bg-gray-200 mx-1" />

        {/* Profile photo with initials fallback */}
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'User'}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {initials}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

    </nav>
  );
}