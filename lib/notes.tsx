import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
} from 'firebase/firestore'
import { JSONContent } from '@tiptap/core'
import { db } from './firebase'

/* ================================
   Types
================================ */

export type Note = {
  title: string
  content: JSONContent | null
  createdAt?: any
  updatedAt?: any
}

export type NoteListItem = {
  id: string
  title?: string
  updatedAt?: any
}

/* ================================
   Create Note
================================ */

export async function createNote(userId: string) {
  try {
    const ref = collection(db, 'users', userId, 'notes')
    const docRef = await addDoc(ref, {
      title: 'Untitled',
      content: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef
  } catch (err) {
    console.error('[createNote] Failed:', err)
    throw err
  }
}

/* ================================
   Save Note (Auto-Save)
================================ */

export async function saveNote(
  userId: string,
  noteId: string,
  data: Partial<Note>
) {
  try {
    const ref = doc(db, 'users', userId, 'notes', noteId)
    await setDoc(
      ref,
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    )
  } catch (err) {
    console.error('[saveNote] Failed:', err)
    throw err
  }
}

/* ================================
   Load Single Note
================================ */

export async function loadNote(
  userId: string,
  noteId: string
): Promise<Note | null> {
  try {
    const ref = doc(db, 'users', userId, 'notes', noteId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data() as Note
  } catch (err) {
    console.error('[loadNote] Failed:', err)
    return null
  }
}

/* ================================
   Real-time Notes List
================================ */

export function listenToNotes(
  userId: string,
  callback: (notes: NoteListItem[]) => void
) {
  const q = query(
    collection(db, 'users', userId, 'notes'),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(
    q,
    snapshot => {
      callback(
        snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        })) as NoteListItem[]
      )
    },
    err => {
      console.error('[listenToNotes] Snapshot error:', err)
    }
  )
}

/* ================================
   Delete Note
================================ */

export async function deleteNote(userId: string, noteId: string) {
  try {
    const ref = doc(db, 'users', userId, 'notes', noteId)
    await deleteDoc(ref)
    localStorage.removeItem(`note:${noteId}`)
  } catch (err) {
    console.error('[deleteNote] Failed:', err)
    throw err
  }
}