import { useRef } from 'react'
import { motion, useInView, type Transition } from 'motion/react'
import useFitScale from '../hooks/useFitScale'
import useIsMobile from '../hooks/useIsMobile'
import LogoMark from './LogoMark'
import { CONFIG, waLink } from '../lib/loop'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 861
const STEP = 0.045

const siteLinks = [
  { label: 'הלופ', href: '#loop' },
  { label: 'הדרך החוצה', href: '#way' },
  { label: 'משימה ביום', href: '#daily' },
  { label: 'המלוות', href: '#team' },
  { label: 'שאלות', href: '#faq' },
]

const TAGLINE = 'ליווי אישי לאנשים עם רעיונות גדולים. פחות ידע, יותר בהירות.'
const WORDMARK = 'יציאה מהלופ'

function InstagramIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0e0d0c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="#0e0d0c" stroke="none" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0e0d0c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20l1.3-3.8A8 8 0 1 1 8.2 19L4 20z" />
      <path d="M9.3 8.6c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.2-.1.3 0 .5a6 6 0 0 0 2.8 2.7c.2.1.3.1.5-.1l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .7-.6 1.3-1.3 1.4-1 .1-2.5-.3-4.2-1.9s-2.2-3.1-2.1-4.1c0-.5.3-1 .7-1.3z" />
    </svg>
  )
}

const socials = [
  { Icon: WhatsAppIcon, label: 'ווטסאפ', href: waLink() },
  { Icon: InstagramIcon, label: 'אינסטגרם', href: CONFIG.instagramUrl },
]

const listItemClass = 'font-sans-tight text-[22px] font-medium leading-[24.2px] text-[#5a554d] transition-colors hover:text-ink'

function fadeUp(isInView: boolean, step: number): { initial: { opacity: number; y: number }; animate: { opacity: number; y: number } | undefined; transition: Transition } {
  return {
    initial: { opacity: 0, y: 14 },
    animate: isInView ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.4, delay: step * STEP, ease: 'easeOut' },
  }
}

function Wordmark({ text, isInView, slide = 700 }: { text: string; isInView: boolean; slide?: number }) {
  return (
    <motion.div className="flex whitespace-pre" initial={{ x: -slide }} animate={isInView ? { x: 0 } : undefined} transition={{ duration: 1.3, delay: 0.3, ease: 'easeOut' }}>
      {Array.from(text).map((char, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: '120%' }}
            animate={isInView ? { y: '0%' } : undefined}
            transition={{ duration: 0.75, delay: i * 0.08, ease: 'easeOut' }}
          >
            {char}
          </motion.span>
        </span>
      ))}
    </motion.div>
  )
}

function Brand({ size, text }: { size: number; text: number }) {
  return (
    <span className="flex items-center gap-[10px] font-display text-ink">
      <LogoMark size={size} color="#0e0d0c" />
      <span className="flex flex-col leading-[0.98]" style={{ fontSize: text }}>
        <span>יציאה</span>
        <span className="font-light">מהלופ</span>
      </span>
    </span>
  )
}

function MobileFooter() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <footer ref={ref} className="relative w-full overflow-hidden bg-stone px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-14 text-ink">
      <Brand size={48} text={22} />
      <p className="mt-4 max-w-[300px] font-sans text-[17px] leading-[1.45]">{TAGLINE}</p>
      <div className="mt-10 grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-sans text-[16px] font-semibold">באתר</h3>
          <div className="mt-2 flex flex-col">
            {siteLinks.map((l) => (
              <a key={l.href} href={l.href} className="flex min-h-[44px] items-center font-sans-tight text-[17px] font-medium text-[#5a554d]">
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-sans text-[16px] font-semibold">דברו איתנו</h3>
          <div className="mt-2 flex flex-col">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener" className="flex min-h-[44px] items-center gap-2 font-sans-tight text-[17px] font-medium text-[#5a554d]">
                <s.Icon />
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-10 font-sans-tight text-[14px]">© 2026, יציאה מהלופ</p>
      <div className="mt-4 select-none font-display text-[22vw] font-medium leading-[0.95] text-[#e4e0d7]" aria-hidden="true">
        <Wordmark text={WORDMARK} isInView={isInView} slide={120} />
      </div>
    </footer>
  )
}

function Footer() {
  const isMobile = useIsMobile()
  const fit = useFitScale(DESIGN_WIDTH)
  const isInView = useInView(fit.ref, { once: true, amount: 0.2 })

  if (isMobile) return <MobileFooter />

  return (
    <footer ref={fit.ref} className="relative w-full overflow-hidden bg-stone" style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}>
      <div
        className="isolate"
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
        <motion.a href="#top" {...fadeUp(isInView, 0)} className="absolute" style={{ right: 32, top: 80 }} aria-label="יציאה מהלופ, לראש העמוד">
          <Brand size={64} text={29} />
        </motion.a>

        <motion.p {...fadeUp(isInView, 1)} className="absolute font-sans text-[22px] leading-[30px] text-ink" style={{ right: 32, top: 193, width: 380 }}>
          {TAGLINE}
        </motion.p>

        <motion.p {...fadeUp(isInView, 2)} className="absolute font-sans-tight text-[18px] text-ink" style={{ right: 32, top: 351 }}>
          © 2026, יציאה מהלופ
        </motion.p>

        <div className="absolute" style={{ right: 782, top: 80, width: 347 }}>
          <motion.h3 {...fadeUp(isInView, 3)} className="font-sans text-[22px] font-semibold text-ink">
            באתר
          </motion.h3>
          <div className="mt-[43px] flex flex-col gap-[10.67px]">
            {siteLinks.map((l, i) => (
              <motion.a key={l.href} href={l.href} {...fadeUp(isInView, 4 + i)} className={listItemClass}>
                {l.label}
              </motion.a>
            ))}
          </div>
        </div>

        <div className="absolute" style={{ right: 1159, top: 80, width: 347 }}>
          <motion.h3 {...fadeUp(isInView, 9)} className="font-sans text-[22px] font-semibold text-ink">
            דברו איתנו
          </motion.h3>
          <div className="mt-[43px] flex flex-col gap-[10.67px]">
            <motion.a href={waLink()} target="_blank" rel="noopener" {...fadeUp(isInView, 10)} className={listItemClass}>
              ווטסאפ
            </motion.a>
            <motion.a href={CONFIG.instagramUrl} target="_blank" rel="noopener" {...fadeUp(isInView, 11)} className={listItemClass}>
              אינסטגרם: "לופ" בהודעה פרטית
            </motion.a>
          </div>
          <motion.a href="#contact" {...fadeUp(isInView, 12)} className={`mt-[43px] block ${listItemClass} underline underline-offset-4`}>
            לתיאום שיחת מיפוי
          </motion.a>
        </div>

        <div className="absolute" style={{ right: 1533, top: 80, width: 347 }}>
          <motion.h3 {...fadeUp(isInView, 13)} className="font-sans text-[22px] font-semibold text-ink">
            ברשתות
          </motion.h3>
          <div className="mt-[43px] flex items-center gap-[10px]">
            {socials.map(({ Icon, label, href }, i) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener"
                aria-label={label}
                className="flex h-[32px] w-[32px] items-center justify-center"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : undefined}
                transition={{ duration: 0.35, delay: (14 + i) * STEP }}
              >
                <Icon />
              </motion.a>
            ))}
          </div>
        </div>

        <div className="absolute select-none font-display font-medium text-[#e4e0d7]" style={{ right: 0, top: 430, width: 1920, fontSize: 340, lineHeight: '400px' }} aria-hidden="true">
          <Wordmark text={WORDMARK} isInView={isInView} />
        </div>
      </div>
    </footer>
  )
}

export default Footer
