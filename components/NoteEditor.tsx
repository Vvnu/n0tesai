'use client';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { useEffect, useState } from 'react';

type NoteEditorProps = {
  content?: any;
  onChange?: (content: any) => void;
};

export default function NoteEditor({ content, onChange }: NoteEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
    ],
    content: content || '',
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
      console.log('Editor JSON:', editor.getJSON());
    },
    onSelectionUpdate({ editor }) {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;
      
      if (hasSelection) {
        const { view } = editor;
        const start = view.coordsAtPos(from);
        setToolbarPosition({
          top: start.top - 50,
          left: start.left,
        });
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    },
  });

  if (!editor) return null;

  return (
    <div className="relative">
      {/* Floating Toolbar */}
      {showToolbar && (
        <div 
          className="fixed z-50 flex gap-1 bg-black text-white rounded-xl px-3 py-2 shadow-lg"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
          }}
        >
          <button 
            className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-white text-black' : 'hover:bg-gray-700'}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </button>
          <button 
            className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-white text-black' : 'hover:bg-gray-700'}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            I
          </button>
          <button 
            className={`px-2 py-1 rounded ${editor.isActive('strike') ? 'bg-white text-black' : 'hover:bg-gray-700'}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            S
          </button>
          <button 
            className={`px-2 py-1 rounded ${editor.isActive('highlight') ? 'bg-white text-black' : 'hover:bg-gray-700'}`}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            ✦
          </button>
          <button 
            className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-white text-black' : 'hover:bg-gray-700'}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </button>
          <button 
            className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-white text-black' : 'hover:bg-gray-700'}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </button>
          <button
            className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-white text-black' : 'hover:bg-gray-700'}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            •
          </button>
          <button 
            className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-white text-black' : 'hover:bg-gray-700'}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1.
          </button>
        </div>
      )}

      {/* Editor */}
      <div className="prose max-w-none">
        <EditorContent 
          editor={editor} 
          className="[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-4"
        />
      </div>
    </div>
  );
}