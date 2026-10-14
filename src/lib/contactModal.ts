import { useSyncExternalStore } from 'react'

/** Which "שיחת מיפוי" button opened the pop-up ('' = closed). */
let openedFrom = ''
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

export function openContact(from: string) {
  openedFrom = from || 'כפתור שיחת מיפוי'
  emit()
}

export function closeContact() {
  openedFrom = ''
  emit()
}

export function useContactModal() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f)
      return () => subs.delete(f)
    },
    () => openedFrom,
  )
}
