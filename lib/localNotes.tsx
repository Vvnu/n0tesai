export function saveLocalNote(noteId: string, content: any) {
  localStorage.setItem(
    `note:${noteId}`,
    JSON.stringify(content)
  )
}

export function loadLocalNote(noteId: string) {
  const data = localStorage.getItem(`note:${noteId}`)
  return data ? JSON.parse(data) : null
}
