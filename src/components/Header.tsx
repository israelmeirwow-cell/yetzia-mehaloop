import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import useFitScale from '../hooks/useFitScale'
import useIsMobile from '../hooks/useIsMobile'
import LogoMark from './LogoMark'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 68

const startLinks = [
  { label: 'הלופ', href: '#loop' },
  { label: 'הדרך החוצה', href: '#way' },
  { label: 'משימה ביום', href: '#daily' },
]
const endLinks = [
  { label: 'המלוות', href: '#team' },
  { label: 'שאלות', href: '#faq' },
]

const linkClass = 'font-sans-tight text-[17px] font-medium leading-[19px] whitespace-nowrap transition-opacity hover:opacity-70'

function useScrolledPast(fraction = 0.85) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * fraction)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [fraction])
  return past
}

function Brand({ size = 40, text = 20.7 }: { size?: number; text?: number }) {
  return (
    <a href="#top" className="flex min-h-[44px] items-center gap-[8px] font-display text-linen" aria-label="יציאה מהלופ, לראש העמוד">
      <LogoMark size={size} />
      <span className="flex flex-col leading-[0.98]" style={{ fontSize: text }}>
        <span>יציאה</span>
        <span className="font-light">מהלופ</span>
      </span>
    </a>
  )
}

function MobileHeader({ solid }: { solid: boolean }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const links = [...startLinks, ...endLinks]

  return (
    <>
      <motion.header
        initial={{ y: '-100%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed inset-x-0 top-0 z-50 flex h-[60px] items-center justify-between border-b px-4 text-linen transition-colors duration-300 ${
          solid || open ? 'border-white/10 bg-ink/90 backdrop-blur-md' : 'border-transparent bg-transparent'
        }`}
      >
        <Brand size={34} text={17} />
        <div className="flex items-center gap-2">
          <a href="#contact" className="flex h-[44px] items-center rounded-full border border-linen/70 px-4 font-sans-tight text-[15px] font-medium text-linen">
            לשיחת מיפוי
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'סגירת התפריט' : 'פתיחת התפריט'}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-full"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <motion.path d="M3 7h16" stroke="#f4efe6" strokeWidth="1.6" strokeLinecap="round" style={{ transformOrigin: '11px 7px' }} animate={open ? { y: 4, rotate: 45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.25 }} />
              <motion.path d="M3 15h16" stroke="#f4efe6" strokeWidth="1.6" strokeLinecap="round" style={{ transformOrigin: '11px 15px' }} animate={open ? { y: -4, rotate: -45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.25 }} />
            </svg>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="ניווט"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-ink px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[88px] text-linen"
          >
            <ul className="flex flex-col">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.05, ease: 'easeOut' }}
                  className="border-b border-white/10"
                >
                  <a href={l.href} onClick={() => setOpen(false)} className="block py-4 font-display text-[40px] leading-[1.1]">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-auto flex h-[58px] items-center justify-center rounded-[18px] bg-claret font-sans-tight text-[18px] font-semibold text-linen"
            >
              לתיאום שיחת מיפוי
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

function Header() {
  const isMobile = useIsMobile()
  const solid = useScrolledPast()
  const fit = useFitScale(DESIGN_WIDTH)
  const isInView = useInView(fit.ref, { once: true, amount: 0 })

  if (isMobile) return <MobileHeader solid={solid} />

  return (
    <div
      ref={fit.ref}
      className={`fixed left-0 top-0 z-50 w-full overflow-hidden transition-colors duration-300 ${
        solid ? 'bg-ink/80 backdrop-blur-md' : 'bg-transparent'
      }`}
      style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${fit.scale})`,
          transformOrigin: 'top left',
        }}
      >
        <motion.header
          initial={{ y: '-100%' }}
          animate={{ y: isInView ? '0%' : '-100%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full w-full border-b border-white/10 text-linen"
        >
          <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center">
            <nav className="flex h-full items-center gap-[42.667px] justify-self-start border-e border-white/10 ps-[33.333px] pe-[48px]">
              {startLinks.map((l) => (
                <a key={l.href} href={l.href} className={linkClass}>
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="justify-self-center">
              <Brand />
            </div>

            <nav className="flex h-full items-center gap-[42.667px] justify-self-end border-s border-white/10 ps-[42.667px] pe-[42.333px]">
              {endLinks.map((l) => (
                <a key={l.href} href={l.href} className={linkClass}>
                  {l.label}
                </a>
              ))}
              <span className="h-full w-px bg-white/10" />
              <a href="#contact" className={`${linkClass} underline underline-offset-4`}>
                לשיחת מיפוי
              </a>
            </nav>
          </div>
        </motion.header>
      </div>
    </div>
  )
}

export default Header
