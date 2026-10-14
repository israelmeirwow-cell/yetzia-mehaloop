import { useEffect, useRef, useState } from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'

function hash(i: number) {
  let t = (i * 374761393 + 668265263) | 0
  t = ((t ^ (t >> 13)) * 1274126177) | 0
  return ((t ^ (t >> 16)) >>> 0) / 4294967295
}

type PixelButtonProps = Omit<HTMLMotionProps<'a'>, 'children'> & {
  children: React.ReactNode
  contentClassName?: string
  textColor?: string
  hoverTextColor?: string
  pixelColor?: string
  pixelSize?: number
  speed?: number
  hoverBorderColor?: string
}

function PixelButton({
  children,
  contentClassName = 'inline-flex items-center',
  textColor = '#0e0d0c',
  hoverTextColor = '#f4efe6',
  pixelColor = '#e0442f',
  pixelSize = 6,
  speed = 0.45,
  hoverBorderColor = '#f4efe6',
  className,
  style,
  ...motionProps
}: PixelButtonProps) {
  const rootRef = useRef<HTMLAnchorElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!root || !canvas || !ctx) return

    let W = 0
    let H = 0
    let cols = 1
    let rows = 1
    let thresholds = new Float32Array(1)
    let progress = 0
    let target01 = 0
    let raf = 0
    let lastT = 0
    const speedPerSec = 1 / Math.max(speed, 0.1)

    function rebuildGrid() {
      cols = Math.max(1, Math.ceil(W / pixelSize))
      rows = Math.max(1, Math.ceil(H / pixelSize))
      thresholds = new Float32Array(cols * rows)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x
          thresholds[i] = ((1 - x / Math.max(cols - 1, 1)) * 0.65 + hash(i) * 0.35) * 0.92
        }
      }
    }

    function draw(p: number) {
      ctx!.clearRect(0, 0, W, H)
      if (p <= 0) return
      ctx!.fillStyle = pixelColor
      const s = pixelSize
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const thr = thresholds[y * cols + x]
          if (p <= thr) continue
          ctx!.globalAlpha = p - thr < 0.12 ? 0.45 : 1
          ctx!.fillRect(x * s, y * s, s, s)
        }
      }
      ctx!.globalAlpha = 1
    }

    function frame(now: number) {
      const dt = (now - lastT) / 1000
      lastT = now
      progress =
        target01 > progress
          ? Math.min(progress + dt * speedPerSec, 1)
          : Math.max(progress - dt * speedPerSec, 0)
      draw(progress)
      setHovered(progress > 0.6)
      raf = progress !== target01 ? requestAnimationFrame(frame) : 0
    }

    function kick() {
      if (raf) return
      lastT = performance.now()
      raf = requestAnimationFrame(frame)
    }

    function resize() {
      W = root!.offsetWidth
      H = root!.offsetHeight
      if (W === 0 || H === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      ctx!.setTransform(1, 0, 0, 1, 0, 0)
      ctx!.scale(dpr, dpr)
      rebuildGrid()
      draw(progress)
    }

    const onEnter = () => {
      target01 = 1
      kick()
    }
    const onLeave = () => {
      target01 = 0
      kick()
    }

    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)

    const ro = new ResizeObserver(resize)
    ro.observe(root)
    resize()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [pixelColor, pixelSize, speed])

  return (
    <motion.a
      ref={rootRef}
      className={`relative isolate overflow-hidden ${className ?? ''}`}
      style={{
        ...style,
        cursor: 'pointer',
        boxShadow: `0 0 0 1px ${hovered ? hoverBorderColor : 'rgba(255,255,255,0)'}`,
        transition: 'box-shadow 0.15s ease-out',
      }}
      {...motionProps}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          inset: '-0.5px',
          width: 'calc(100% + 1px)',
          height: 'calc(100% + 1px)',
          borderRadius: 'inherit',
        }}
      />
      <span
        className={`relative z-10 ${contentClassName}`}
        style={{ color: hovered ? hoverTextColor : textColor, transition: 'color 0.15s' }}
      >
        {children}
      </span>
    </motion.a>
  )
}

export default PixelButton
