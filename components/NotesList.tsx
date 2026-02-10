'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listenToNotes, createNote } from '@/lib/notes';
import { useAuth } from '@/context/AuthContext';

type Note = {
  id: string;
  title?: string;
  updatedAt?: any;
};

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToNotes(user.uid, (data: Note[]) => {
      setNotes(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    const doc = await createNote(user.uid);
    router.push(`/notes/${doc.id}`);
  };

  if (loading) {
    return <p className="text-gray-500">Loading notes…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Notes</h2>
        <button
          onClick={handleCreate}
          className="px-3 py-1 rounded bg-black text-white hover:bg-gray-800"
        >
          ➕ New
        </button>
      </div>

      {notes.length === 0 && (
        <p className="text-gray-500">No notes yet. Create your first one.</p>
      )}

      {notes.map(note => (
        <div
          key={note.id}
          className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition"
          onClick={() => router.push(`/notes/${note.id}`)}
        >
          <h3 className="font-medium">
            {note.title?.trim() || 'Untitled'}
          </h3>
        </div>
      ))}
    </div>
  );
}
