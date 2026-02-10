import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export async function saveNote(
  userId: string,
  noteId: string,
  content: any
) {
  const ref = doc(db, 'users', userId, 'notes', noteId)

  await setDoc(
    ref,
    {
      content,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function loadNote(userId: string, noteId: string) {
  const ref = doc(db, 'users', userId, 'notes', noteId)
  const snap = await getDoc(ref)

  if (!snap.exists()) return null
  return snap.data().content
}
