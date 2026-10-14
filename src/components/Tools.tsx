import { useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { AnimatePresence, motion, useAnimate, useInView } from 'motion/react'
import useFitScale from '../hooks/useFitScale'
import useIsMobile from '../hooks/useIsMobile'
import AnimatedLines from './AnimatedLines'
import LoopLine from './LoopLine'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1131

const CARD_RIGHT = 975
const CARD_TOP = 150
const CARD_W = 547
const CARD_H = 813

const FACE_COUNT = 4
const FACE_ANGLE = 360 / FACE_COUNT
const PRISM_RADIUS = CARD_W / 2 / Math.tan(Math.PI / FACE_COUNT)

const AVATAR_RIGHT = 1813.33
const AVATAR_TOP = 164.33
const AVATAR_STEP = 77.33
const AVATAR_SIZE = 64

const BUTTONS_RIGHT = 1749.33
const BUTTONS_TOP = 923
const BUTTON_SIZE = 56
const BUTTON_GAP = 16

const CAPTION_POSITIONS = [
  { right: 762, top: 560, width: 207 },
  { right: 690, top: 640, width: 190 },
  { right: 762, top: 720, width: 190 },
]

const HEADING = 'הכלים שעוזרים לך לשבור את התקרה'

interface Tool {
  name: string
  short: string
  subtitle: string
  text: string
  points: [string, string, string]
  color: string
}

const tools: Tool[] = [
  {
    name: 'CBT',
    short: 'C',
    subtitle: 'לזהות את המחשבות שעוצרות אותך',
    text: 'גישה שבודקת את הקשר בין מחשבה, רגש ופעולה. נזהה מחשבות כמו "עוד לא הגעתי לרמה" ונחליף אותן במחשבות מדויקות יותר, כאלה שמאפשרות לפעול.',
    points: ['לזהות את המחשבה שעוצרת', 'לבדוק אם היא בכלל נכונה', 'ולהחליף אותה במחשבה שמזיזה'],
    color: '#a8321f',
  },
  {
    name: 'NLP',
    short: 'N',
    subtitle: 'לשנות את הדיבור הפנימי',
    text: 'הסיפור שמספרים לעצמנו משפיע על מה שעושים בפועל. נלמד למסגר מחדש את הפחדים ולבנות ביטחון לפעולה.',
    points: ['לשים לב לסיפור הפנימי', 'למסגר מחדש את הפחד', 'ולבנות ביטחון לפעולה'],
    color: '#3f4a3a',
  },
  {
    name: 'SMART',
    short: 'S',
    subtitle: 'להפוך חלום למטרה שאפשר לבצע',
    text: 'במקום "אני רוצה עסק", נגיע ל"עד סוף החודש: 5 שיחות עם לקוחות פוטנציאליים". ככה בכל שבוע ברור מה עושים.',
    points: ['מ״אני רוצה עסק״', 'ל״עד סוף החודש, 5 שיחות״', 'ובכל שבוע ברור מה עושים'],
    color: '#2a2622',
  },
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function ChevronIcon() {
  return (
    <svg width="9" height="17" viewBox="0 0 9 17" fill="none" aria-hidden="true">
      <path d="M8 1L1 8.5L8 16" stroke="#f4efe6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ToolFace({ tool }: { tool: Tool }) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: tool.color }}>
      <LoopLine width={547} height={813} baseline={0.78} amp={0.13} stroke="rgba(244,239,230,0.28)" strokeWidth={2} duration={0} className="absolute inset-0 h-full w-full" />
      <span className="absolute inset-x-0 top-[22%] text-center font-display font-light leading-none text-linen" style={{ fontSize: tool.name.length > 3 ? 150 : 210 }} dir="ltr">
        {tool.name}
      </span>
      <span className="absolute inset-x-[40px] top-[52%] text-center font-display text-[34px] leading-[1.15] text-linen/85">{tool.subtitle}</span>
    </div>
  )
}

function PrismFace({ tool, slot }: { tool: Tool; slot: number }) {
  return (
    <div
      className="absolute overflow-hidden"
      style={{
        left: 0,
        top: 0,
        width: CARD_W,
        height: CARD_H,
        transformOrigin: '50% 50%',
        transform: `rotateY(${slot * FACE_ANGLE}deg) translateZ(${PRISM_RADIUS}px)`,
        backfaceVisibility: 'hidden',
      }}
    >
      <ToolFace tool={tool} />
    </div>
  )
}

function MobileFace({ tool }: { tool: Tool }) {
  const fit = useFitScale(CARD_W)
  return (
    <div ref={fit.ref} className="relative mt-6 aspect-[547/600] overflow-hidden">
      <div className="absolute left-0 top-0" style={{ width: CARD_W, height: CARD_H, transform: `scale(${fit.scale})`, transformOrigin: 'top left' }}>
        <ToolFace tool={tool} />
      </div>
    </div>
  )
}

function MobileTools() {
  const [index, setIndex] = useState(0)
  const tool = tools[index]
  return (
    <section className="relative w-full bg-ink px-5 py-16 text-linen">
      <AnimatedLines text={HEADING} className="font-display text-[11vw] leading-[1.04]" baseDelay={0.08} />
      <div className="mt-8 flex gap-2" role="tablist" aria-label="הכלים">
        {tools.map((t, i) => (
          <button
            key={t.name}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            className={`flex-1 rounded-full border px-3 py-3 font-sans-tight text-[16px] font-semibold transition-colors ${
              i === index ? 'border-claret bg-claret text-linen' : 'border-linen/30 text-linen/80'
            }`}
            dir="ltr"
          >
            {t.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tool.name}
          initial={{ opacity: 0, rotateY: -25 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 25 }}
          transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
          style={{ transformPerspective: 1200 }}
        >
          <MobileFace tool={tool} />
          <p className="mt-6 font-sans-tight text-[22px] leading-[1.35]">{tool.text}</p>
          <ul className="mt-5 space-y-1.5 font-sans-tight text-[16px] font-medium text-linen/65">
            {tool.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

function Tools() {
  const isMobile = useIsMobile()
  const fit = useFitScale(DESIGN_WIDTH)
  const revealRef = useRef<HTMLDivElement>(null)
  const revealInView = useInView(revealRef, { once: true, amount: 0.3 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slotContent, setSlotContent] = useState<number[]>([0, 1, 2, 0])
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const stepRef = useRef(0)

  const tool = tools[currentIndex]
  const counterText = `${pad(currentIndex + 1)} / ${pad(tools.length)}`

  function mod(n: number, m: number) {
    return ((n % m) + m) % m
  }

  async function step(direction: 1 | -1) {
    const v = stepRef.current + direction
    const slot = mod(v, FACE_COUNT)
    const toolForSlot = mod(v, tools.length)
    flushSync(() => {
      setSlotContent((prev) => {
        const next = [...prev]
        next[slot] = toolForSlot
        return next
      })
    })
    stepRef.current = v
    await animate(scope.current, { rotateY: -v * FACE_ANGLE, z: -PRISM_RADIUS }, { duration: 0.5, ease: [0.65, 0, 0.35, 1] })
  }

  async function goTo(targetIndex: number, steps: number) {
    if (isAnimating || steps === 0) return
    setIsAnimating(true)
    const direction = steps > 0 ? 1 : -1
    for (let i = 0; i < Math.abs(steps); i++) {
      await step(direction)
    }
    setCurrentIndex(targetIndex)
    setIsAnimating(false)
  }

  const handleNext = () => goTo((currentIndex + 1) % tools.length, 1)
  const handlePrev = () => goTo((currentIndex - 1 + tools.length) % tools.length, -1)
  const handleSelect = (index: number) => {
    if (index === currentIndex) return
    const total = tools.length
    const diff = (index - currentIndex + total) % total
    const steps = diff <= total / 2 ? diff : diff - total
    goTo(index, steps)
  }

  useLayoutEffect(() => {
    if (isMobile || !scope.current) return
    animate(scope.current, { rotateY: 0, z: -PRISM_RADIUS }, { duration: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  if (isMobile) return <MobileTools />

  return (
    <section ref={fit.ref} className="relative w-full overflow-hidden bg-ink" style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}>
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
        <div className="absolute text-linen" style={{ right: 43, top: 60, width: 760 }}>
          <AnimatedLines text={HEADING} className="font-display text-[64px] leading-[1.04]" />
        </div>

        <div className="absolute text-linen" style={{ right: 43, top: 250, width: 641 }}>
          <AnimatedLines key={`text-${currentIndex}`} text={tool.text} className="font-sans-tight text-[46px] leading-[58px] tracking-[-0.6px]" />
        </div>

        <div className="absolute text-linen/80" style={{ right: 42.67, top: 870 }}>
          <AnimatedLines key={`name-${currentIndex}`} text={`${tool.name} · ${tool.subtitle}`} className="font-sans text-[24px]" />
        </div>

        <div className="absolute text-linen" style={{ right: 1784, top: 870 }}>
          <AnimatedLines key={`counter-${currentIndex}`} text={counterText} className="font-sans text-[26px] font-semibold" />
        </div>

        <div ref={revealRef} className="pointer-events-none absolute" style={{ right: BUTTONS_RIGHT, top: 152.33, width: 128, height: 826.67 }} />

        {tools.map((t, i) => (
          <motion.button
            key={t.name}
            type="button"
            onClick={() => handleSelect(i)}
            aria-label={t.name}
            className="absolute flex cursor-pointer items-center justify-center rounded-full font-display text-[26px] text-linen"
            style={{
              right: AVATAR_RIGHT,
              top: AVATAR_TOP + i * AVATAR_STEP,
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              background: t.color,
              border: i === currentIndex ? '2.67px solid #e0442f' : '2.67px solid transparent',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={revealInView ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {t.short}
          </motion.button>
        ))}

        <div className="absolute" style={{ right: BUTTONS_RIGHT, top: BUTTONS_TOP, width: BUTTON_SIZE * 2 + BUTTON_GAP, height: BUTTON_SIZE }}>
          {(['prev', 'next'] as const).map((dir, i) => (
            <motion.button
              key={dir}
              type="button"
              onClick={dir === 'prev' ? handlePrev : handleNext}
              aria-label={dir === 'prev' ? 'הכלי הקודם' : 'הכלי הבא'}
              className="absolute top-0 flex cursor-pointer items-center justify-center rounded-full border border-linen/30"
              style={{ right: dir === 'prev' ? 0 : BUTTON_SIZE + BUTTON_GAP, width: BUTTON_SIZE, height: BUTTON_SIZE }}
              initial={{ scale: 0, opacity: 0 }}
              animate={revealInView ? { scale: 1, opacity: 1 } : undefined}
              transition={{ duration: 0.5, delay: 0.48 + i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <span style={{ display: 'flex', transform: dir === 'prev' ? 'rotate(180deg)' : undefined }}>
                <ChevronIcon />
              </span>
            </motion.button>
          ))}
        </div>

        <div className="absolute" style={{ right: CARD_RIGHT, top: CARD_TOP, width: CARD_W, height: CARD_H, perspective: 2200 }}>
          <div ref={scope} style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', transformOrigin: '50% 50%' }}>
            {slotContent.map((toolIndex, slot) => (
              <PrismFace key={slot} tool={tools[toolIndex]} slot={slot} />
            ))}
          </div>
        </div>

        {tool.points.map((line, i) => (
          <div key={i} className="absolute text-linen/50" style={{ right: CAPTION_POSITIONS[i].right, top: CAPTION_POSITIONS[i].top, width: CAPTION_POSITIONS[i].width }}>
            <AnimatedLines key={`caption-${currentIndex}-${i}`} text={line} className="font-sans-tight text-[17px] font-medium leading-[22px]" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default Tools
