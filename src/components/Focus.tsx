import { useRef } from 'react'
import { useInView } from 'motion/react'
import useFitScale from '../hooks/useFitScale'
import useIsMobile from '../hooks/useIsMobile'
import AnimatedLines from './AnimatedLines'
import LoopLine from './LoopLine'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

const CORNER = 'הבעיה היא לא שאין לך מספיק ידע. יש לך יותר מדי ממנו, ואין מי שיגיד לך מה עושים איתו מחר בבוקר'
const STATEMENT = ['זה לא חוסר יכולת.', 'זה חוסר מיקוד.']
const BODY = 'עוד קורס לא יעזור. מה שעוזר זו מישהי שעושה איתך את הצעד הראשון, ואז את הבא.'
const LINK = 'לשיחת מיפוי'

function ArrowCircle({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" style={{ transform: 'scaleX(-1)' }}>
      <circle cx="32" cy="32" r="31" stroke="#f4efe6" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M24 40 40 24M27 24h13v13" stroke="#f4efe6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Glow() {
  return <div className="absolute inset-0" style={{ background: 'radial-gradient(50% 45% at 50% 50%, rgba(224,68,47,0.28), rgba(224,68,47,0) 72%), #0e0d0c' }} />
}

function MobileFocus() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-ink px-5 py-16 text-linen">
      <Glow />
      <div className="kenburns absolute inset-x-0 bottom-[4%] h-[170px]">
        <LoopLine width={900} height={300} baseline={0.75} amp={0.3} stroke="rgba(224,68,47,0.6)" strokeWidth={3} isInView={inView} duration={2.2} className="h-full w-full" preserveAspectRatio="xMidYMid slice" />
      </div>
      <div className="relative">
        <AnimatedLines text={CORNER} className="font-sans-tight text-[17px] font-medium leading-[1.45] text-linen/80" />
        <div className="mt-[180px] text-center font-display text-[12vw] leading-[1.04]">
          {STATEMENT.map((l, i) => (
            <AnimatedLines key={l} text={l} baseDelay={i * 0.1} className={i === 1 ? 'font-light text-claret' : ''} />
          ))}
        </div>
        <AnimatedLines text={BODY} className="mx-auto mt-6 max-w-[360px] text-center font-sans text-[18px] leading-[1.5] text-linen/80" baseDelay={0.15} />
        <a href="#contact" className="mt-10 flex items-center justify-center gap-3 font-sans-tight text-[17px] font-medium">
          {LINK}
          <ArrowCircle size={48} />
        </a>
      </div>
    </section>
  )
}

function Focus() {
  const isMobile = useIsMobile()
  const fit = useFitScale(DESIGN_WIDTH)
  const isInView = useInView(fit.ref, { once: true, amount: 0.3 })

  if (isMobile) return <MobileFocus />

  return (
    <section ref={fit.ref} className="relative w-full overflow-hidden bg-ink text-linen" style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}>
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
        <Glow />
        <div className="kenburns absolute inset-0">
          <LoopLine
            width={1920}
            height={1080}
            baseline={0.66}
            amp={0.2}
            stroke="rgba(224,68,47,0.55)"
            strokeWidth={3}
            isInView={isInView}
            duration={3}
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <div className="absolute inset-0 bg-ink/20" />

        <div className="absolute" style={{ right: 32, top: 32, width: 440 }}>
          <AnimatedLines text={CORNER} className="font-sans-tight text-[24px] font-medium leading-[33px] text-linen" />
        </div>

        <div className="absolute text-center font-display text-[104px] leading-[106px]" style={{ left: 410, top: 360, width: 1100 }}>
          {STATEMENT.map((l, i) => (
            <AnimatedLines key={l} text={l} baseDelay={i * 0.1} forceSingleLine className={`flex justify-center ${i === 1 ? 'font-light text-claret' : ''}`} />
          ))}
        </div>

        <div className="absolute text-center" style={{ left: 660, top: 630, width: 600 }}>
          <AnimatedLines text={BODY} className="font-sans text-[24px] leading-[34px] text-linen/80" baseDelay={0.15} />
        </div>

        <a href="#contact" className="absolute flex items-center gap-[12px] transition-opacity hover:opacity-80" style={{ left: 40, top: 984 }}>
          <AnimatedLines text={LINK} className="font-sans-tight text-[24px] font-medium leading-[31.68px] text-linen" />
          <ArrowCircle />
        </a>
      </div>
    </section>
  )
}

export default Focus
