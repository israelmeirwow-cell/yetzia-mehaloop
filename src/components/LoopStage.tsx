import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  backOut,
  cubicBezier,
  easeIn,
  easeInOut,
  motion,
  transform as tmap,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import useFitScale from '../hooks/useFitScale'
import AnimatedLines from './AnimatedLines'
import { clamp, loopCanon, loopGeometry, type LoopCanon, type LoopGeometry, type LoopShape } from '../lib/loop'

/* ------------------------------------------------------------------
   "ככה נראה הלופ." One giant loop on the paper. The thoughts sit on
   the line; a red dot (your idea) laps three times, faster each lap,
   lighting each thought as it passes; then it finally takes the exit
   that was there all along. Desktop is scroll-driven (pinned);
   phones play the same timeline once, in place, so the page stays short.
   ------------------------------------------------------------------ */

const PAPER = '#d6d2c8'
const lin = (t: number) => t
const INK = (a: number) => `rgba(14,13,12,${a.toFixed(3)})`
const STAGE_W = 1920
const STAGE_H = 1080

const THOUGHTS = [
  { quote: 'רגע, זה רעיון מעולה!', tag: 'רעיון חדש' },
  { quote: 'כבר יש לי שם ולוגו!', tag: 'התלהבות' },
  { quote: 'רק עוד קורס אחד, ואז.', tag: 'עוד קורס' },
  { quote: 'ממחר. הפעם ברצינות.', tag: 'ממחר' },
  { quote: 'רגע. יש לי רעיון אחר.', tag: 'רעיון אחר' },
]
const MONTHS = ['ינואר', 'אפריל', 'ספטמבר']
const SUB = 'אותן מחשבות. רק התאריך מתחלף.'
const EXIT_LINE = 'ואפשר לצאת ממנו'

/* timeline: everything below is a pure function of progress p (0..1) */
const TL = { inStart: 0.02, laps: [0.1, 0.44, 0.62, 0.76], exit: [0.8, 0.92] }
const lapsAt = tmap(TL.laps, [0, 1, 2, 3], { ease: [easeIn, lin, lin] })
const inAt = tmap([TL.inStart, TL.laps[0]], [0, 1], { ease: easeInOut })
const exitAt = tmap(TL.exit, [0, 1], { ease: easeInOut })
const driftAt = tmap([TL.laps[0], TL.exit[1]], [0, 0.08])
const idleDesk = tmap([0.02, 0.1], [1, 0.5])
const idleMob = tmap([0.02, 0.1], [1, 0.6])
const strikeAt = tmap([0.8, 0.86], [0, 1])
const slotOf = (i: number, v: number) => (i + 1) / 6 + driftAt(v)
const LEAD = 0.035
const TAIL = 0.3

function litAt(laps: number, s: number) {
  if (laps < s - LEAD) return 0
  const past = (((laps - s) % 1) + 1) % 1
  return past > 1 - LEAD ? (past - (1 - LEAD)) / LEAD : Math.max(0, 1 - past / TAIL)
}
function pulseAt(v: number) {
  const L = lapsAt(v)
  return L < 0.5 ? 0 : Math.max(0, 1 - Math.abs(L - Math.round(L)) / 0.04) * (1 - exitAt(v))
}
function routeAt(g: LoopGeometry, v: number) {
  const e = exitAt(v)
  if (e > 0) return g.exit.at(e, false)
  return v < TL.laps[0] ? g.entry.at(inAt(v), false) : g.loop.at(lapsAt(v))
}
const monthAt = (v: number) => Math.min(2, Math.floor(lapsAt(v)))
/** -1 intro, 0..4 thought, 5 "ושוב מההתחלה.", 6 exit line */
function captionAt(v: number) {
  if (exitAt(v) >= 0.35) return 6
  if (v >= TL.laps[3]) return 5
  const L = lapsAt(v)
  let best = -1
  let bestD = 2
  for (let i = 0; i < 5; i++) {
    const s = slotOf(i, v)
    if (L < s - LEAD) continue
    const past = (((L - s) % 1) + 1) % 1
    const d = past > 1 - LEAD ? 0 : past
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/* geometry: lazy module caches, never computed per render */
const DESK_SHAPE: LoopShape = { W: 1920, y0: 940, b: 395, D: 780, sx: 2.05, cx: 960, tail: 420 }
const MOB_SHAPE: LoopShape = { W: 750, y0: 1150, b: 372, D: 430, sx: 0.98, cx: 375, tail: 300 }
let deskG: LoopGeometry | null = null
let mobCanon: LoopCanon | null = null
const getDeskG = () =>
  (deskG ??= loopGeometry(
    loopCanon(DESK_SHAPE, [
      [5, -12, 0.03],
      [-6, 10, -0.02],
      [9, 4, 0.05],
    ]),
    { startX: 1770, stopX: 300 },
  ))
function mobileGeometry(W: number, H: number) {
  const k = (mobCanon ??= loopCanon(MOB_SHAPE, [
    [5, -10, 0.03],
    [-6, 8, -0.02],
    [9, 4, 0.05],
  ]))
  const { x0, x1, top } = k.box
  const BASE = H - 40
  return loopGeometry(k, {
    startX: W - 20,
    stopX: 24,
    map: ([x, y]) => [52 + ((x - x0) * (W - 104)) / (x1 - x0), 22 + ((y - top) * (BASE - 22)) / (MOB_SHAPE.y0 - top)],
  })
}

/* hooks */
function useScrollTimeline(wrap: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress: enter } = useScroll({ target: wrap, offset: ['start end', 'start start'] })
  const { scrollYProgress: raw } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  const p = useSpring(raw, { stiffness: 220, damping: 40, mass: 0.5, restDelta: 1e-4 })
  useEffect(() => {
    // A reload mid-pin should land on the right frame, not spin up to it.
    const id = requestAnimationFrame(() => p.jump(raw.get()))
    return () => cancelAnimationFrame(id)
  }, [p, raw])
  const draw = useTransform(enter, [0.4, 1], [0, 1], { ease: cubicBezier(0.65, 0, 0.35, 1) })
  return { p, draw }
}

/** Phones: the same timeline, played once by time when the stage is on screen (no pin). */
function usePlayedTimeline(target: React.RefObject<HTMLElement | null>) {
  const p = useMotionValue(0)
  const draw = useMotionValue(0)
  const inView = useInView(target, { once: true, amount: 0.55 })
  useEffect(() => {
    if (!inView) return
    const a = animate(draw, 1, { duration: 1.4, ease: [0.65, 0, 0.35, 1] })
    // Lap 1 is slow enough to read each thought; laps 2 and 3 speed up, then the exit.
    const b = animate(p, [0, 0.1, 0.44, 0.62, 0.76, 0.8, 0.92, 1], {
      duration: 11,
      delay: 1.2,
      times: [0, 0.05, 0.55, 0.67, 0.76, 0.8, 0.93, 1],
      ease: 'linear',
    })
    return () => {
      a.stop()
      b.stop()
    }
  }, [inView, p, draw])
  return { p, draw }
}

function useDiscrete<T>(mv: MotionValue<number>, f: (v: number) => T): T {
  const [val, setVal] = useState(() => f(mv.get()))
  const ref = useRef(val)
  useMotionValueEvent(mv, 'change', (v) => {
    const n = f(v)
    if (n !== ref.current) {
      ref.current = n
      setVal(n)
    }
  })
  return val
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/* shared pieces (each needs its own hooks, so each is a component) */
function Groove({ d, j, p, w }: { d: string; j: number; p: MotionValue<number>; w: number }) {
  const opacity = useTransform(p, (v) => 0.16 * clamp((lapsAt(v) - j + 0.12) / 0.12, 0, 1))
  return <motion.path d={d} stroke="#0e0d0c" strokeWidth={w} style={{ opacity }} />
}

function TallyStroke({ j, x, y, h, w, p }: { j: number; x: number; y: number; h: number; w: number; p: MotionValue<number> }) {
  const len = useTransform(p, (v) => clamp((lapsAt(v) - j + 0.05) / 0.05, 0, 1))
  const on = useTransform(len, (l) => (l > 0.002 ? 1 : 0)) // a round cap would show a dot at length 0
  return <motion.path d={`M${x} ${y}V${y + h}`} stroke="#0e0d0c" strokeWidth={w} strokeLinecap="round" style={{ pathLength: len, opacity: on }} />
}

interface Look {
  W: number
  H: number
  stroke: number
  groove: number
  dash: string
  red: number
  ring: number
  tx: number[]
  ty: number
  th: number
  tw: number
  strike: number[]
  sw: number
}

const DESK_LOOK: Look = { W: 1920, H: 1080, stroke: 2.4, groove: 1.4, dash: '2 12', red: 2.8, ring: 14, tx: [934, 960, 986], ty: 692, th: 52, tw: 2.8, strike: [1009, 704, 911, 734], sw: 3.4 }

function LoopLines({ g, p, draw, look }: { g: LoopGeometry; p: MotionValue<number>; draw: MotionValue<number>; look: Look }) {
  const mainOn = useTransform(draw, (d) => (d > 0.002 ? 1 : 0))
  const dash = useTransform([draw, p], ([d, v]: number[]) => clamp((d - 0.9) / 0.1, 0, 1) * (0.35 + 0.4 * pulseAt(v)))
  const red = useTransform(p, exitAt)
  const redOn = useTransform(red, (e) => (e > 0.002 ? 1 : 0))
  const ring = useTransform([draw, p], ([d, v]: number[]) => backOut(clamp((d - 0.94) / 0.06, 0, 1)) * (1 + 0.5 * pulseAt(v)))
  const strike = useTransform(p, strikeAt)
  const strikeOn = useTransform(strike, (s) => (s > 0.002 ? 1 : 0))
  const [a, b, c, d] = look.strike
  return (
    <svg aria-hidden="true" className="absolute left-0 top-0 overflow-visible" width={look.W} height={look.H} viewBox={`0 0 ${look.W} ${look.H}`} fill="none">
      {g.dGhosts.map((gd, j) => (
        <Groove key={j} d={gd} j={j + 1} p={p} w={look.groove} />
      ))}
      <motion.path d={g.dMain} stroke="#0e0d0c" strokeWidth={look.stroke} strokeLinecap="round" style={{ pathLength: draw, opacity: mainOn }} />
      <motion.path d={g.dExit} stroke="#0e0d0c" strokeWidth={look.stroke} strokeLinecap="round" strokeDasharray={look.dash} style={{ opacity: dash }} />
      <motion.path d={g.dRed} stroke="#e0442f" strokeWidth={look.red} strokeLinecap="round" style={{ pathLength: red, opacity: redOn }} />
      <motion.circle cx={g.C.x} cy={g.C.y} r={look.ring} stroke="#e0442f" strokeWidth={look.stroke} style={{ scale: ring, transformBox: 'fill-box', transformOrigin: 'center' }} />
      {[1, 2, 3].map((j) => (
        <TallyStroke key={j} j={j} x={look.tx[j - 1]} y={look.ty} h={look.th} w={look.tw} p={p} />
      ))}
      <motion.path d={`M${a} ${b}L${c} ${d}`} stroke="#e0442f" strokeWidth={look.sw} strokeLinecap="round" style={{ pathLength: strike, opacity: strikeOn }} />
    </svg>
  )
}

function IdeaDot({ g, p, draw, size }: { g: LoopGeometry; p: MotionValue<number>; draw: MotionValue<number>; size: number }) {
  const transform = useTransform(p, (v) => {
    const q = routeAt(g, v)
    return `translate3d(${q.x}px, ${q.y}px, 0)`
  })
  const pop = useTransform(draw, [0.12, 0.18], [0, 1], { ease: backOut })
  return (
    <motion.div aria-hidden className="absolute left-0 top-0 z-[2] will-change-transform" style={{ transform }}>
      <motion.span className="block -translate-x-1/2 -translate-y-1/2 rounded-full bg-claret" style={{ width: size, height: size, scale: pop }} />
    </motion.div>
  )
}

function Thought({ g, i, p, draw, desk, still }: { g: LoopGeometry; i: number; p: MotionValue<number>; draw: MotionValue<number>; desk: boolean; still?: boolean }) {
  const born0 = g.inLen + ((i + 1) / 6) * g.loopLen
  const transform = useTransform(p, (v) => {
    const q = g.loop.at(slotOf(i, v))
    const h = 1 - (q.y - g.top) / (g.bottom - g.top)
    return `translate3d(${q.x}px, ${q.y}px, 0) scale(${desk ? 0.88 + 0.12 * h : 1})`
  })
  // Fade the text colour, never the element, so the paper knock-out keeps hiding the line behind it.
  const color = useTransform([p, draw], ([v, d]: number[]) => {
    if (still) return INK(1)
    const born = clamp((d * g.mainLen - born0 + 40) / 80, 0, 1)
    const idle = (desk ? idleDesk : idleMob)(v)
    return INK(born * (idle + (1 - idle) * litAt(lapsAt(v), slotOf(i, v))) * (1 - 0.5 * exitAt(v)))
  })
  const strike = useTransform(p, strikeAt)
  const t = THOUGHTS[i]
  const bar = (h: number) => (
    <motion.span aria-hidden className="absolute left-[-4%] right-[-4%] top-[52%] origin-right rounded-full bg-claret" style={{ height: h, scaleX: strike, rotate: -2 }} />
  )
  return (
    <motion.div aria-hidden className="absolute left-0 top-0 z-[3] will-change-transform" style={{ transform }}>
      <motion.span
        dir="rtl"
        className="block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display"
        style={{ color, background: PAPER, ...(desk ? { fontSize: 46, lineHeight: 1.15, padding: '8px 17px' } : { fontSize: 18, lineHeight: 1.1, padding: '2px 6px' }) }}
      >
        {desk ? (
          i === 3 ? (
            <>
              ממחר. הפעם <span className="relative inline-block">ברצינות.{bar(3)}</span>
            </>
          ) : (
            t.quote
          )
        ) : i === 3 ? (
          <span className="relative inline-block">
            {t.tag}
            {bar(2)}
          </span>
        ) : (
          t.tag
        )}
      </motion.span>
    </motion.div>
  )
}

function MonthWord({ p, className, style }: { p: MotionValue<number>; className: string; style: React.CSSProperties }) {
  const month = useDiscrete(p, monthAt)
  return (
    <div aria-hidden className="absolute overflow-hidden" style={style}>
      <AnimatePresence initial={false}>
        <motion.span
          key={month}
          className={`absolute inset-x-0 block text-center font-display font-light ${className}`}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {MONTHS[month]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function LoopSrList() {
  return (
    <ol className="sr-only" aria-label="מה עובר בראש בתוך הלופ">
      {THOUGHTS.map((t) => (
        <li key={t.quote}>{t.quote}</li>
      ))}
      <li>{EXIT_LINE}</li>
    </ol>
  )
}

/* desktop */
function DeskBoard({ p, draw, still }: { p: MotionValue<number>; draw: MotionValue<number>; still?: boolean }) {
  const g = getDeskG()
  const nowOp = useTransform(draw, [0.02, 0.1], [0, 1])
  const startCap = useTransform([draw, p], ([d, v]: number[]) => (still ? 0 : clamp((d - 0.12) / 0.06, 0, 1) * (1 - clamp((v - 0.02) / 0.03, 0, 1))))
  const ringOp = useTransform([draw, p], ([d, v]: number[]) => clamp((d - 0.95) / 0.05, 0, 1) * (still ? 1 : 1 - 0.5 * clamp((exitAt(v) - 0.4) / 0.6, 0, 1)))
  const pulse = useTransform(p, pulseAt)
  const exitWord = useTransform(pulse, [0, 1], ['rgba(14,13,12,0.55)', '#e0442f'])
  const exitY = useTransform(p, (v) => `${(1 - clamp((exitAt(v) - 0.7) / 0.3, 0, 1)) * 135}%`) // past the mask padding, so no ascender peeks out early
  return (
    <>
      <LoopLines g={g} p={p} draw={draw} look={DESK_LOOK} />
      <h3 className="absolute left-0 top-[318px] z-[1] w-[1920px] text-center font-display text-[120px] leading-[114px] text-ink">
        <AnimatedLines text="ככה נראה" forceSingleLine className="flex justify-center" />
        <AnimatedLines text="הלופ." forceSingleLine baseDelay={0.08} className="flex justify-center font-light text-claret" />
      </h3>
      <div className="absolute left-0 top-[560px] z-[1] w-[1920px] text-center">
        <AnimatedLines text={SUB} forceSingleLine className="flex justify-center font-sans text-[26px] leading-[36px] text-ink/80" />
      </div>
      <MonthWord p={p} className="text-[46px] leading-[56px] text-ink/75" style={{ left: 0, top: 618, width: 1920, height: 56, zIndex: 1 }} />
      <motion.div aria-hidden className="absolute left-0 top-[964px] z-[1] w-[1920px] text-center font-sans-tight text-[20px] font-medium leading-[26px]" style={{ opacity: ringOp }}>
        <div className="text-claret-deep">נקודת ההתחלה</div>
        <motion.div style={{ color: exitWord }}>וגם היציאה</motion.div>
      </motion.div>
      <motion.span
        aria-hidden
        className="absolute top-[892px] z-[1] -translate-x-1/2 whitespace-nowrap font-sans-tight text-[18px] font-medium tracking-[0.02em] text-ink/60"
        style={{ left: 1770, opacity: nowOp }}
      >
        המצב היום
      </motion.span>
      <motion.span aria-hidden className="absolute top-[960px] z-[1] -translate-x-1/2 whitespace-nowrap font-sans-tight text-[22px] font-semibold text-claret" style={{ left: 1770, opacity: startCap }}>
        הרעיון שלך
      </motion.span>
      <div aria-hidden className="absolute top-[966px] z-[1] -mb-[0.3em] -translate-x-1/2 overflow-hidden pb-[0.3em]" style={{ left: 300 }}>
        <motion.span className="block whitespace-nowrap font-display text-[46px] leading-none text-claret" style={{ y: still ? '0%' : exitY }}>
          {EXIT_LINE}
        </motion.span>
      </div>
      <IdeaDot g={g} p={p} draw={draw} size={22} />
      {THOUGHTS.map((_, i) => (
        <Thought key={i} g={g} i={i} p={p} draw={draw} desk still={still} />
      ))}
    </>
  )
}

function LoopStageDesktop() {
  const wrap = useRef<HTMLDivElement>(null)
  const fit = useFitScale(STAGE_W)
  const { p, draw } = useScrollTimeline(wrap)
  const { width: cw, height: ch } = fit.containerSize
  // Fit the 1920 × 1080 board under the fixed header.
  const hdr = (68 * cw) / 1920
  const s = ch > 0 ? Math.min(cw / STAGE_W, (ch - hdr) / STAGE_H) : cw / STAGE_W
  const ox = (cw - STAGE_W * s) / 2
  const oy = ch > 0 ? hdr + (ch - hdr - STAGE_H * s) / 2 : hdr
  return (
    <div ref={wrap} className="relative h-[260vh]" style={{ background: PAPER }}>
      <div ref={fit.ref} className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: PAPER }}>
        <div className="isolate absolute left-0 top-0" style={{ width: STAGE_W, height: STAGE_H, transform: `translate(${ox}px, ${oy}px) scale(${s})`, transformOrigin: 'top left' }}>
          <DeskBoard p={p} draw={draw} />
        </div>
      </div>
      <LoopSrList />
    </div>
  )
}

function LoopStageStatic() {
  const fit = useFitScale(STAGE_W)
  const p = useMotionValue(0.95)
  const draw = useMotionValue(1)
  return (
    <div ref={fit.ref} className="relative w-full overflow-x-clip" style={{ aspectRatio: '1920 / 1080', background: PAPER }}>
      <div className="isolate absolute left-0 top-0" style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${fit.scale})`, transformOrigin: 'top left' }}>
        <DeskBoard p={p} draw={draw} still />
      </div>
      <LoopSrList />
    </div>
  )
}

/* phone */
function MobileBoard({ g, W, H, p, draw, short, still }: { g: LoopGeometry; W: number; H: number; p: MotionValue<number>; draw: MotionValue<number>; short: boolean; still?: boolean }) {
  const monthTop = g.top + 0.4 * (g.bottom - g.top)
  const tallyTop = short ? g.top + 0.45 * (g.bottom - g.top) : monthTop + 36
  const look: Look = {
    W,
    H,
    stroke: 1.6,
    groove: 1,
    dash: '2 8',
    red: 2,
    ring: 9,
    tx: [W / 2 - 12, W / 2, W / 2 + 12],
    ty: tallyTop,
    th: 26,
    tw: 2,
    strike: [W / 2 + 22, tallyTop + 6, W / 2 - 22, tallyTop + 20],
    sw: 2.4,
  }
  const ringOp = useTransform(draw, [0.95, 1], [0, 1])
  const pulse = useTransform(p, pulseAt)
  const exitWord = useTransform(pulse, [0, 1], ['rgba(14,13,12,0.55)', '#e0442f'])
  return (
    <>
      <LoopLines g={g} p={p} draw={draw} look={look} />
      {!short && <MonthWord p={p} className="text-[26px] leading-[30px] text-ink/75" style={{ left: 0, top: monthTop, width: W, height: 30, zIndex: 1 }} />}
      <motion.div aria-hidden className="absolute left-0 z-[1] w-full text-center font-sans-tight text-[16px] font-medium leading-[20px]" style={{ top: H - 32, opacity: still ? 1 : ringOp }}>
        <span className="text-claret-deep">נקודת ההתחלה</span>
        <motion.span style={{ color: exitWord }}> · וגם היציאה</motion.span>
      </motion.div>
      <IdeaDot g={g} p={p} draw={draw} size={14} />
      {THOUGHTS.map((_, i) => (
        <Thought key={i} g={g} i={i} p={p} draw={draw} desk={false} still={still} />
      ))}
    </>
  )
}

function useMobileGeometry() {
  const box = useFitScale(375) // only containerSize is read
  const W = Math.round(box.containerSize.width)
  const H = Math.round(box.containerSize.height)
  const g = useMemo(() => (W > 0 && H > 0 ? mobileGeometry(W, H) : null), [W, H])
  return { ref: box.ref, W, H, g }
}

function Caption({ p }: { p: MotionValue<number> }) {
  const cap = useDiscrete(p, captionAt)
  return (
    <div aria-hidden className="relative mx-auto min-h-[64px] w-full max-w-[560px] flex-none px-4 pb-4 pt-2">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.p
          key={cap}
          className={`font-display leading-[1.2] ${cap === 6 ? 'text-[28px] text-claret' : 'text-[24px] text-ink'}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {cap === -1 ? (
            <>
              <span className="text-claret">הרעיון שלך</span> יוצא לסיבוב.
            </>
          ) : cap <= 4 ? (
            THOUGHTS[cap].quote
          ) : cap === 5 ? (
            'ושוב מההתחלה.'
          ) : (
            EXIT_LINE
          )}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

function MobileTitle() {
  return (
    <div className="mx-auto w-full max-w-[560px] flex-none px-4 pt-6">
      <h3 className="font-display text-[34px] leading-[1.05] text-ink">
        ככה נראה <span className="font-light text-claret">הלופ.</span>
      </h3>
      <p className="mt-1 font-sans text-[17px] leading-[1.4] text-ink/80">{SUB}</p>
    </div>
  )
}

/** Not pinned: about 0.7 of a phone screen, and the timeline plays once when it is on screen. */
function LoopStageMobile() {
  const stage = useRef<HTMLDivElement>(null)
  const { p, draw } = usePlayedTimeline(stage)
  const box = useMobileGeometry()
  return (
    <div ref={stage} className="relative flex flex-col" style={{ background: PAPER }}>
      <MobileTitle />
      <div ref={box.ref} className="relative mx-auto h-[400px] w-full max-w-[560px] overflow-hidden">
        {box.g && <MobileBoard g={box.g} W={box.W} H={box.H} p={p} draw={draw} short={false} />}
      </div>
      <Caption p={p} />
      <LoopSrList />
    </div>
  )
}

function LoopStageMobileStatic() {
  const p = useMotionValue(0.95)
  const draw = useMotionValue(1)
  const box = useMobileGeometry()
  return (
    <div className="relative flex flex-col pb-8" style={{ background: PAPER }}>
      <MobileTitle />
      <div ref={box.ref} className="relative mx-auto h-[400px] w-full max-w-[560px] overflow-hidden">
        {box.g && <MobileBoard g={box.g} W={box.W} H={box.H} p={p} draw={draw} short={false} still />}
      </div>
      <ol className="mx-auto w-full max-w-[560px] space-y-2 px-4 font-display text-[22px] leading-[1.35] text-ink">
        {THOUGHTS.map((t) => (
          <li key={t.quote}>{t.quote}</li>
        ))}
      </ol>
      <p className="mx-auto mt-4 w-full max-w-[560px] px-4 font-display text-[26px] text-claret">{EXIT_LINE}</p>
    </div>
  )
}

export function LoopStage({ mobile }: { mobile: boolean }) {
  const reduce = useReducedMotion()
  const shortLandscape = useMedia('(max-height: 500px)')
  if (mobile) return reduce || shortLandscape ? <LoopStageMobileStatic /> : <LoopStageMobile />
  return reduce ? <LoopStageStatic /> : <LoopStageDesktop />
}
