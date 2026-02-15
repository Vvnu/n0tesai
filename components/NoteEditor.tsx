'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { loadNote, saveNote } from '@/lib/notes'

type NoteEditorProps = {
  noteId: string
}

export default function NoteEditor({ noteId }: NoteEditorProps) {
  const { user } = useAuth()
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })

  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content: '',
    immediatelyRender: false,

    onUpdate({ editor }) {
      if (!user) return

      const json = editor.getJSON()

      // ✅ Local cache (instant UX)
      localStorage.setItem(`note:${noteId}`, JSON.stringify(json))

      // ✅ Debounced cloud save
      if (saveTimer.current) clearTimeout(saveTimer.current)

      saveTimer.current = setTimeout(() => {
        saveNote(user.uid, noteId, { content: json })
      }, 800)
    },

    onSelectionUpdate({ editor }) {
      const { from, to } = editor.state.selection
      if (from !== to) {
        const start = editor.view.coordsAtPos(from)
        setToolbarPosition({ top: start.top - 50, left: start.left })
        setShowToolbar(true)
      } else {
        setShowToolbar(false)
      }
    },
  })

  /* ================================
     Load note on mount
  ================================ */
  useEffect(() => {
    if (!editor || !user) return

    const local = localStorage.getItem(`note:${noteId}`)

    if (local) {
      editor.commands.setContent(JSON.parse(local))
      return
    }

    loadNote(user.uid, noteId).then(note => {
      if (!note?.content) return
      editor.commands.setContent(note.content)
      localStorage.setItem(`note:${noteId}`, JSON.stringify(note.content))
    })
  }, [editor, noteId, user])

  if (!editor) return null

  return (
    <div className="relative">
      {showToolbar && (
        <div
          className="fixed z-50 flex gap-3 bg-black text-white rounded-xl px-3 py-2 shadow-lg"
          style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
        >
          <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>
          <button onClick={() => editor.chain().focus().toggleHighlight().run()}>✦</button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()}>•</button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</button>
        </div>
      )}

<div className="prose max-w-none w-full">
        <EditorContent
  editor={editor}
  className="
    w-full
    min-h-[70vh]
    bg-gray-500
    text-black
    px-6
    py-4
    rounded-lg
    focus:outline-none
    [&_.ProseMirror]:min-h-[70vh]
    [&_.ProseMirror]:w-full
   [&_.ProseMirror::selection]:bg-yellow-300
[&_.ProseMirror::selection]:text-black


  "
/>

      </div>
    </div>
  )
}
