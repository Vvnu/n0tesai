'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JSONContent } from '@tiptap/core';
import NoteEditor from '@/components/NoteEditor';
import { loadNote, saveNote } from '@/lib/notes';
import { useAuth } from '@/context/AuthContext';
import AiPanel from '@/components/AiPanel';
import { Sparkles, X } from 'lucide-react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const noteId = params.id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showAi, setShowAi] = useState(false);
  const titleTimer = useRef<NodeJS.Timeout | null>(null);

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

  const saveTitle = useCallback(async (newTitle: string) => {
    if (!user || !noteId) return;
    setSaveStatus('saving');
    try {
      await saveNote(user.uid, noteId, { title: newTitle });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  }, [user, noteId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => saveTitle(val), 600);
  };

  const handleContentChange = useCallback((json: JSONContent) => {
    setContent(json);
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 900);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex gap-2 items-center text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          Loading note…
        </div>
      </div>
    );
  }

  const statusLabel: Record<SaveStatus, string> = {
    idle: '', saving: 'Saving…', saved: '✓ Saved', error: '⚠ Save failed',
  };
  const statusColor: Record<SaveStatus, string> = {
    idle: 'opacity-0', saving: 'text-gray-400 opacity-100',
    saved: 'text-green-600 opacity-100', error: 'text-red-500 opacity-100',
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-3 border-b bg-white shadow-sm shrink-0">
        <button onClick={() => router.push('/notes')}
          className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1">
          ← Back
        </button>

        <div className={`text-xs font-medium transition-all duration-500 ${statusColor[saveStatus]}`}>
          {statusLabel[saveStatus]}
        </div>

        <button
          onClick={() => setShowAi(v => !v)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${
            showAi ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sparkles size={14} />
          <span className="hidden sm:inline">AI</span>
          <span className="sm:hidden">AI</span>
        </button>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Editor */}
        <main className={`flex-1 overflow-y-auto px-3 sm:px-6 py-6 sm:py-8 transition-all duration-300 ${showAi ? 'sm:mr-0' : ''}`}>
          <div className="max-w-3xl mx-auto">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled"
              className="w-full text-2xl sm:text-3xl font-bold outline-none mb-4 sm:mb-6 bg-transparent text-gray-900 placeholder-gray-300"
            />
            <NoteEditor
              noteId={noteId}
              initialContent={content}
              onContentChange={handleContentChange}
            />
          </div>
        </main>

        {/* AI Panel — full screen on mobile, sidebar on desktop */}
        {showAi && (
          <div className="
            fixed inset-0 z-40 bg-white
            sm:relative sm:inset-auto sm:w-80 sm:border-l sm:bg-white sm:z-auto
            flex flex-col
          ">
            {/* Mobile close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b sm:hidden">
              <span className="font-semibold text-gray-700 text-sm">AI Assistant</span>
              <button onClick={() => setShowAi(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AiPanel noteContent={content} noteTitle={title} noteId={noteId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}