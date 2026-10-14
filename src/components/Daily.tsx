import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import useFitScale from '../hooks/useFitScale'
import useIsMobile from '../hooks/useIsMobile'
import AnimatedLines from './AnimatedLines'
import LoopLine from './LoopLine'
import LogoMark from './LogoMark'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1126.667

type Art = 'days' | 'mentors' | 'week' | 'goal'

/** One small authored drawing per card, so each fact reads as its own thing. */
function StatArt({ art, color, isInView, scale = 1 }: { art: Art; color: string; isInView: boolean; scale?: number }) {
  const ease = [0.22, 1, 0.36, 1] as const
  if (art === 'days') {
    // 67 days: 60 days + one week, filled in order.
    return (
      <div className="grid w-fit grid-cols-[repeat(17,auto)]" style={{ gap: 7 * scale }} aria-hidden="true">
        {Array.from({ length: 67 }).map((_, i) => (
          <motion.span
            key={i}
            className="block rounded-full"
            style={{ width: 9 * scale, height: 9 * scale, background: i >= 60 ? '#e0442f' : color }}
            initial={{ opacity: 0.18, scale: 0.6 }}
            animate={isInView ? { opacity: i >= 60 ? 1 : 0.85, scale: 1 } : undefined}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.018, ease }}
          />
        ))}
      </div>
    )
  }
  if (art === 'mentors') {
    return (
      <svg width={150 * scale} height={64 * scale} viewBox="0 0 150 64" fill="none" aria-hidden="true">
        {[0, 1].map((i) => (
          <motion.path
            key={i}
            d={`M${30 + i * 46} 62V30a22 22 0 0 1 44 0v32`}
            stroke={i === 1 ? '#e0442f' : color}
            strokeWidth="1.8"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.9, delay: 0.3 + i * 0.15, ease }}
          />
        ))}
      </svg>
    )
  }
  if (art === 'week') {
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
    return (
      <div className="flex" style={{ gap: 8 * scale }} aria-hidden="true">
        {days.map((d, i) => (
          <div key={d} className="flex flex-col items-center" style={{ gap: 6 * scale }}>
            <span className="flex items-center justify-center rounded-[8px] border" style={{ width: 30 * scale, height: 30 * scale, borderColor: `${color}55` }}>
              <svg width={14 * scale} height={14 * scale} viewBox="0 0 14 14" fill="none">
                <motion.path
                  d="M2.5 7.5 5.6 10.4 11.5 3.6"
                  stroke="#e0442f"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : undefined}
                  transition={{ duration: 0.35, delay: 0.4 + i * 0.16, ease }}
                />
              </svg>
            </span>
            <span className="font-sans" style={{ fontSize: 12 * scale, opacity: 0.6 }}>
              {d}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <LoopLine width={300} height={70} baseline={0.82} amp={0.34} stroke={color} strokeWidth={1.8} isInView={isInView} delay={0.3} duration={1.6} dot="#e0442f" style={{ width: 210 * scale, height: 49 * scale }} />
  )
}

interface Stat {
  art: Art
  value: string
  label: string
  bg: string
  fg: string
}

const stats: Stat[] = [
  { art: 'days', value: '60 יום ושבוע', label: 'ליווי אישי, לא קורס. שיחה פעם בשבוע לפי הלו״ז שלך', bg: '#171513', fg: '#f4efe6' },
  { art: 'mentors', value: '2 מלוות', label: 'כל אחת מתמחה בעולם אחר, ושתיהן מסתכלות על הרעיון שלך', bg: '#2a1d1a', fg: '#f4efe6' },
  { art: 'week', value: 'כל יום', label: 'משימה קטנה בווטסאפ. קטנה בשבוע עמוס, גדלה כשיש זמן', bg: '#1a1f19', fg: '#f4efe6' },
  { art: 'goal', value: 'מטרה אחת', label: 'עסק שמכניס כסף. לא עוד מחברת מלאה', bg: '#d6d2c8', fg: '#0e0d0c' },
]

const HEADING = 'משימה אחת ביום. בגודל של הזמן שלך.'
const INTRO = 'ככה הרעיון לא נשאר בראש. הוא זז. ויש מישהי שמחכה לשמוע איך הלך.'
const CAPTION = 'ככה זה נראה (דוגמה)'

const chat: { from: 'mentor' | 'me'; text: string }[] = [
  { from: 'mentor', text: 'בוקר טוב 🙂 המשימה של היום: לרשום 3 אנשים שביקשו ממך עזרה בחודש האחרון, ובמה.' },
  { from: 'me', text: 'עשיתי! יצא שכולם שאלו אותי על עיצוב שולחנות לאירועים 😮' },
  { from: 'mentor', text: 'זה בדיוק הכיוון. מחר נבדוק אם מישהו מהם ישלם על זה.' },
  { from: 'me', text: 'קצת מפחיד, אבל סגור' },
  { from: 'mentor', text: 'רק הצעד הבא. לא כל הדרך 💪' },
  { from: 'me', text: 'כתבתי לאחד מהם, והוא מעוניין! 🙌' },
  { from: 'mentor', text: 'מעולה. מחר נבנה לו הצעה.' },
]

function StatCard({ stat, scale = 1, compact = false }: { stat: Stat; scale?: number; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  // Compact = the half-width phone card: smaller drawing, tighter padding, readable 14px label.
  const pad = compact ? 16 : 42.667 * scale
  return (
    <div ref={ref} className="relative flex h-full flex-col justify-between overflow-hidden" style={{ background: stat.bg, color: stat.fg, padding: pad, gap: compact ? 18 : 28 * scale }}>
      <StatArt art={stat.art} color={stat.fg} isInView={isInView} scale={compact ? 0.44 : scale} />
      <div className="relative">
        <p className="font-display leading-[1]" style={{ fontSize: compact ? 27 : 64 * scale }}>
          {stat.value}
        </p>
        <AnimatedLines text={stat.label} className="opacity-80" style={{ marginTop: compact ? 8 : 14 * scale, fontSize: compact ? 15 : 22 * scale, lineHeight: compact ? 1.4 : 1.36 }} />
      </div>
    </div>
  )
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const
/** Same rhythm as the original site: first message 250ms after the chat is seen, then one every 850ms. */
const FIRST_MESSAGE_MS = 250
const MESSAGE_GAP_MS = 850

/** iPhone-like proportions: 360 × 738 design px (about 19.5:9 with the bezel). */
const PHONE_W = 360
const PHONE_H = 738

function StatusIcons({ scale }: { scale: number }) {
  return (
    <span className="flex items-center" style={{ gap: 6 * scale }} aria-hidden="true">
      <svg width={18 * scale} height={12 * scale} viewBox="0 0 18 12" fill="#0e0d0c">
        <rect x="0" y="8" width="3" height="4" rx="1" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
        <rect x="10" y="3" width="3" height="9" rx="1" />
        <rect x="15" y="0" width="3" height="12" rx="1" />
      </svg>
      <svg width={16 * scale} height={12 * scale} viewBox="0 0 16 12" fill="none" stroke="#0e0d0c" strokeWidth="1.8" strokeLinecap="round">
        <path d="M1.5 4.2a9.5 9.5 0 0 1 13 0M4 7a6 6 0 0 1 8 0" />
        <circle cx="8" cy="10" r="1.3" fill="#0e0d0c" stroke="none" />
      </svg>
      <svg width={26 * scale} height={12 * scale} viewBox="0 0 26 12" fill="none">
        <rect x="0.6" y="0.6" width="22" height="10.8" rx="3.2" stroke="#0e0d0c" strokeOpacity="0.45" strokeWidth="1.2" />
        <rect x="2.3" y="2.3" width="16" height="7.4" rx="1.8" fill="#0e0d0c" />
        <rect x="24" y="4" width="1.6" height="4" rx="0.8" fill="#0e0d0c" fillOpacity="0.45" />
      </svg>
    </span>
  )
}

/** A phone whose messages arrive one at a time once its screen is on view. */
function PhoneChat({ scale = 1 }: { scale?: number }) {
  const screenRef = useRef<HTMLDivElement>(null)
  const screenInView = useInView(screenRef, { once: true, amount: 0.35 })
  const reduceMotion = useReducedMotion()
  const [shown, setShown] = useState(() => (reduceMotion ? chat.length : 0))

  useEffect(() => {
    if (!screenInView || reduceMotion) return
    const timers = chat.map((_, i) => window.setTimeout(() => setShown(i + 1), FIRST_MESSAGE_MS + i * MESSAGE_GAP_MS))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [screenInView, reduceMotion])

  const bezel = 11 * scale
  const button = (style: React.CSSProperties) => <span className="absolute rounded-full bg-[#2b2927]" style={style} aria-hidden="true" />

  return (
    <div className="flex flex-col items-center" style={{ gap: 14 * scale }}>
      <motion.div
        className="relative shrink-0"
        style={{ width: PHONE_W * scale, height: PHONE_H * scale }}
        initial={reduceMotion ? { y: 0, rotate: -2.5, opacity: 1 } : { y: 80 * scale, rotate: 6, opacity: 0 }}
        whileInView={{ y: 0, rotate: -2.5, opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* side buttons: action + volume on the left, power on the right */}
        {button({ left: -3 * scale, top: 118 * scale, width: 4 * scale, height: 30 * scale })}
        {button({ left: -3 * scale, top: 172 * scale, width: 4 * scale, height: 58 * scale })}
        {button({ left: -3 * scale, top: 242 * scale, width: 4 * scale, height: 58 * scale })}
        {button({ right: -3 * scale, top: 196 * scale, width: 4 * scale, height: 92 * scale })}

        <div
          className="absolute inset-0"
          style={{
            borderRadius: 60 * scale,
            padding: bezel,
            background: 'linear-gradient(145deg, #3a3734 0%, #161514 38%, #0b0a0a 62%, #2e2b29 100%)',
            boxShadow: `0 ${50 * scale}px ${90 * scale}px -${40 * scale}px rgba(20,6,4,0.8), inset 0 0 0 ${1.5 * scale}px rgba(255,255,255,0.14), inset 0 0 0 ${4 * scale}px #0b0a0a`,
          }}
        >
          <div className="relative flex h-full flex-col overflow-hidden" style={{ borderRadius: 49 * scale, background: '#f4efe6' }}>
            {/* status bar with the dynamic island */}
            <div className="relative flex shrink-0 items-center justify-between bg-white" style={{ height: 50 * scale, padding: `0 ${30 * scale}px` }} dir="ltr">
              <span className="font-sans font-semibold text-ink" style={{ fontSize: 15 * scale }}>
                9:41
              </span>
              <span className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black" style={{ top: 11 * scale, width: 112 * scale, height: 32 * scale }} aria-hidden="true" />
              <StatusIcons scale={scale} />
            </div>

            {/* chat header */}
            <div className="flex shrink-0 items-center bg-white text-ink" style={{ gap: 10 * scale, padding: `${6 * scale}px ${16 * scale}px ${12 * scale}px`, borderBottom: '1px solid rgba(14,13,12,0.1)' }}>
              <svg width={11 * scale} height={18 * scale} viewBox="0 0 11 18" fill="none" aria-hidden="true">
                <path d="M2 2l7 7-7 7" stroke="#e0442f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="flex shrink-0 items-center justify-center rounded-full bg-claret" style={{ width: 38 * scale, height: 38 * scale }}>
                <LogoMark size={27 * scale} color="#f4efe6" accent="#f4efe6" />
              </span>
              <span className="flex flex-col leading-[1.2]">
                <b className="font-sans font-semibold" style={{ fontSize: 16 * scale }}>
                  יציאה מהלופ
                </b>
                <small className="font-sans text-[#6b6560]" style={{ fontSize: 13 * scale }}>
                  המלווה שלך
                </small>
              </span>
            </div>

            {/* messages start at the top; space is reserved, so each one pops into its own place */}
            <div
              ref={screenRef}
              className="flex flex-1 flex-col justify-start"
              style={{
                gap: 9 * scale,
                padding: `${14 * scale}px ${12 * scale}px ${10 * scale}px`,
                background: 'radial-gradient(circle at 20% 20%, rgba(224,68,47,0.06), transparent 60%), #f4efe6',
              }}
              aria-label="דוגמה להתכתבות יומית בליווי"
            >
              {chat.map((m, i) => (
                <motion.p
                  key={i}
                  className={`max-w-[82%] font-sans text-ink ${m.from === 'mentor' ? 'self-start bg-white' : 'self-end bg-[#f8d9cf]'}`}
                  style={{
                    fontSize: 17 * scale,
                    lineHeight: 1.42,
                    padding: `${9 * scale}px ${13 * scale}px`,
                    borderRadius: 18 * scale,
                    borderStartStartRadius: m.from === 'mentor' ? 5 * scale : 18 * scale,
                    borderStartEndRadius: m.from === 'me' ? 5 * scale : 18 * scale,
                    boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
                  }}
                  initial={false}
                  animate={i < shown ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14 * scale, scale: 0.96 }}
                  transition={{ opacity: { duration: 0.5, ease: EASE_OUT }, default: { duration: 0.6, ease: EASE_OUT } }}
                  aria-hidden={i >= shown || undefined}
                >
                  {m.text}
                </motion.p>
              ))}
            </div>

            {/* composer + home indicator */}
            <div className="shrink-0 bg-white" style={{ padding: `${10 * scale}px ${14 * scale}px ${26 * scale}px`, borderTop: '1px solid rgba(14,13,12,0.08)' }} aria-hidden="true">
              <div className="flex items-center" style={{ gap: 10 * scale }}>
                <span className="flex-1 rounded-full border border-ink/15 font-sans text-ink/40" style={{ padding: `${7 * scale}px ${14 * scale}px`, fontSize: 15 * scale }}>
                  הודעה
                </span>
                <span className="flex items-center justify-center rounded-full bg-claret" style={{ width: 32 * scale, height: 32 * scale }}>
                  <svg width={14 * scale} height={14 * scale} viewBox="0 0 14 14" fill="none">
                    <path d="M7 12V2M2.5 6.5 7 2l4.5 4.5" stroke="#f4efe6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
            <span className="absolute left-1/2 -translate-x-1/2 rounded-full bg-ink/85" style={{ bottom: 8 * scale, width: 128 * scale, height: 5 * scale }} aria-hidden="true" />
          </div>
        </div>
      </motion.div>
      <p className="font-display text-linen/75" style={{ fontSize: 20 * scale }}>
        {CAPTION}
      </p>
    </div>
  )
}

function ChatCard({ scale = 1, headingSize = 62 }: { scale?: number; headingSize?: number }) {
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden text-linen"
      style={{ background: 'linear-gradient(160deg, #e0442f 0%, #a8321f 55%, #5c1a10 100%)', padding: 40 * scale }}
    >
      <AnimatedLines text={HEADING} className="font-display" style={{ fontSize: headingSize * scale, lineHeight: 1.02 }} />
      <AnimatedLines text={INTRO} className="opacity-85" style={{ marginTop: 16 * scale, fontSize: 21 * scale, lineHeight: 1.4 }} baseDelay={0.1} />
      <div className="mt-auto" style={{ paddingTop: 26 * scale }}>
        <PhoneChat scale={scale} />
      </div>
    </div>
  )
}

function Reveal({ index, isInView, className, style, children }: { index: number; isInView: boolean; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <motion.div
      className={`overflow-hidden ${className ?? ''}`}
      style={style}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay: index * 0.12, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function MobileDaily() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.05 })
  return (
    <section id="daily" ref={ref} className="relative flex w-full flex-col gap-3 bg-ink">
      <Reveal index={0} isInView={inView}>
        <ChatCard scale={0.82} headingSize={54} />
      </Reveal>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <Reveal key={s.value} index={i + 1} isInView={inView} className="min-h-[200px]">
            <StatCard stat={s} compact />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Daily() {
  const isMobile = useIsMobile()
  const fit = useFitScale(DESIGN_WIDTH)
  const gridRef = useRef<HTMLDivElement>(null)
  const gridInView = useInView(gridRef, { once: true, amount: 0.2 })

  if (isMobile) return <MobileDaily />

  const boxes = [
    { right: 0, top: 0, width: 574.667, height: 535 },
    { right: 1345.334, top: 0, width: 574.667, height: 535 },
    { right: 0, top: 561.667, width: 574.667, height: 535 },
    { right: 1345.334, top: 561.667, width: 574.667, height: 535 },
  ]

  return (
    <section id="daily" ref={fit.ref} className="relative w-full overflow-hidden bg-ink" style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}>
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
        <div ref={gridRef} className="absolute left-0 top-0" style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT }}>
          {stats.map((s, i) => (
            <Reveal key={s.value} index={i === 0 ? 0 : i + 1} isInView={gridInView} className="absolute" style={boxes[i]}>
              <StatCard stat={s} />
            </Reveal>
          ))}
          <Reveal index={1} isInView={gridInView} className="absolute" style={{ right: 601.334, top: 0, width: 717.333, height: 1096.667 }}>
            <ChatCard />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default Daily
