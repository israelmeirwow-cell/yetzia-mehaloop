import { useRef } from 'react'
import { motion, useInView, useTransform, type MotionValue } from 'motion/react'
import useFitScale from '../hooks/useFitScale'
import useIsMobile from '../hooks/useIsMobile'
import useScrollCrossProgress from '../hooks/useScrollCrossProgress'
import AnimatedLines from './AnimatedLines'
import { LoopStage } from './LoopStage'

const DESIGN_WIDTH = 1920
/** The top block (stripes, headline, paragraphs) and the closing arc block; the loop stage sits between them. */
const TOP_H = 1460
const ARC_BLOCK_H = 1100
const PAPER = '#d6d2c8'

const stripes = [
  { top: 0, height: 50 },
  { top: 46, height: 68 },
  { top: 110, height: 98 },
  { top: 204, height: 134 },
]

// Positions are measured from the right edge (the page reads right to left).
const headlineLines = [
  { text: 'יש לך פתק בטלפון', right: 33, top: 532 },
  { text: 'מלא ברעיונות.', right: 783, top: 640 },
  { text: 'כל אחד מהם', right: 783, top: 748 },
  { text: 'יכול היה להיות עסק', right: 380, top: 856 },
  { text: 'ואף אחד עוד לא יצא מהפתק', right: 520, top: 964, opacity: 0.5 },
]

const paragraphs = [
  'כל כמה שבועות מגיע רעיון חדש, והוא תמיד נראה טוב יותר מהקודם. "ממחר, הפעם ברצינות." כמה פעמים כבר נאמר המשפט הזה?',
  'ותמיד יש עוד משהו לחכות לו: עוד קורס אחד, עוד פודקאסט אחד, ואז. כבר הושקעו זמן וכסף, יש מחברת מלאה, ועדיין אין תוצאה אחת בשטח.',
]
/* ------------------------------------------------------------------
   The arc word. Glyph geometry is generated (not hand placed) so any
   Hebrew word fits: big first letter on the right, shrinking along a
   rising swoosh to the left. Scroll bends it into its mirror image.
   ------------------------------------------------------------------ */
const ARC_WORD = 'קדימה!'
const ARC_W = 1400
const ARC_H = 911

const REF_SIZE = [735, 480, 353, 282, 226, 198, 170, 141, 141, 141]
const REF_BOTTOM = [886, 862, 911, 883, 802, 716, 639, 554, 469, 398]
const REF_ROTATE = [35.1, 20.9, 2.4, -10.9, -20.8, -27.2, -31.8, -35.7, -39, -40.9]
const REF_WEIGHT = [300, 340, 380, 420, 480, 540, 600, 680, 760, 860]

function sample(arr: number[], t: number) {
  const x = t * (arr.length - 1)
  const i = Math.min(arr.length - 2, Math.floor(x))
  const f = x - i
  return arr[i] + (arr[i + 1] - arr[i]) * f
}

function glyphWidth(ch: string) {
  if ('יוןר!'.includes(ch)) return ch === '!' ? 0.26 : ch === 'ר' ? 0.44 : 0.27
  return 0.52
}

interface ArcGlyph {
  char: string
  /** distance from the arc box's right edge */
  right: number
  top: number
  width: number
  height: number
  fontSize: number
  rotate: number
  weight: number
  moveFraction: number
  sway: number
}

function buildArc(word: string): ArcGlyph[] {
  const chars = Array.from(word)
  const n = chars.length
  const raw = chars.map((char, i) => {
    const t = n === 1 ? 0 : i / (n - 1)
    const fontSize = sample(REF_SIZE, t)
    return { char, t, fontSize, width: fontSize * glyphWidth(char) }
  })
  const total = raw.reduce((s, g) => s + g.width, 0)
  const k = Math.min(1, (ARC_W - 20) / total)
  let x = 0
  return raw.map((g, i) => {
    const fontSize = g.fontSize * k
    const width = g.width * k
    const height = fontSize * 1.2
    const right = x
    x += width
    const bottom = sample(REF_BOTTOM, g.t)
    return {
      char: g.char,
      right,
      top: bottom - height,
      width,
      height,
      fontSize,
      rotate: -sample(REF_ROTATE, g.t),
      weight: Math.round(sample(REF_WEIGHT, g.t)),
      moveFraction: i === 0 ? 0.15 : 1,
      sway: i === 0 ? 9 : 0,
    }
  })
}

const arcGlyphs = buildArc(ARC_WORD)

const PEAK_SCALE_MIN = 0.65
const PEAK_SCALE_MAX = 1.6

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function ArcLetter({ g, index, count, t, arcInView }: { g: ArcGlyph; index: number; count: number; t: MotionValue<number>; arcInView: boolean }) {
  const topMirroredFull = ARC_H - g.top - g.height
  const topMirrored = g.top + (topMirroredFull - g.top) * g.moveFraction
  const top = useTransform(t, [0, 1], [g.top, topMirrored])
  const rotateTarget = g.rotate + (-g.rotate - g.rotate) * g.moveFraction
  const rotate = useTransform(t, [0, 1], [g.rotate, rotateTarget])
  const sway = useTransform(t, [0, 0.5, 1], [0, g.sway, 0])
  const peakScale = lerp(PEAK_SCALE_MIN, PEAK_SCALE_MAX, index / Math.max(1, count - 1))
  const scale = useTransform(t, [0, 1], [1, peakScale])

  return (
    <motion.div
      className="absolute"
      style={{ right: g.right, top, width: g.width, height: g.height, rotate, scale, transformOrigin: 'top right' }}
    >
      <motion.div style={{ height: '100%', clipPath: 'inset(0 -60% 0 -60%)', rotate: sway, transformOrigin: 'top center' }}>
        <motion.span
          className="block text-center font-noi text-ink"
          style={{ fontSize: g.fontSize, lineHeight: `${g.height}px`, fontWeight: g.weight }}
          initial={{ y: '100%', opacity: 0 }}
          animate={arcInView ? { y: '0%', opacity: 1 } : undefined}
          transition={{ duration: 0.42, delay: index * 0.05, ease: 'easeOut' }}
        >
          {g.char}
        </motion.span>
      </motion.div>
    </motion.div>
  )
}

// Dots live in arc-box coordinates; `anchor` makes a dot ride along with that glyph.
const arcDots = [
  { right: 1290, top: 806, size: 72, anchor: null as number | null, moveFraction: 0.5 },
  { right: 470, top: 820, size: 53.33, anchor: 4, moveFraction: 1 },
  { right: 70, top: 520, size: 35, anchor: 6, moveFraction: 1 },
]

function ArcDot({ dot, t }: { dot: (typeof arcDots)[number]; t: MotionValue<number> }) {
  const anchor = dot.anchor === null ? null : arcGlyphs[Math.min(dot.anchor, arcGlyphs.length - 1)]
  const refTop = anchor ? anchor.top : dot.top
  const refHeight = anchor ? anchor.height : dot.size
  const refMirrored = ARC_H - refTop - refHeight
  const delta = (refMirrored - refTop) * dot.moveFraction
  const top = useTransform(t, [0, 1], [dot.top, dot.top + delta])
  const peakScale = lerp(PEAK_SCALE_MIN, PEAK_SCALE_MAX, dot.right / ARC_W)
  const scale = useTransform(t, [0, 1], [1, peakScale])
  return <motion.div className="absolute rounded-full bg-claret" style={{ right: dot.right, top, width: dot.size, height: dot.size, scale }} />
}

function Arc({ boxRef, inView, t }: { boxRef: React.RefObject<HTMLDivElement | null>; inView: boolean; t: MotionValue<number> }) {
  return (
    <div ref={boxRef} className="absolute inset-0" aria-label={ARC_WORD} role="img">
      {arcDots.map((d, i) => (
        <ArcDot key={i} dot={d} t={t} />
      ))}
      {arcGlyphs.map((g, i) => (
        <ArcLetter key={i} g={g} index={i} count={arcGlyphs.length} t={t} arcInView={inView} />
      ))}
    </div>
  )
}

function Asterisk({ style, className }: { style?: React.CSSProperties; className?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 46 52"
      className={className}
      style={style}
      initial={{ opacity: 0, rotate: 0 }}
      animate={inView ? { opacity: 1, rotate: 540 } : undefined}
      transition={{ opacity: { duration: 1.2, ease: 'easeOut' }, rotate: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] } }}
      aria-hidden="true"
    >
      <path d="M23 2v48M4 13l38 26M42 13 4 39" stroke="#e0442f" strokeWidth="5" strokeLinecap="round" />
    </motion.svg>
  )
}

function useArc() {
  const arcRef = useRef<HTMLDivElement>(null)
  const arcInView = useInView(arcRef, { once: true, amount: 0.4 })
  const arcScrollProgress = useScrollCrossProgress(arcRef, 0.35)
  const arcBendT = useTransform(arcScrollProgress, [0, 0.5, 1], [0, 0.85, 0])
  return { arcRef, arcInView, arcBendT }
}

function MobileStory() {
  const stripesRef = useRef<HTMLDivElement>(null)
  const stripesInView = useInView(stripesRef, { once: true, amount: 0.2 })
  const arcFit = useFitScale(ARC_W + 120)
  const { arcRef, arcInView, arcBendT } = useArc()

  return (
    <section id="loop" className="relative w-full bg-ink">
      <div ref={stripesRef} className="relative h-[120px]">
        {stripes.map((s, i) => (
          <motion.div
            key={i}
            className="absolute inset-x-0"
            style={{ top: (s.top / 338) * 120, height: (s.height / 338) * 120 + 1, transformOrigin: 'top', background: PAPER }}
            initial={{ scaleY: 0 }}
            animate={stripesInView ? { scaleY: 1 } : undefined}
            transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
          />
        ))}
      </div>
      <div className="px-5 pb-6 pt-8 text-ink" style={{ background: PAPER }}>
        <h2>
          {headlineLines.map((l, i) => (
            <AnimatedLines
              key={l.text}
              text={l.text}
              className="font-display text-[11vw] leading-[1.02] text-ink"
              baseDelay={i * 0.06}
              targetOpacity={l.opacity ?? 1}
              style={{ paddingInlineStart: i % 2 === 1 ? '10vw' : 0 }}
            />
          ))}
        </h2>
        <Asterisk className="mt-6 h-[34px] w-[30px]" />
        <div className="mt-6 space-y-4">
          {paragraphs.map((p) => (
            <AnimatedLines key={p} text={p} className="font-sans text-[18px] leading-[1.5] text-ink/80" />
          ))}
        </div>
      </div>

      <LoopStage mobile />

      <div className="overflow-x-clip px-5 pb-12 pt-4" style={{ background: PAPER }}>
        <div ref={arcFit.ref} className="relative mx-auto w-full max-w-[620px]" style={{ aspectRatio: `${ARC_W + 120} / ${ARC_H + 80}` }}>
          <div
            className="absolute"
            style={{ right: 0, top: 0, width: ARC_W + 120, height: ARC_H + 80, transform: `scale(${arcFit.scale})`, transformOrigin: 'top right' }}
          >
            <div className="absolute" style={{ right: 60, top: 40, width: ARC_W, height: ARC_H }}>
              <Arc boxRef={arcRef} inView={arcInView} t={arcBendT} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StoryTop() {
  const fit = useFitScale(DESIGN_WIDTH)
  const stripesRef = useRef<HTMLDivElement>(null)
  const stripesInView = useInView(stripesRef, { once: true, amount: 0.2 })
  return (
    <div ref={fit.ref} className="relative w-full overflow-x-clip" style={{ aspectRatio: `${DESIGN_WIDTH} / ${TOP_H}` }}>
      <div
        className="isolate"
        style={{ position: 'absolute', left: 0, top: 0, width: DESIGN_WIDTH, height: TOP_H, transform: `scale(${fit.scale})`, transformOrigin: 'top left' }}
      >
        <div ref={stripesRef} className="absolute left-0 top-0" style={{ width: 1920, height: 332 }}>
          {stripes.map((s, i) => (
            <motion.div
              key={i}
              className="absolute left-0"
              style={{ top: s.top, width: 1920, height: s.height, transformOrigin: 'top', background: PAPER }}
              initial={{ scaleY: 0 }}
              animate={stripesInView ? { scaleY: 1 } : undefined}
              transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            />
          ))}
        </div>

        <div className="absolute left-0 top-[332px] h-[1128px] w-[1920px]" style={{ background: PAPER }} />

        <h2 className="absolute left-0 top-0 h-full w-full">
          {headlineLines.map((line, i) => (
            <div key={line.text} className="absolute" style={{ right: line.right, top: line.top, height: 108 }}>
              <AnimatedLines
                text={line.text}
                className="font-display text-[112px] leading-[106px] tracking-[-0.8px] text-ink"
                baseDelay={i * 0.07}
                targetOpacity={line.opacity ?? 1}
                forceSingleLine
              />
            </div>
          ))}
        </h2>

        <Asterisk className="absolute" style={{ left: 330, top: 890, width: 45.33, height: 52 }} />

        <div className="absolute" style={{ right: 45, top: 1110, width: 220 }}>
          <AnimatedLines text="לא חסר לך ידע" className="font-display text-[32px] font-light leading-[38px] text-ink" />
        </div>

        {paragraphs.map((p, i) => (
          <div key={p} className="absolute" style={{ right: 782, top: 1110 + i * 150, width: 730 }}>
            <AnimatedLines text={p} className="font-sans text-[25px] leading-[36px] text-ink opacity-80" firstLineIndent={i === 0 ? 300 : 0} />
          </div>
        ))}
      </div>
    </div>
  )
}

function StoryArc() {
  const fit = useFitScale(DESIGN_WIDTH)
  const { arcRef, arcInView, arcBendT } = useArc()
  return (
    <div ref={fit.ref} className="relative w-full overflow-x-clip" style={{ aspectRatio: `${DESIGN_WIDTH} / ${ARC_BLOCK_H}`, background: PAPER }}>
      <div
        className="isolate"
        style={{ position: 'absolute', left: 0, top: 0, width: DESIGN_WIDTH, height: ARC_BLOCK_H, transform: `scale(${fit.scale})`, transformOrigin: 'top left' }}
      >
        <div className="absolute" style={{ right: 260, top: 60, width: ARC_W, height: ARC_H }}>
          <Arc boxRef={arcRef} inView={arcInView} t={arcBendT} />
        </div>
      </div>
    </div>
  )
}

function Story() {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileStory />
  // No overflow on the section itself: it would turn it into a scroll container and break the pinned loop stage.
  return (
    <section id="loop" className="relative w-full bg-ink">
      <StoryTop />
      <LoopStage mobile={false} />
      <StoryArc />
    </section>
  )
}

export default Story
