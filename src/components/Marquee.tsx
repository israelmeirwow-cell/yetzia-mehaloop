import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import useFitScale from '../hooks/useFitScale'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 359
const GAP = 80

const phrases: { text: string; muted: boolean }[] = [
  { text: 'פחות ידע', muted: false },
  { text: 'יותר בהירות', muted: true },
  { text: 'יותר פעולה', muted: false },
]

function wrap(value: number, max: number) {
  return ((value % max) + max) % max
}

function TrackGroup() {
  return (
    <div className="flex shrink-0 items-center pe-[80px]" style={{ gap: GAP }}>
      {phrases.map((p) => (
        <span key={p.text} className="flex items-center gap-[80px] whitespace-nowrap font-display text-[250px] leading-[239px] tracking-[-4px] text-linen">
          <span className={p.muted ? 'font-light text-stone/70' : ''}>{p.text}</span>
          <span className="block h-[44px] w-[44px] shrink-0 rounded-full bg-claret" aria-hidden="true" />
        </span>
      ))}
    </div>
  )
}

function Marquee() {
  const fit = useFitScale(DESIGN_WIDTH)
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(0)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setTrackWidth(width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // The page reads right to left, so the words travel rightwards.
  const { scrollY } = useScroll()
  const x = useTransform(scrollY, (value) => (trackWidth ? wrap(value, trackWidth) : 0))

  return (
    <section
      ref={fit.ref}
      className="relative w-full overflow-hidden bg-ink"
      style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
      aria-label="פחות ידע, יותר בהירות, יותר פעולה"
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
        aria-hidden="true"
      >
        <div className="absolute inset-0 flex items-center overflow-hidden">
          <motion.div className="flex shrink-0 items-center" style={{ x }}>
            <div ref={trackRef}>
              <TrackGroup />
            </div>
            <TrackGroup />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Marquee
