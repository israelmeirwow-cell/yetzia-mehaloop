import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { motion, useInView, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import useFitScale from '../hooks/useFitScale'
import useIsMobile from '../hooks/useIsMobile'
import AnimatedLines from './AnimatedLines'
import LoopLine from './LoopLine'

const BLIND_ROWS = 4
const PIN_HEIGHT_VH = 300
const ZOOM_END = 0.55
const FRAME_LAND_END = 0.8
const TEXT_REVEAL_AT = 0.72
const SWAY_RANGE_X = 36
const SWAY_RANGE_Y = 24

type Tone = 'stone' | 'cream' | 'claret' | 'moss' | 'soot' | 'deep'
const TONES: Record<Tone, { bg: string; fg: string }> = {
  stone: { bg: '#d6d2c8', fg: '#0e0d0c' },
  cream: { bg: '#f4efe6', fg: '#0e0d0c' },
  claret: { bg: '#e0442f', fg: '#f4efe6' },
  moss: { bg: '#3f4a3a', fg: '#f4efe6' },
  soot: { bg: '#2a2622', fg: '#f4efe6' },
  deep: { bg: '#a8321f', fg: '#f4efe6' },
}

const TITLE = 'כל הרעיונות שלך'
const FEATURED_LABEL = 'רעיון אחד'
const REVEAL_BADGE = 'הדרך החוצה'
const REVEAL_TEXT = 'לא צריך לדעת את כל הדרך. רק את הצעד הבא.'
const REVEAL_FOOT = '60 יום ושבוע · ארבעה שלבים · רעיון אחד'

/** Every idea that is still sitting in the notes app. */
const ideas: { text: string; tone: Tone }[] = [
  { text: 'חנות תכשיטים באטסי?', tone: 'stone' },
  { text: 'עיצוב שולחנות לאירועים', tone: 'cream' },
  { text: 'פודקאסט משלי', tone: 'soot' },
  { text: 'סדנאות לילדים', tone: 'moss' },
  { text: 'אפליקציה משלי', tone: 'deep' },
  { text: 'ממחר. הפעם ברצינות', tone: 'claret' },
  { text: 'סטודיו קטן לצילום', tone: 'stone' },
  { text: 'קורס דיגיטלי על...?', tone: 'soot' },
  { text: 'חנות אונליין', tone: 'moss' },
  { text: 'עוד קורס אחד ואז', tone: 'cream' },
  { text: 'ליווי כושר אונליין', tone: 'deep' },
  { text: 'ניוזלטר משלי', tone: 'soot' },
]

interface Box {
  left: number
  top: number
  width: number
  height: number
}

interface Geometry {
  W: number
  H: number
  radius: number
  tileFont: number
  /** idea index + box; tiles whose text would sit under the title get `top` alignment */
  tiles: { idea: number; box: Box; alignTop?: boolean }[]
  featured: Box
  target: Box
  frame: Box & { x0: number; x1: number; archTop: number }
  title: Box & { font: number; single: boolean }
  badgeTop: number
  badgeFont: number
  text: Box & { font: number }
  foot: Box & { font: number }
}

const T = (left: number, top: number, width = 268, height = 293): Box => ({ left, top, width, height })

/** The template's 1920 × 1080 board. */
const DESKTOP: Geometry = {
  W: 1920,
  H: 1080,
  radius: 100,
  tileFont: 36,
  tiles: [
    { idea: 0, box: T(-26.67, 153.67) },
    { idea: 1, box: T(-26.67, 633.33) },
    { idea: 2, box: T(416, -85.67, 269) },
    { idea: 3, box: T(416, 394, 269, 292), alignTop: true },
    { idea: 4, box: T(416, 872.67, 269) },
    { idea: 5, box: T(826.17, 153.67, 269) },
    { idea: 6, box: T(1305.33, -86.67) },
    { idea: 7, box: T(1305.33, 393), alignTop: true },
    { idea: 8, box: T(1305.33, 872.67, 269) },
    { idea: 9, box: T(1745.33, 153.67) },
    { idea: 10, box: T(1745.33, 633.33) },
  ],
  featured: T(827.17, 633.33),
  target: { left: 491, top: 0, width: 945, height: 1079 },
  frame: { left: 0, top: -72, width: 1923, height: 1223, x0: 532, x1: 1391, archTop: 118 },
  title: { left: 560, top: 489, width: 800, height: 110, font: 112, single: true },
  badgeTop: 120,
  badgeFont: 20,
  text: { left: 610, top: 400, width: 700, height: 300, font: 72 },
  foot: { left: 560, top: 935, width: 800, height: 40, font: 20 },
}

function Blinds({ isInView, baseDelay = 0 }: { isInView: boolean; baseDelay?: number }) {
  return (
    <>
      {Array.from({ length: BLIND_ROWS }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-ink"
          style={{
            left: -2,
            right: -2,
            top: `calc(${(i / BLIND_ROWS) * 100}% - 2px)`,
            height: `calc(${100 / BLIND_ROWS}% + 4px)`,
            transformOrigin: 'bottom',
          }}
          initial={{ scaleY: 1 }}
          animate={isInView ? { scaleY: 0 } : undefined}
          transition={{ duration: 0.5, delay: baseDelay + i * 0.12, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

/** The inside of the arch: warm light with the loop line lying almost flat across it. */
function ArchInterior({ w, h }: { w: number; h: number }) {
  return (
    <div className="absolute inset-0" style={{ background: 'radial-gradient(70% 55% at 50% 62%, #e0442f 0%, #8f2a1a 45%, #2a0f0b 85%, #160a08 100%)' }}>
      <LoopLine width={w} height={h} baseline={0.84} amp={0.09} stroke="rgba(244,239,230,0.55)" strokeWidth={2.4} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" duration={0} />
    </div>
  )
}

/** An ink mask with an arched opening, the same shape as the template's cellar door. */
function ArchFrame({ frame }: { frame: Geometry['frame'] }) {
  const { width: W, height: H, x0, x1, archTop } = frame
  const r = (x1 - x0) / 2
  const bottom = H
  const opening = `M${x0} ${bottom} V${archTop + r} A${r} ${r} 0 0 1 ${x1} ${archTop + r} V${bottom} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" aria-hidden="true">
      <path d={`M0 0H${W}V${H}H0Z ${opening}`} fill="#0e0d0c" fillRule="evenodd" />
      <path d={opening} fill="none" stroke="#d6d2c8" strokeOpacity="0.55" strokeWidth="2" />
      <path
        d={`M${x0 + 22} ${bottom} V${archTop + r} A${r - 22} ${r - 22} 0 0 1 ${x1 - 22} ${archTop + r} V${bottom}`}
        fill="none"
        stroke="#d6d2c8"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function LensBoard({ g }: { g: Geometry }) {
  const fit = useFitScale(g.W, g.H)
  const offsetX = (fit.containerSize.width - g.W * fit.scale) / 2
  const offsetY = (fit.containerSize.height - g.H * fit.scale) / 2
  const galleryInView = useInView(fit.ref, { once: true, amount: 0.3 })

  const originCenter = { x: g.featured.left + g.featured.width / 2, y: g.featured.top + g.featured.height / 2 }
  const targetCenter = { x: g.target.left + g.target.width / 2, y: g.target.top + g.target.height / 2 }

  const pinRef = fit.ref
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress: t } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  const p1 = useTransform(t, [0, ZOOM_END], [0, 1])
  const sx = useTransform(p1, [0, 1], [1, g.target.width / g.featured.width])
  const sy = useTransform(p1, [0, 1], [1, g.target.height / g.featured.height])
  const tx = useTransform(p1, [0, 1], [0, targetCenter.x - originCenter.x])
  const ty = useTransform(p1, [0, 1], [0, targetCenter.y - originCenter.y])

  const fLeft = useTransform(p1, [0, 1], [g.featured.left, g.target.left])
  const fTop = useTransform(p1, [0, 1], [g.featured.top, g.target.top])
  const fWidth = useTransform(p1, [0, 1], [g.featured.width, g.target.width])
  const fHeight = useTransform(p1, [0, 1], [g.featured.height, g.target.height])
  const fRadius = useTransform(p1, [0, 1], [g.radius, 0])
  const fLabelOpacity = useTransform(p1, [0, 0.25], [1, 0])

  const p2 = useTransform(t, [ZOOM_END, FRAME_LAND_END], [0, 1])
  const frameScale = useTransform(p2, [0, 1], [3, 1])
  const darken = useTransform(p2, [0, 1], [0, 0.3])
  const darkenSpring = useSpring(darken, { stiffness: 120, damping: 22 })

  const [textRevealed, setTextRevealed] = useState(false)
  useMotionValueEvent(t, 'change', (v) => setTextRevealed(v > TEXT_REVEAL_AT))

  const swayX = useMotionValue(0)
  const swayY = useMotionValue(0)
  const springSwayX = useSpring(swayX, { stiffness: 40, damping: 14, mass: 0.6 })
  const springSwayY = useSpring(swayY, { stiffness: 40, damping: 14, mass: 0.6 })

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    swayX.set(((event.clientX - rect.left) / rect.width - 0.5) * SWAY_RANGE_X)
    swayY.set(((event.clientY - rect.top) / rect.height - 0.5) * SWAY_RANGE_Y)
  }

  const handlePointerLeave = () => {
    swayX.set(0)
    swayY.set(0)
  }

  // Settle between "zoomed" and "framed" instead of stopping halfway.
  useEffect(() => {
    let debounceTimer = 0
    let snapping = false

    const trySnap = () => {
      const wrapper = sectionRef.current
      if (snapping || !wrapper) return
      const current = t.get()
      if (current <= ZOOM_END || current >= FRAME_LAND_END) return
      const nearest = current - ZOOM_END < FRAME_LAND_END - current ? ZOOM_END : FRAME_LAND_END
      const scrollYAtT0 = window.scrollY + wrapper.getBoundingClientRect().top
      const scrollRange = wrapper.offsetHeight - window.innerHeight
      snapping = true
      window.scrollTo({ top: scrollYAtT0 + nearest * scrollRange, behavior: 'smooth' })
      window.setTimeout(() => {
        snapping = false
      }, 600)
    }

    const onScroll = () => {
      if (snapping) return
      window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(trySnap, 140)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(debounceTimer)
    }
  }, [t, sectionRef])

  return (
    <section
      id="way"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: `${PIN_HEIGHT_VH}vh` }}
    >
      <div ref={pinRef} className="sticky top-0 h-screen w-full overflow-hidden bg-ink" onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}>
        <div
          className="isolate"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: g.W,
            height: g.H,
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${fit.scale})`,
            transformOrigin: 'top left',
          }}
        >
          <motion.div
            className="absolute left-0 top-0"
            style={{ width: g.W, height: g.H, transformOrigin: `${originCenter.x}px ${originCenter.y}px`, x: tx, y: ty, scaleX: sx, scaleY: sy }}
          >
            {g.tiles.map((tile, i) => {
              const idea = ideas[tile.idea]
              const tone = TONES[idea.tone]
              const { box } = tile
              return (
                <div key={tile.idea} className="absolute overflow-hidden" style={{ ...box, borderRadius: g.radius, background: tone.bg }}>
                  <motion.div
                    className={`absolute inset-0 flex justify-center text-center font-display leading-[1.1] ${tile.alignTop ? 'items-start' : 'items-center'}`}
                    style={{ color: tone.fg, x: springSwayX, y: springSwayY, fontSize: g.tileFont, padding: `${tile.alignTop ? g.tileFont : 0}px ${g.tileFont * 0.9}px 0` }}
                  >
                    {idea.text}
                  </motion.div>
                  <Blinds isInView={galleryInView} baseDelay={i * 0.06} />
                </div>
              )
            })}

            <div className="absolute" style={{ left: g.title.left, top: g.title.top, width: g.title.width }}>
              <AnimatedLines
                text={TITLE}
                className="text-center font-display leading-[1] text-linen"
                style={{ fontSize: g.title.font, textShadow: '0 4px 40px rgba(14,13,12,0.7)' }}
                forceSingleLine={g.title.single}
              />
            </div>
          </motion.div>

          <motion.div className="absolute overflow-hidden" style={{ left: fLeft, top: fTop, width: fWidth, height: fHeight, borderRadius: fRadius }}>
            <motion.div className="absolute inset-[-4%]" style={{ x: springSwayX, y: springSwayY }}>
              <ArchInterior w={g.target.width} h={g.target.height} />
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-center font-display leading-[1.1] text-linen"
              style={{ opacity: fLabelOpacity, fontSize: g.tileFont, padding: `0 ${g.tileFont}px` }}
            >
              {FEATURED_LABEL}
            </motion.div>
            <Blinds isInView={galleryInView} baseDelay={6 * 0.06} />
            <motion.div className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: darkenSpring }} />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute"
            style={{ left: g.frame.left, top: g.frame.top, width: g.frame.width, height: g.frame.height, scale: frameScale, transformOrigin: 'center' }}
          >
            <ArchFrame frame={g.frame} />
          </motion.div>

          {textRevealed && (
            <>
              <div className="absolute left-0 flex w-full justify-center" style={{ top: g.badgeTop }}>
                <div className="inline-flex items-center justify-center rounded-2xl border border-linen/80 px-5 py-2 opacity-90">
                  <AnimatedLines text={REVEAL_BADGE} className="font-sans-tight font-medium text-linen" style={{ fontSize: g.badgeFont }} />
                </div>
              </div>

              <div className="absolute" style={{ left: g.text.left, top: g.text.top, width: g.text.width }}>
                <AnimatedLines text={REVEAL_TEXT} className="text-center font-display text-linen" style={{ fontSize: g.text.font, lineHeight: 1.08 }} />
              </div>

              <div className="absolute" style={{ left: g.foot.left, top: g.foot.top, width: g.foot.width }}>
                <AnimatedLines text={REVEAL_FOOT} className="text-center font-sans-tight font-medium text-linen/80" style={{ fontSize: g.foot.font }} />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

/** Rows of ideas for phones; each row repeats so it always overflows both edges while it slides. */
const MOBILE_ROWS = [
  [0, 5, 2, 9, 4, 7, 1, 10],
  [3, 8, 11, 6, 0, 5, 2, 9],
  [7, 1, 10, 4, 8, 3, 11, 6],
]
const ROW_SHIFT = 130

/**
 * Phones: no pinned board and no arch. One screen where the ideas drift sideways with the scroll,
 * alternating direction per row (one transform per row, so it stays light).
 */
function MobileIdeas() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const forward = useTransform(scrollYProgress, [0, 1], [-ROW_SHIFT, ROW_SHIFT])
  const backward = useTransform(scrollYProgress, [0, 1], [ROW_SHIFT, -ROW_SHIFT])

  const row = (ideaIdx: number[], r: number) => (
    <div key={r} className="flex justify-center">
      <motion.div className="flex w-max shrink-0 gap-3" style={{ x: r % 2 === 0 ? forward : backward }}>
        {ideaIdx.map((idx, i) => {
          const idea = ideas[idx]
          const tone = TONES[idea.tone]
          return (
            <motion.div
              key={`${r}-${i}`}
              className="flex h-[104px] w-[150px] shrink-0 items-center justify-center rounded-[30px] px-4 text-center font-display text-[18px] leading-[1.15]"
              style={{ background: tone.bg, color: tone.fg }}
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : undefined}
              transition={{ duration: 0.6, delay: r * 0.12 + Math.abs(i - 3.5) * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              {idea.text}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )

  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-ink py-16" aria-label={TITLE}>
      <div className="flex flex-col gap-3">
        {row(MOBILE_ROWS[0], 0)}
        {row(MOBILE_ROWS[1], 1)}
      </div>
      <AnimatedLines text={TITLE} className="my-8 text-center font-display text-[13vw] leading-[1] text-linen" />
      {row(MOBILE_ROWS[2], 2)}
    </section>
  )
}

function Lens() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileIdeas /> : <LensBoard g={DESKTOP} />
}

export default Lens
