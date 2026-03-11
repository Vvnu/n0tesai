'use client';

import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Strikethrough, Highlighter,
  Heading1, Heading2, List, ListOrdered, Code, Quote, Pen,
} from 'lucide-react';

type ToolbarProps = {
  editor: Editor | null;
};

export default function EditorToolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-2 rounded-lg transition-all duration-100 flex items-center justify-center
     ${active
       ? 'bg-gray-900 text-white shadow-sm'
       : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
     }`;

  const Divider = () => <div className="h-5 w-px bg-gray-200 mx-1" />;

  return (
    <div className="sticky top-0 z-40 mb-4">
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm px-3 py-2 shadow-sm">

        {/* Text styles */}
        <div className="flex gap-0.5">
          <button title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}>
            <Bold size={15} />
          </button>
          <button title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}>
            <Italic size={15} />
          </button>
          <button title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike'))}>
            <Strikethrough size={15} />
          </button>
          <button title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} className={btn(editor.isActive('highlight'))}>
            <Highlighter size={15} />
          </button>
          <button title="Code" onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive('code'))}>
            <Code size={15} />
          </button>
        </div>

        <Divider />

        {/* Headings */}
        <div className="flex gap-0.5">
          <button title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive('heading', { level: 1 }))}>
            <Heading1 size={15} />
          </button>
          <button title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))}>
            <Heading2 size={15} />
          </button>
        </div>

        <Divider />

        {/* Lists */}
        <div className="flex gap-0.5">
          <button title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))}>
            <List size={15} />
          </button>
          <button title="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))}>
            <ListOrdered size={15} />
          </button>
          <button title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))}>
            <Quote size={15} />
          </button>
        </div>

        <Divider />

        {/* Drawing */}
        <button
          title="Insert drawing canvas"
          onClick={() => (editor.chain().focus() as any).insertDrawing().run()}
          className={`${btn(false)} gap-1.5 px-2.5 text-xs font-medium`}
        >
          <Pen size={14} />
          Draw
        </button>

      </div>
    </div>
  );
}