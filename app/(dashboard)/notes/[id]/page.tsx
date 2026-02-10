'use client';

import { useParams, useRouter } from 'next/navigation';
import NoteEditor from '@/components/NoteEditor';

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();

  const noteId = params.id as string;

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
          Editing note: <span className="font-medium">{noteId}</span>
        </div>

        <div className="text-xs text-green-600">
          Auto-saving
        </div>
      </header>

      {/* Editor Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <input
          type="text"
          placeholder="Untitled"
          className="w-full text-3xl font-bold outline-none mb-6"
        />

        {/* Editor owns persistence */}
        <NoteEditor noteId={noteId} />
      </main>
    </div>
  );
}
