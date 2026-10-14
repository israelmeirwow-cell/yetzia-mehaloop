import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, useInView } from 'motion/react'

interface AnimatedLinesProps {
  text: string
  className?: string
  style?: CSSProperties
  duration?: number
  stagger?: number
  baseDelay?: number
  amount?: number
  targetOpacity?: number
  firstLineIndent?: number
  forceSingleLine?: boolean
}

function AnimatedLines({
  text,
  className,
  style,
  duration = 0.42,
  stagger = 0.06,
  baseDelay = 0,
  amount = 0.4,
  targetOpacity = 1,
  firstLineIndent,
  forceSingleLine = false,
}: AnimatedLinesProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<string[] | null>(forceSingleLine ? [text] : null)
  const words = text.split(' ')
  // Phones scroll fast: start the reveal just before the text enters the screen, and play it quicker,
  // so a quick flick never lands on an empty block.
  const [isPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches)
  const inView = useInView(containerRef, isPhone ? { once: true, amount: 0, margin: '0px 0px 15% 0px' } : { once: true, amount })
  const dur = isPhone ? duration * 0.75 : duration
  const gap = isPhone ? stagger * 0.6 : stagger
  const delay0 = isPhone ? baseDelay * 0.6 : baseDelay

  useLayoutEffect(() => {
    setLines(forceSingleLine ? [text] : null)
  }, [text, forceSingleLine])

  useLayoutEffect(() => {
    if (forceSingleLine) return
    if (!('fonts' in document)) return
    document.fonts.ready.then(() => setLines(null))
  }, [forceSingleLine])

  useLayoutEffect(() => {
    if (forceSingleLine) return
    if (lines !== null) return
    const container = measureRef.current
    if (!container) return
    const spans = Array.from(container.querySelectorAll<HTMLSpanElement>('span[data-word]'))
    const groups: string[] = []
    let currentTop: number | null = null
    let currentWords: string[] = []
    spans.forEach((span, i) => {
      const top = span.offsetTop
      if (currentTop === null || top === currentTop) {
        currentWords.push(words[i])
      } else {
        groups.push(currentWords.join(' '))
        currentWords = [words[i]]
      }
      currentTop = top
    })
    if (currentWords.length) groups.push(currentWords.join(' '))
    setLines(groups)
  }, [lines, words, forceSingleLine])

  return (
    <div ref={containerRef} className={className} style={style}>
      {lines === null ? (
        <div ref={measureRef} style={{ visibility: 'hidden', textIndent: firstLineIndent }}>
          {words.map((word, i) => (
            <span key={i} data-word="">
              {word}{' '}
            </span>
          ))}
        </div>
      ) : (
        lines.map((line, i) => (
          <div
            key={i}
            style={{
              overflowY: 'hidden',
              overflowX: forceSingleLine ? 'visible' : 'hidden',
              whiteSpace: forceSingleLine ? 'nowrap' : undefined,
              paddingInlineStart: i === 0 ? firstLineIndent : undefined,
              paddingBottom: '0.3em',
              marginBottom: '-0.3em',
            }}
          >
            <motion.span
              style={{ display: 'inline-block' }}
              initial={{ y: '100%', opacity: 0 }}
              animate={inView ? { y: '0%', opacity: targetOpacity } : undefined}
              transition={{ duration: dur, delay: delay0 + i * gap, ease: 'easeOut' }}
            >
              {line}
            </motion.span>
          </div>
        ))
      )}
    </div>
  )
}

export default AnimatedLines
