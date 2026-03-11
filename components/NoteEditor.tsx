'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { JSONContent } from '@tiptap/core'
import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { saveNote } from '@/lib/notes'
import { saveLocalNote, loadLocalNote } from '@/lib/localNotes'
import EditorToolbar from './EditorToolbar'
import { DrawingNode } from './DrawingNode'

type NoteEditorProps = {
  noteId: string
  initialContent: JSONContent | null
  onContentChange?: (content: JSONContent) => void
}

export default function NoteEditor({ noteId, initialContent, onContentChange }: NoteEditorProps) {
  const { user } = useAuth()
  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  const floatingToolbarRef = useRef<HTMLDivElement>(null)

  const updateFloatingToolbar = useCallback((editor: any) => {
    if (!editor || !floatingToolbarRef.current) return
    const { from, to } = editor.state.selection
    if (from !== to) {
      const coords = editor.view.coordsAtPos(from)
      const top = coords.top + window.scrollY - 48
      const left = Math.max(8, coords.left + window.scrollX)
      floatingToolbarRef.current.style.top = `${top}px`
      floatingToolbarRef.current.style.left = `${left}px`
      floatingToolbarRef.current.style.opacity = '1'
      floatingToolbarRef.current.style.pointerEvents = 'auto'
      floatingToolbarRef.current.style.transform = 'translateY(0px)'
    } else {
      floatingToolbarRef.current.style.opacity = '0'
      floatingToolbarRef.current.style.pointerEvents = 'none'
      floatingToolbarRef.current.style.transform = 'translateY(4px)'
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
      DrawingNode,
    ],
    content: '',
    immediatelyRender: false,

    onUpdate({ editor }) {
      if (!user) return
      const json = editor.getJSON()
      onContentChange?.(json)
      saveLocalNote(noteId, json)

      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        try {
          await saveNote(user.uid, noteId, { content: json })
        } catch {
          console.error('Auto-save failed')
        }
      }, 800)
    },

    onSelectionUpdate({ editor }) {
      updateFloatingToolbar(editor)
    },

    onBlur() {
      if (floatingToolbarRef.current) {
        floatingToolbarRef.current.style.opacity = '0'
        floatingToolbarRef.current.style.pointerEvents = 'none'
      }
    },
  })

  useEffect(() => {
    if (!editor) return
    const local = loadLocalNote(noteId)
    if (local) {
      editor.commands.setContent(local)
      return
    }
    if (initialContent) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, noteId, initialContent])

  useEffect(() => {
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [])

  if (!editor) return null

  const floatingBtn = (label: string, action: () => void, active: boolean) => (
    <button
      onMouseDown={e => { e.preventDefault(); action() }}
      className={`px-2 py-0.5 rounded text-sm font-medium transition-colors ${
        active ? 'bg-white text-black' : 'text-white/80 hover:text-white hover:bg-white/15'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="relative flex flex-col gap-0">
      {/* Sticky top toolbar */}
      <EditorToolbar editor={editor} />

      {/* Floating selection toolbar */}
      <div
        ref={floatingToolbarRef}
        className="fixed z-50 flex items-center gap-1 bg-gray-900 rounded-xl px-3 py-1.5 shadow-2xl border border-white/10 transition-all duration-150"
        style={{ opacity: 0, pointerEvents: 'none', top: 0, left: 0 }}
      >
        {floatingBtn('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {floatingBtn('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        {floatingBtn('S̶', () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'))}
        {floatingBtn('✦', () => editor.chain().focus().toggleHighlight().run(), editor.isActive('highlight'))}
        <div className="w-px h-4 bg-white/20 mx-1" />
        {floatingBtn('H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }))}
        {floatingBtn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
        <div className="w-px h-4 bg-white/20 mx-1" />
        {floatingBtn('•', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
        {floatingBtn('1.', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
      </div>

      {/* Editor content */}
      <div className="prose prose-neutral max-w-none w-full">
        <EditorContent
          editor={editor}
          className="
            w-full min-h-[70vh] bg-white text-gray-900 px-6 py-4 rounded-xl
            border border-gray-200 shadow-sm focus-within:border-gray-400
            focus-within:shadow-md transition-all
            [&_.ProseMirror]:min-h-[70vh] [&_.ProseMirror]:w-full [&_.ProseMirror]:outline-none
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
            [&_.ProseMirror::selection]:bg-yellow-200
            [&_.ProseMirror::selection]:text-gray-900
          "
        />
      </div>
    </div>
  )
}