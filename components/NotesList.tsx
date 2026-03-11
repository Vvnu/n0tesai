'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listenToNotes, createNote, deleteNote, NoteListItem } from '@/lib/notes';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, FileText, Clock } from 'lucide-react';

function timeAgo(timestamp: any): string {
  if (!timestamp?.toDate) return '';
  const date: Date = timestamp.toDate();
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotesList() {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToNotes(user.uid, (data) => {
      setNotes(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const doc = await createNote(user.uid);
      router.push(`/notes/${doc.id}`);
    } catch (err) {
      console.error('Failed to create note:', err);
      setCreating(false);
    }
  };

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const ok = confirm('Delete this note permanently?');
    if (!ok) return;
    setDeletingId(noteId);
    try {
      await deleteNote(user.uid, noteId);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Notes</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleCreate} disabled={creating}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-60">
          {creating
            ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Plus size={15} />}
          New
        </button>
      </div>

      {/* Empty state */}
      {notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FileText size={24} className="text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">No notes yet</h3>
          <p className="text-sm text-gray-400 mb-4">Create your first note to get started</p>
          <button onClick={handleCreate} className="text-sm text-gray-900 font-medium underline underline-offset-2">
            Create a note →
          </button>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-2">
        {notes.map(note => (
          <div
            key={note.id}
            onClick={() => router.push(`/notes/${note.id}`)}
            className={`group flex justify-between items-center p-3 sm:p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all duration-150 ${
              deletingId === note.id ? 'opacity-40 pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={14} className="text-gray-500" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                  {note.title?.trim() || 'Untitled'}
                </h3>
                {note.updatedAt && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Clock size={10} />
                    {timeAgo(note.updatedAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Delete — always visible on mobile, hover on desktop */}
            <button
              onClick={e => handleDelete(note.id, e)}
              className="ml-3 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}