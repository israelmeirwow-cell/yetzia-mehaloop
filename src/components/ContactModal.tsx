import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { LeadForm } from './Contact'
import { closeContact, openContact, useContactModal } from '../lib/contactModal'

/**
 * The "שיחת מיפוי" form as a window over the page. Every link to #contact opens it instead of scrolling,
 * so the visitor stays where they were reading. Esc, the backdrop or the X close it.
 */
export default function ContactModal() {
  const from = useContactModal()
  const open = !!from
  const panel = useRef<HTMLDivElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  // Any <a href="#contact"> on the page opens the window.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const a = (e.target as Element | null)?.closest?.('a[href="#contact"]') as HTMLAnchorElement | null
      if (!a) return
      e.preventDefault()
      returnTo.current = a
      const where = a.closest('header') ? 'תפריט עליון' : a.closest('footer') ? 'כותרת תחתונה' : a.closest('section')?.id ? `אזור ${a.closest('section')!.id}` : 'כפתור בדף'
      openContact(`${where}: ${a.textContent?.trim() || 'שיחת מיפוי'}`)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContact()
      if (e.key === 'Tab' && panel.current) {
        const items = panel.current.querySelectorAll<HTMLElement>('button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])')
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true }), 450)
    return () => {
      html.style.overflow = prev
      document.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
      returnTo.current?.focus({ preventScroll: true })
    }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="contact-modal"
          className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-label="שיחת מיפוי"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm" onClick={closeContact} aria-hidden="true" />
          <div className="pointer-events-none relative flex min-h-full items-start justify-center px-3 py-4 sm:items-center sm:px-6 sm:py-10">
            <motion.div
              ref={panel}
              className="pointer-events-auto w-full max-w-[760px]"
              initial={{ opacity: 0, y: 70, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <LeadForm key={from} openedFrom={from} onClose={closeContact} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
