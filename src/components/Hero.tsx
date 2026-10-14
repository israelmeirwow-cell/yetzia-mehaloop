import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import AnimatedWords from './AnimatedWords'
import PixelButton from './PixelButton'
import LoopLine from './LoopLine'
import useFitScale from '../hooks/useFitScale'
import useIsMobile from '../hooks/useIsMobile'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 970

const lines = [
  { text: 'כמה זמן כבר', right: 640, top: 150, light: false },
  { text: 'זה יושב לך', right: 900, top: 262, light: true },
  { text: 'בראש?', right: 800, top: 372, light: false },
]
const lead = 'ליווי אישי של 60 יום ושבוע, שמוציא את הרעיון שלך מהפתקים בטלפון והופך אותו לעסק שמכניס כסף.'
const note = '20 דקות שבסופן יש לך כיוון ברור וצעד הבא, גם אם לא נמשיך יחד.'
const cta = 'לתיאום שיחת מיפוי'

/** The ideas that never left the notes app, drifting over the dark. */
const notes = [
  { text: 'חנות תכשיטים באטסי?', right: 250, top: 250, delay: 1.6, drift: 10 },
  { text: 'סדנאות לילדים 🎨', right: 1430, top: 200, delay: 1.8, drift: -12 },
  { text: 'ממחר. הפעם ברצינות', right: 1400, top: 760, delay: 2.0, drift: 8 },
  { text: 'קורס דיגיטלי על...?', right: 270, top: 760, delay: 2.2, drift: -9 },
]

function Backdrop({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 45% at 12% 72%, rgba(224,68,47,0.22), rgba(224,68,47,0) 70%), radial-gradient(70% 60% at 85% 20%, rgba(214,210,200,0.07), rgba(214,210,200,0) 70%), #0e0d0c',
        }}
      />
      {children}
      <div
        className="absolute inset-x-0 bottom-0 h-[40%]"
        style={{ background: 'linear-gradient(to top, rgba(14,13,12,0.75), rgba(14,13,12,0))' }}
      />
    </>
  )
}

function NoteChip({ text, isInView, delay, drift }: { text: string; isInView: boolean; delay: number; drift: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    >
      <motion.div
        animate={{ y: [0, drift, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
        className="whitespace-nowrap rounded-full border border-linen/20 bg-linen/[0.04] px-[22px] py-[10px] font-sans text-[19px] text-linen/55 "
      >
        {text}
      </motion.div>
    </motion.div>
  )
}

function EndLabel({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`whitespace-nowrap font-sans-tight font-medium tracking-[0.02em] text-linen/60 ${className ?? ''}`} style={style}>
      {children}
    </span>
  )
}

function MobileHero() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section id="top" ref={ref} className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-ink text-linen">
      <Backdrop>
        <div className="kenburns absolute inset-x-0 top-[52%] h-[150px]">
          <LoopLine width={900} height={260} stroke="rgba(244,239,230,0.38)" strokeWidth={2.6} isInView={isInView} delay={0.6} dot="#e0442f" className="h-full w-full" preserveAspectRatio="xMidYMid slice" />
        </div>
      </Backdrop>

      <div className="relative z-10 flex flex-1 flex-col px-5 pb-10 pt-[104px]">
        <h1 className="font-display text-[16.5vw] leading-[0.98] tracking-[-0.01em]">
          {lines.map((l, i) => (
            <span key={l.text} className={`block ${l.light ? 'font-light text-claret ps-[14vw]' : ''}`}>
              <AnimatedWords text={l.text} baseDelay={0.45 + i * 0.15} isInView={isInView} />
            </span>
          ))}
        </h1>

        <div className="mt-auto pt-[150px]">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, delay: 1, ease: 'easeOut' }}
            className="font-sans text-[18px] leading-[1.45] text-linen/90"
          >
            {lead}
          </motion.p>
          <PixelButton
            href="#contact"
            initial={{ scale: 0 }}
            animate={{ scale: isInView ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 1.3, ease: 'easeOut' }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 flex w-full justify-center rounded-[18px] bg-linen px-6 py-[18px] font-sans-tight text-[18px] font-semibold"
          >
            {cta}
          </PixelButton>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : undefined}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="mt-3 text-center font-sans text-[15px] leading-[1.4] text-linen/65"
          >
            {note}
          </motion.p>
        </div>
      </div>
    </section>
  )
}

function Hero() {
  const isMobile = useIsMobile()
  const fit = useFitScale(DESIGN_WIDTH, DESIGN_HEIGHT)
  const offsetX = (fit.containerSize.width - DESIGN_WIDTH * fit.scale) / 2
  const offsetY = (fit.containerSize.height - DESIGN_HEIGHT * fit.scale) / 2
  const isInView = useInView(fit.ref, { once: true, amount: 0.3 })

  if (isMobile) return <MobileHero />

  return (
    <section id="top" ref={fit.ref} className="relative h-screen w-full overflow-hidden bg-ink text-linen">
      <div
        className="isolate"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${fit.scale})`,
          transformOrigin: 'top left',
        }}
      >
        <Backdrop>
          <div className="kenburns absolute inset-0">
            <LoopLine
              width={1920}
              height={200}
              stroke="rgba(244,239,230,0.3)"
              strokeWidth={2.4}
              isInView={isInView}
              delay={0.7}
              duration={2.8}
              dot="#e0442f"
              className="absolute left-0"
              style={{ top: 452, width: 1920, height: 200 }}
            />
          </div>
        </Backdrop>

        <EndLabel className="absolute text-[17px]" style={{ right: 200, top: 640 }}>
          המצב היום
        </EndLabel>
        <EndLabel className="absolute text-[17px] !text-claret" style={{ left: 200, top: 640 }}>
          עסק שמכניס כסף
        </EndLabel>

        {notes.map((n) => (
          <div key={n.text} className="absolute" style={{ right: n.right, top: n.top }}>
            <NoteChip text={n.text} isInView={isInView} delay={n.delay} drift={n.drift} />
          </div>
        ))}


        <h1 className="absolute left-0 top-0 h-full w-full font-display text-[118px] leading-[104px] tracking-[-1px]">
          {lines.map((l, i) => (
            <span
              key={l.text}
              className={`absolute ${l.light ? 'font-light text-claret' : ''}`}
              style={{ right: l.right, top: l.top, whiteSpace: 'nowrap' }}
            >
              <AnimatedWords text={l.text} baseDelay={0.5 + i * 0.15} isInView={isInView} />
            </span>
          ))}
        </h1>

        <div className="absolute left-1/2 top-[640px] flex w-[560px] -translate-x-1/2 flex-col items-center gap-[24px] text-center">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 14 }}
            transition={{ duration: 0.6, delay: 1, ease: 'easeOut' }}
            className="font-sans text-[23px] leading-[1.42] text-linen"
          >
            {lead}
          </motion.p>

          <PixelButton
            href="#contact"
            initial={{ scale: 0 }}
            animate={{ scale: isInView ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 1.3, ease: 'easeOut' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-[21.333px] bg-linen px-[34px] py-[20px] font-sans-tight text-[22px] font-semibold leading-[1.21]"
          >
            {cta}
          </PixelButton>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : undefined}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="font-sans text-[17px] text-linen/60"
          >
            {note}
          </motion.p>
        </div>
      </div>
    </section>
  )
}

export default Hero
