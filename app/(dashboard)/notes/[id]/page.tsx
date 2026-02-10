'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NoteEditor from '@/components/NoteEditor';
import { loadNote, saveNote } from '@/lib/notes';
import { useAuth } from '@/context/AuthContext';

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const noteId = params.id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ----------------------------
     Load note
  -----------------------------*/
  useEffect(() => {
    if (!user || !noteId) return;

    loadNote(user.uid, noteId).then(note => {
      if (note) {
        setTitle(note.title || '');
        setContent(note.content || null);
      }
      setLoading(false);
    });
  }, [user, noteId]);

  /* ----------------------------
     Auto-save (debounced)
  -----------------------------*/
  useEffect(() => {
    if (!user || !noteId || loading) return;

    const timeout = setTimeout(() => {
      saveNote(user.uid, noteId, {
        title,
        content,
      });
    }, 600);

    return () => clearTimeout(timeout);
  }, [title, content]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading note…</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <button
          onClick={() => router.push('/notes')}
          className="text-sm text-gray-600 hover:text-black"
        >
          ← Back
        </button>

        <div className="text-sm text-gray-500">
          Editing note
        </div>

        <div className="text-xs text-green-600">
          Auto-saving
        </div>
      </header>

      {/* Editor Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full text-3xl font-bold outline-none mb-6"
        />

              <NoteEditor noteId={noteId} />
      </main>
    </div>
  );
}
