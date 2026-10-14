import { useEffect, useRef, useState } from 'react'

function useFitScale(designWidth: number, designHeight?: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [containerSize, setContainerSize] = useState({ width: designWidth, height: designHeight ?? 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (!rect) return
      setContainerSize({ width: rect.width, height: rect.height })
      const widthScale = rect.width / designWidth
      setScale(designHeight ? Math.max(widthScale, rect.height / designHeight) : widthScale)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [designWidth, designHeight])

  return { ref, scale, containerSize }
}

export default useFitScale
