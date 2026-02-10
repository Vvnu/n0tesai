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
} from 'firebase/firestore'
import { db } from './firebase'

/* ================================
   Types
================================ */

export type Note = {
  title: string
  content: any
  createdAt?: any
  updatedAt?: any
}

/* ================================
   Create Note
================================ */

export async function createNote(userId: string) {
  const ref = collection(db, 'users', userId, 'notes')

  const docRef = await addDoc(ref, {
    title: 'Untitled',
    content: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef
}


/* ================================
   Save Note (Auto-Save)
================================ */

export async function saveNote(
  userId: string,
  noteId: string,
  data: Partial<Note>
) {
  const ref = doc(db, 'users', userId, 'notes', noteId)

  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

/* ================================
   Load Single Note
================================ */

export async function loadNote(
  userId: string,
  noteId: string
): Promise<Note | null> {
  const ref = doc(db, 'users', userId, 'notes', noteId)
  const snap = await getDoc(ref)

  if (!snap.exists()) return null
  return snap.data() as Note
}

/* ================================
   Real-time Notes List
================================ */

export function listenToNotes(
  userId: string,
  callback: (notes: any[]) => void
) {
  const q = query(
    collection(db, 'users', userId, 'notes'),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(q, snapshot => {
    callback(
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    )
  })
}


/* ================================
   Delete Note
================================ */

import { deleteDoc } from 'firebase/firestore'

export async function deleteNote(
  userId: string,
  noteId: string
) {
  const ref = doc(db, 'users', userId, 'notes', noteId)
  await deleteDoc(ref)

  // local cleanup
  localStorage.removeItem(`note:${noteId}`)
}
