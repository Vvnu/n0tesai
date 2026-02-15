'use client';

import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Highlighter,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from 'lucide-react';

type ToolbarProps = {
  editor: Editor | null;
};

export default function EditorToolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-2 rounded-md border transition flex items-center justify-center
     ${active
       ? 'bg-black text-white border-black shadow-sm'
       : 'bg-white text-black border-gray-300 hover:bg-gray-100'
     }`;

  return (
    <div className="sticky top-0 z-40 mb-6">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-gray-50 px-4 py-3 shadow-sm">
        
        {/* text styles */}
        <div className="flex gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btn(editor.isActive('bold'))}
          >
            <Bold size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btn(editor.isActive('italic'))}
          >
            <Italic size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={btn(editor.isActive('highlight'))}
          >
            <Highlighter size={16} />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1" />

        {/* headings */}
        <div className="flex gap-1">
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={btn(editor.isActive('heading', { level: 1 }))}
          >
            <Heading1 size={16} />
          </button>

          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={btn(editor.isActive('heading', { level: 2 }))}
          >
            <Heading2 size={16} />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1" />

        {/* lists */}
        <div className="flex gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btn(editor.isActive('bulletList'))}
          >
            <List size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={btn(editor.isActive('orderedList'))}
          >
            <ListOrdered size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
