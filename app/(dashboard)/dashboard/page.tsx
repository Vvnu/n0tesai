"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createNote } from "@/lib/notes";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleCreateNote = async () => {
    if (!user) return;

    const docRef = await createNote(user.uid);
    router.push(`/notes/${docRef.id}`);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Welcome{user?.displayName ? `, ${user.displayName}` : ""} 👋
      </h1>

      <p className="mt-2 text-gray-600">
        Your personal notes workspace.
      </p>

      <div className="mt-8 flex gap-4">
        {/* ✅ REAL create */}
        <button
          onClick={handleCreateNote}
          className="rounded bg-black px-6 py-3 text-white"
        >
          Create New Note
        </button>

        {/* ✅ Just navigation */}
        <Link
          href="/notes"
          className="rounded border border-black px-6 py-3"
        >
          View All Notes
        </Link>
      </div>

      <div className="mt-12 rounded border p-6">
        <h2 className="text-xl font-semibold">Station</h2>
        <p className="mt-2 text-gray-500">
          DEMO DEMO DEMO DEMO DEMO DEMO
        </p>
      </div>
    </div>
  );
}
