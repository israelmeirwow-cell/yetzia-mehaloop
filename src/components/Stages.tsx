import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, type PanInfo } from 'motion/react'
import useFitScale from '../hooks/useFitScale'
import useIsMobile from '../hooks/useIsMobile'
import AnimatedLines from './AnimatedLines'
import LoopLine from './LoopLine'
import { ltr } from '../lib/loop'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080
const PANEL_WIDTH = 960
const CARD_WIDTH = 341.333
const CARD_HEIGHT = 689.667
const CARD_RADIUS = 42.667

type EnterFrom = 'left' | 'top' | 'right' | 'bottom'

interface Stage {
  key: string
  num: string
  color: string
  badge: string
  title: string
  desc: string
  when: string
  enterFrom: EnterFrom
  delay: number
}

const SLOTS = [
  { left: 273.17, top: 311.79, rotate: -3.4, photoRotate: 4.9, textRotate: 5.6 },
  { left: 506.62, top: 225.37, rotate: 2.3, photoRotate: -4.1, textRotate: -4.3 },
  { left: 313.55, top: 83.2, rotate: -2.1, photoRotate: 3.3, textRotate: 3.9 },
  { left: 95.26, top: 207.35, rotate: 3.6, photoRotate: -5.1, textRotate: -5.7 },
]

// Depth 0 sits on top of the deck, so stage 1 faces you first.
const INITIAL_ORDER = ['map', 'focus', 'action', 'toolkit']
const SWIPE_OFFSET_THRESHOLD = 90
const SWIPE_VELOCITY_THRESHOLD = 500

const stages: Stage[] = [
  {
    key: 'map',
    num: '01',
    color: '#2a2622',
    badge: 'מיפוי',
    title: 'מיפוי ובהירות',
    desc: 'נמפה את החוזקות שלך ועל מה פונים אליך, ונסנן עד שנשאר רעיון אחד',
    when: 'שבוע 1',
    enterFrom: 'top',
    delay: 0,
  },
  {
    key: 'focus',
    num: '02',
    color: '#a8321f',
    badge: 'מיקוד',
    title: 'מיקוד ושבירת תבניות',
    desc: 'ה־20% שמביאים 80% מהתוצאה, ופירוק של מה שעצר אותך עד היום',
    when: `שבועות ${ltr('2–3')}`,
    enterFrom: 'right',
    delay: 0.08,
  },
  {
    key: 'action',
    num: '03',
    color: '#3f4a3a',
    badge: 'פעולה',
    title: 'פעולה בשטח',
    desc: 'נבדוק שיש קהל, נדבר עם אנשים אמיתיים, עד הלקוח הראשון',
    when: `שבועות ${ltr('4–9')}`,
    enterFrom: 'left',
    delay: 0.16,
  },
  {
    key: 'toolkit',
    num: '04',
    color: '#5c4a3a',
    badge: 'ערכת כלים',
    title: 'ערכת הכלים שלך',
    desc: 'מסמך אחד עם ההחלטות, השיטה והכלים, כדי לדעת לאן לחזור',
    when: 'בסיום',
    enterFrom: 'bottom',
    delay: 0.24,
  },
]

const RANGE = '60 יום ושבוע · ליווי אישי'
const HEADING = 'הדרך החוצה'
const BODY =
  'ארבעה שלבים, וכל אחד נבנה על הקודם. פעם בשבוע שיחה אישית, ובכל שבוע משהו זז בשטח ולא רק במחברת. כשצריך ידע ממוקד, נחבר אותך למי שמתמחה בדיוק בזה.'
const DRAG_HINT = 'גוררים כדי לדפדף'

function enterOffset(stage: Stage) {
  const slot = SLOTS[INITIAL_ORDER.indexOf(stage.key)]
  switch (stage.enterFrom) {
    case 'left':
      return { x: -(slot.left + CARD_WIDTH), y: 0 }
    case 'right':
      return { x: PANEL_WIDTH - slot.left, y: 0 }
    case 'top':
      return { x: 0, y: -(slot.top + CARD_HEIGHT) }
    case 'bottom':
      return { x: 0, y: DESIGN_HEIGHT - slot.top }
  }
}

function CardFace({ stage, photoRotate = 0, textRotate = 0 }: { stage: Stage; photoRotate?: number; textRotate?: number }) {
  return (
    <>
      <div
        className="absolute left-0 top-0 h-[458.667px] w-full overflow-hidden"
        style={{ borderRadius: CARD_RADIUS, transform: `rotate(${photoRotate}deg)`, background: stage.color }}
      >
        <span className="absolute font-display text-[230px] font-light leading-none text-linen/90" style={{ right: 34, bottom: 18 }}>
          {stage.num}
        </span>
        <svg viewBox="0 0 120 24" className="absolute w-[150px] text-linen/40" style={{ left: 30, top: 112 }} fill="none" aria-hidden="true">
          <path d="M118 18H86c-8 0-14-5-14-11 0-4 3-6 6-6s6 3 6 7c0 6-7 10-17 10H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      <div
        className="absolute left-0 top-[482.667px] h-[207px] w-full border-[1.333px] border-[#3d3632] bg-[#efe9dd]"
        style={{ borderRadius: CARD_RADIUS, transform: `rotate(${textRotate}deg)` }}
      >
        <div className="absolute right-[30px] top-[28px] w-[282px]">
          <p className="font-display text-[34px] leading-[36px] text-ink">{stage.title}</p>
          <p className="mt-[8px] font-sans text-[16.5px] leading-[22px] text-ink/85">{stage.desc}</p>
        </div>
        <div className="absolute bottom-[22px] right-[30px] flex items-baseline gap-[10px]">
          <span className="font-sans text-[15px] text-ink/60">מתי</span>
          <span className="font-sans text-[17px] font-semibold text-ink">{stage.when}</span>
        </div>
      </div>

      <div
        className="absolute top-[16px] inline-flex items-center justify-center whitespace-nowrap rounded-2xl border border-linen/80 px-4 py-2"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      >
        <span className="font-sans-tight text-[18.667px] font-medium text-linen">{stage.badge}</span>
      </div>
    </>
  )
}

function StageCard({
  stage,
  depth,
  isInView,
  entered,
  onSwipe,
  onDragStart,
}: {
  stage: Stage
  depth: number
  isInView: boolean
  entered: boolean
  onSwipe: (direction: 1 | -1) => void
  onDragStart: () => void
}) {
  const offset = enterOffset(stage)
  const slot = SLOTS[depth]
  const isDraggable = depth !== 2

  const handleDragEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.x < -SWIPE_OFFSET_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      onSwipe(-1)
    } else if (info.offset.x > SWIPE_OFFSET_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD) {
      onSwipe(1)
    }
  }

  return (
    <motion.div
      className="absolute"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT, cursor: isDraggable ? 'grab' : undefined }}
      initial={{ x: offset.x, y: offset.y, left: slot.left, top: slot.top, rotate: slot.rotate, zIndex: 4 - depth }}
      animate={isInView ? { x: 0, y: 0, left: slot.left, top: slot.top, rotate: slot.rotate, zIndex: 4 - depth } : undefined}
      transition={
        entered
          ? { default: { duration: 0.5, ease: 'easeOut' }, zIndex: { duration: 0 } }
          : { default: { duration: 0.8, delay: stage.delay, ease: 'easeOut' }, zIndex: { duration: 0 } }
      }
      drag={isDraggable ? 'x' : false}
      dragSnapToOrigin
      dragElastic={0.15}
      whileDrag={{ cursor: 'grabbing' }}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardFace stage={stage} photoRotate={slot.photoRotate} textRotate={slot.textRotate} />
    </motion.div>
  )
}

function DeckBackdrop() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 55%, #2a1612 0%, #0e0d0c 75%)' }} />
      <LoopLine width={960} height={1080} baseline={0.62} amp={0.16} stroke="rgba(244,239,230,0.12)" strokeWidth={2} duration={0} className="absolute inset-0 h-full w-full" />
    </>
  )
}

/** Phone card: same look as the desktop deck card, but laid out at real size so the text reads at 16px. */
function MobileStageCard({ stage }: { stage: Stage }) {
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="relative h-[210px] shrink-0 overflow-hidden rounded-[30px]" style={{ background: stage.color }}>
        <span className="absolute left-1/2 top-3.5 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-linen/80 px-3.5 py-1.5 font-sans-tight text-[15px] font-medium text-linen">
          {stage.badge}
        </span>
        <svg viewBox="0 0 120 24" className="absolute left-5 top-[70px] w-[96px] text-linen/40" fill="none" aria-hidden="true">
          <path d="M118 18H86c-8 0-14-5-14-11 0-4 3-6 6-6s6 3 6 7c0 6-7 10-17 10H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="absolute bottom-2 right-5 font-display text-[112px] font-light leading-none text-linen/90">{stage.num}</span>
      </div>
      <div className="flex flex-1 flex-col rounded-[30px] border border-[#3d3632] bg-[#efe9dd] px-5 pb-4 pt-4 text-ink">
        <p className="font-display text-[25px] leading-[1.1]">{stage.title}</p>
        <p className="mt-2 font-sans text-[16px] leading-[1.45] text-ink/85">{stage.desc}</p>
        <p className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-sans text-[14px] text-ink/60">מתי</span>
          <span className="font-sans text-[16px] font-semibold">{stage.when}</span>
        </p>
      </div>
    </div>
  )
}

function MobileStages() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const ordered = ['map', 'focus', 'action', 'toolkit'].map((k) => stages.find((s) => s.key === k)!)

  return (
    <section id="way" className="relative w-full overflow-hidden">
      <div className="bg-linen px-5 pb-10 pt-12 text-center text-ink">
        <p className="font-sans-tight text-[14px] font-medium">{RANGE}</p>
        <div className="mx-auto mt-3 h-px w-full bg-ink" />
        <AnimatedLines text={HEADING} className="mt-8 font-display text-[16vw] leading-[1]" baseDelay={0.1} />
        <AnimatedLines text={BODY} className="mx-auto mt-5 max-w-[420px] font-sans text-[17px] leading-[1.5] text-ink/80" baseDelay={0.2} />
      </div>
      <div ref={ref} className="relative overflow-hidden bg-ink py-10">
        <DeckBackdrop />
        <div className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-[11vw] pb-4 [scrollbar-width:none]">
          {ordered.map((s, i) => (
            <motion.div
              key={s.key}
              className="relative h-[396px] w-[78vw] max-w-[310px] shrink-0 snap-center"
              initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }}
              animate={inView ? { opacity: 1, y: 0, rotate: i % 2 ? 1.2 : -1.2 } : undefined}
              transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
            >
              <MobileStageCard stage={s} />
            </motion.div>
          ))}
        </div>
        <p className="relative mt-4 flex items-center justify-center gap-3 font-sans-tight text-[15px] font-medium text-linen/75">
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
            <path d="M7 1L1 7L7 13M13 1L19 7L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {DRAG_HINT}
        </p>
      </div>
    </section>
  )
}

function Stages() {
  const isMobile = useIsMobile()
  const fit = useFitScale(DESIGN_WIDTH)

  const cardsRef = useRef<HTMLDivElement>(null)
  const cardsInView = useInView(cardsRef, { once: true, amount: 0.3 })

  const [order, setOrder] = useState(INITIAL_ORDER)
  const [entered, setEntered] = useState(false)
  const [hasDragged, setHasDragged] = useState(false)
  useEffect(() => {
    if (!cardsInView) return
    const timer = setTimeout(() => setEntered(true), 1300)
    return () => clearTimeout(timer)
  }, [cardsInView])

  const swipe = (direction: 1 | -1) => {
    setOrder((prev) => (direction === 1 ? [prev[3], prev[0], prev[1], prev[2]] : [prev[1], prev[2], prev[3], prev[0]]))
  }

  const topBorderRef = useRef<HTMLDivElement>(null)
  const topBorderInView = useInView(topBorderRef, { once: true, amount: 0.6 })
  const bottomBorderRef = useRef<HTMLDivElement>(null)
  const bottomBorderInView = useInView(bottomBorderRef, { once: true, amount: 0.6 })

  if (isMobile) return <MobileStages />

  return (
    <section ref={fit.ref} className="relative w-full overflow-hidden" style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}>
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
        {/* Text panel on the right (reading side), deck on the left. */}
        <div className="absolute top-0 h-full w-[960px] bg-linen" style={{ left: 960 }}>
          <div ref={topBorderRef} className="absolute" style={{ left: 32, top: 32, width: 896 }}>
            <AnimatedLines text={RANGE} className="text-center font-sans-tight text-[17px] font-medium text-ink" />
            <motion.div
              className="mt-[16px] h-px w-full bg-ink"
              initial={{ scaleX: 0 }}
              animate={topBorderInView ? { scaleX: 1 } : undefined}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            />
          </div>

          <div ref={bottomBorderRef} className="absolute" style={{ left: 32, top: 1011, width: 896 }}>
            <motion.div
              className="h-px w-full bg-ink"
              initial={{ scaleX: 0 }}
              animate={bottomBorderInView ? { scaleX: 1 } : undefined}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <div className="mt-[16px]">
              <AnimatedLines text={RANGE} className="text-center font-sans-tight text-[17px] font-medium text-ink" baseDelay={0.15} />
            </div>
          </div>

          <div className="absolute" style={{ left: 180, top: 420, width: 600 }}>
            <AnimatedLines text={HEADING} className="text-center font-display text-[118px] leading-[110px] text-ink" baseDelay={0.1} />
          </div>

          <div className="absolute" style={{ left: 240, top: 600, width: 480 }}>
            <AnimatedLines text={BODY} className="text-center font-sans text-[20px] leading-[29px] text-ink/80" baseDelay={0.2} />
          </div>
        </div>

        <div ref={cardsRef} className="absolute overflow-visible" style={{ left: 0, top: 0, width: 960, height: DESIGN_HEIGHT }}>
          <DeckBackdrop />

          <div className="absolute inset-0" style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}>
            {stages.map((stage) => (
              <StageCard
                key={stage.key}
                stage={stage}
                depth={order.indexOf(stage.key)}
                isInView={cardsInView}
                entered={entered}
                onSwipe={swipe}
                onDragStart={() => setHasDragged(true)}
              />
            ))}

            <div className="pointer-events-none absolute inset-x-0 z-10 flex justify-center" style={{ top: 1016 }}>
              <AnimatePresence>
                {entered && !hasDragged && (
                  <motion.div
                    key="drag-hint"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="inline-flex items-center gap-[10.667px] whitespace-nowrap rounded-full border border-white/40 bg-white/10 px-[21.333px] py-[12px] backdrop-blur-[3px]"
                  >
                    <motion.svg
                      width="21.333"
                      height="14.933"
                      viewBox="0 0 20 14"
                      fill="none"
                      animate={{ x: [0, -4, 4, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
                    >
                      <path d="M7 1L1 7L7 13" stroke="white" strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13 1L19 7L13 13" stroke="white" strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                    <span className="font-sans-tight text-[17px] font-medium text-white/90">{DRAG_HINT}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Stages
