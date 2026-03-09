"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createNote } from "@/lib/notes";
import { BackgroundLines } from "@/components/ui/background-lines";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleCreateNote = async () => {
    if (!user) return;
    const docRef = await createNote(user.uid);
    router.push(`/notes/${docRef.id}`);
  };

  return (
    <BackgroundLines className="min-h-screen">
      <div className="p-8">
        <h1 className="text-3xl font-bold">
          Welcome{user?.displayName ? `, ${user.displayName}` : ""} 👋
        </h1>

        <p className="mt-2 text-gray-600">
          Your personal notes workspace.
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleCreateNote}
            className="rounded bg-black px-6 py-3 text-white"
          >
            Create New Note
          </button>

          <Link href="/notes" className="rounded border border-black px-6 py-3">
            View All Notes
          </Link>
        </div>
      </div>
    </BackgroundLines>
  );
}

 