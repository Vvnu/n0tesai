'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listenToNotes, createNote, deleteNote } from '@/lib/notes';
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

  const handleDelete = async (noteId: string) => {
    if (!user) return;

    const ok = confirm('Delete this note permanently?');
    if (!ok) return;

    await deleteNote(user.uid, noteId);
  };

  if (loading) {
    return <p className="text-gray-500">Loading notes…</p>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Notes</h2>
        <button
          onClick={handleCreate}
          className="px-3 py-1 rounded bg-black text-white hover:bg-gray-800"
        >
          ➕ New
        </button>
      </div>

      {/* Empty State */}
      {notes.length === 0 && (
        <p className="text-gray-500">No notes yet. Create your first one.</p>
      )}

      {/* Notes List */}
      {notes.map(note => (
        <div
          key={note.id}
          className="flex justify-between items-center p-4 border rounded-lg bg-gray-500 hover:bg-gray-50  text-black transition"
        >
          {/* Open Note */}
          <div
            className="cursor-pointer flex-1"
            onClick={() => router.push(`/notes/${note.id}`)}
          >
            <h3 className="font-medium">
              {note.title?.trim() || 'Untitled'}
            </h3>
          </div>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // 🚫 prevent opening note
              handleDelete(note.id);
            }}
            className="ml-3 text-red-500 hover:text-red-700"
          >
            🗑
          </button>
        </div>
      ))}
    </div>
  );
}
