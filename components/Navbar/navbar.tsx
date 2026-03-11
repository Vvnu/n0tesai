"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const navLinkClass = (href: string) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
      isActive(href)
        ? 'bg-gray-100 text-gray-900'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">

        {/* Logo */}
        <Link href="/dashboard">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-md border border-white/10">
            <div className="inline-flex items-center gap-2 px-1 py-1">
              <div className="w-8 h-8 bg-linear-to-br from-red-500 to-pink-200 rounded-lg flex items-center justify-center">
                <img width="30" height="30" src="https://img.icons8.com/doodle-line/60/737373/v.png" alt="v" />
              </div>
              <h1 className="text-2xl font-bold pr-1">N0tes</h1>
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
          <Link href="/notes" className={navLinkClass('/notes')}>Notes</Link>

          <div className="h-5 w-px bg-gray-200 mx-1" />

          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName ?? 'User'}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
          )}

          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all">
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* Mobile: avatar + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName ?? 'User'}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-gray-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          )}
          <button onClick={() => setMenuOpen(v => !v)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}
            className={`${navLinkClass('/dashboard')} block py-2.5`}>
            Dashboard
          </Link>
          <Link href="/notes" onClick={() => setMenuOpen(false)}
            className={`${navLinkClass('/notes')} block py-2.5`}>
            Notes
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-all mt-1">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}