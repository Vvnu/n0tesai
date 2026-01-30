'use client';

import { Editor } from '@tiptap/react';

type ToolbarProps = {
  editor: Editor | null;
};

export default function EditorToolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const buttonClass = (active: boolean) =>
    `px-3 py-1 rounded text-sm border ${
      active ? 'bg-black text-white' : 'bg-gray-100 text-black'
    }`;

  return (
    <div className="flex gap-2 border-b pb-3 mb-4">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
      >
        Bold
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
      >
        Italic
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={buttonClass(editor.isActive('highlight'))}
      >
        Highlight
      </button>

      <button
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={buttonClass(editor.isActive('heading', { level: 1 }))}
      >
        H1
      </button>

      <button
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
      >
        H2
      </button>
    </div>
  );
}
