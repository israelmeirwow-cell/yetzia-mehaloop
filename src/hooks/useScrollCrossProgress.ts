import { useEffect, type RefObject } from 'react'
import { useMotionValue, type MotionValue } from 'motion/react'

function useScrollCrossProgress(ref: RefObject<HTMLElement | null>, leadVh = 0): MotionValue<number> {
  const progress = useMotionValue(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame = 0
    const measure = () => {
      const rect = el.getBoundingClientRect()
      const lead = window.innerHeight * leadVh
      const raw = rect.height > 0 ? (lead - rect.top) / rect.height : 0
      progress.set(Math.min(1, Math.max(0, raw)))
    }

    const onScrollOrResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [ref, leadVh, progress])

  return progress
}

export default useScrollCrossProgress
