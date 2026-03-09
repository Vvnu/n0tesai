"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createNote } from "@/lib/notes";
import { useState } from "react";
import { PlusCircle, BookOpen, Sparkles, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreateNote = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const docRef = await createNote(user.uid);
      router.push(`/notes/${docRef.id}`);
    } catch (err) {
      console.error("Failed to create note:", err);
      setCreating(false);
    }
  };

  const firstName = user?.displayName?.split(' ')[0] ?? '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="mb-12">
          {/* <p className="text-sm text-gray-400 font-medium mb-1 uppercase tracking-widest">Dashboard</p> */}
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {firstName ? `Hello, ${firstName} 👋` : 'Welcome back 👋'}
          </h1>
          <p className="text-gray-500 text-lg">
            What would you like to work on today?
          </p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">

          {/* Create note */}
          <button
            onClick={handleCreateNote}
            disabled={creating}
            className="group flex flex-col items-start gap-4 p-6 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 text-left"
          >
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
              {creating
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <PlusCircle size={20} />
              }
            </div>
            <div>
              <div className="font-semibold mb-0.5">New Note</div>
              <div className="text-white/50 text-sm">Start writing something fresh</div>
            </div>
            <ArrowRight size={16} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all mt-auto" />
          </button>

          {/* View notes */}
          <Link
            href="/notes"
            className="group flex flex-col items-start gap-4 p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md active:scale-[0.98] transition-all duration-150 text-left"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <BookOpen size={20} className="text-gray-700" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-0.5">All Notes</div>
              <div className="text-gray-400 text-sm">Browse your notes library</div>
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all mt-auto" />
          </Link>

          {/* AI hint */}
          <div className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-violet-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-0.5">AI Features</div>
              <div className="text-gray-500 text-sm">Summarize, continue, chat with any note</div>
            </div>
            <div className="mt-auto text-xs text-violet-400 font-medium">
              Open any note → tap AI ✦
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}