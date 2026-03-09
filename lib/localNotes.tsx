import { JSONContent } from '@tiptap/core'

export function saveLocalNote(noteId: string, content: JSONContent) {
  try {
    localStorage.setItem(`note:${noteId}`, JSON.stringify(content))
  } catch (err) {
    console.error('[saveLocalNote] Failed:', err)
  }
}

export function loadLocalNote(noteId: string): JSONContent | null {
  try {
    const data = localStorage.getItem(`note:${noteId}`)
    return data ? (JSON.parse(data) as JSONContent) : null
  } catch (err) {
    console.error('[loadLocalNote] Failed:', err)
    return null
  }
}

export function removeLocalNote(noteId: string) {
  try {
    localStorage.removeItem(`note:${noteId}`)
  } catch (err) {
    console.error('[removeLocalNote] Failed:', err)
  }
}