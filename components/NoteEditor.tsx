'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type NoteEditorProps = {
  noteId: string
}

export default function NoteEditor({ noteId }: NoteEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })

  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content: '',
    immediatelyRender: false,

    onUpdate({ editor }) {
      const json = editor.getJSON()
      localStorage.setItem(`note:${noteId}`, JSON.stringify(json))
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

  /* 🔁 Load note on mount */
  useEffect(() => {
    if (!editor) return
    const user = auth.currentUser
    if (!user) return

    const local = localStorage.getItem(`note:${noteId}`)

    if (local) {
      editor.commands.setContent(JSON.parse(local))
    } else {
      const ref = doc(db, 'users', user.uid, 'notes', noteId)
      getDoc(ref).then(snap => {
        if (snap.exists()) {
          const data = snap.data().content
          editor.commands.setContent(data)
          localStorage.setItem(`note:${noteId}`, JSON.stringify(data))
        }
      })
    }
  }, [editor, noteId])

  /* ☁️ Cloud sync (every 3s) */
  useEffect(() => {
    if (!editor) return
    const user = auth.currentUser
    if (!user) return

    const interval = setInterval(() => {
      const json = editor.getJSON()
      const ref = doc(db, 'users', user.uid, 'notes', noteId)

      setDoc(
        ref,
        { content: json, updatedAt: serverTimestamp() },
        { merge: true }
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [editor, noteId])

  if (!editor) return null

  return (
    <div className="relative">
      {showToolbar && (
        <div
          className="fixed z-50 flex gap-1 bg-black text-white rounded-xl px-3 py-2 shadow-lg"
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

      <div className="prose max-w-none">
        <EditorContent
          editor={editor}
          className="[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-4 bg-yellow-100 text-black"
        />
      </div>
    </div>
  )
}
