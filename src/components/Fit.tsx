import { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import useIsMobile from '../hooks/useIsMobile'
import AnimatedLines from './AnimatedLines'

const COMPARE_HEADING = ['עוד קורס,', 'או ליווי.']
const rows: [string, string][] = [
  ['עוד ידע שנערם', 'צעד אחד ברור בכל יום'],
  ['תוכנית אחת לכולן', 'מותאם לרעיון ולזמן שלך'],
  ['לבד מול סרטונים', 'מישהי שהולכת לידך כל הדרך'],
  ['"עוד לא הזמן הנכון"', 'התחלה עכשיו, בקטן'],
  ['נגמר בתעודה', 'בנוי סביב עסק שמכניס כסף'],
]

const FIT_HEADING = 'נתחיל בדיוק מהמקום שלך.'
const FIT_BODY = 'יש רעיון לעסק או למוצר? מעולה. יש רק תחושה שאפשר יותר, וחסר כיוון? גם מעולה.'
const yes = [
  'בא לך לעשות משהו שבאמת אהוב עליך, כזה שאפשר להתמיד בו ושגם יכניס כסף',
  'נמאס לך לראות אנשים שלא יותר חכמים ממך מוציאים רעיונות לפועל, בזמן שאצלך הכול באותה נקודה',
  'ברור לך שהשקעה בעצמך היא ההשקעה הכי משתלמת, ויש לך מוכנות להתחייב לתהליך',
]
const no = [
  'המטרה היא נוסחה להתעשר מהר, כבר ממחר',
  'יותר נוח לך להמשיך לתכנן ולפתוח עוד פתק בטלפון שלא ייפתח שוב',
  'הציפייה היא שמישהו אחר יעשה את זה במקומך',
]

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' as const },
})

const WIPE_EASE = [0.65, 0, 0.35, 1] as const

/**
 * One comparison row, as on the original site: once the row is on screen the red hand-drawn line
 * wipes across the old text (right to left), then the new text lights up with its check.
 */
function CompareRow({ old, next }: { old: string; next: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6, margin: '0px 0px -18% 0px' })
  const reduceMotion = useReducedMotion()
  const on = inView || !!reduceMotion

  return (
    <div ref={ref} className="grid grid-cols-2 items-center gap-4 border-b border-linen/10 py-4 last:border-0 lg:py-[1.3vw]">
      <span className="relative justify-self-start font-sans text-[16px] text-linen/60 lg:text-[clamp(17px,1.25vw,24px)]">
        {old}
        <motion.svg
          className="pointer-events-none absolute -inset-x-[6px] top-[52%] -mt-[7px] h-[14px] w-[calc(100%+12px)]"
          viewBox="0 0 200 14"
          preserveAspectRatio="none"
          aria-hidden="true"
          initial={false}
          animate={{ clipPath: on ? 'inset(0 0 0 0%)' : 'inset(0 0 0 100%)' }}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.25, ease: WIPE_EASE }}
        >
          <path d="M198 9C160 4 120 11 80 6S20 8 4 5" fill="none" stroke="#e0442f" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </motion.svg>
      </span>
      <motion.span
        className="flex items-center gap-2 font-display text-[19px] leading-[1.2] lg:gap-3 lg:text-[clamp(20px,1.6vw,32px)]"
        initial={false}
        animate={{ opacity: on ? 1 : 0.25 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.6 }}
      >
        <svg className="h-[20px] w-[20px] shrink-0 lg:h-[26px] lg:w-[26px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 13c2 1.5 3.5 3.2 5 5.5C12 12 15.5 7.5 20.5 4.5" stroke="#e0442f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {next}
      </motion.span>
    </div>
  )
}

function Check({ ok }: { ok: boolean }) {
  return (
    <span className={`mt-[3px] flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${ok ? 'bg-claret' : 'border border-linen/30'}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        {ok ? (
          <path d="M2 6.5 4.8 9 10 3" stroke="#f4efe6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M3 3l6 6M9 3 3 9" stroke="#f4efe6" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" />
        )}
      </svg>
    </span>
  )
}

const heading = 'font-display text-[clamp(42px,5.4vw,106px)] leading-[1.02]'
const card = 'rounded-[28px] bg-soot p-6 lg:rounded-[34px] lg:p-[2.6vw]'

function Fit() {
  const isMobile = useIsMobile()
  const [noOpen, setNoOpen] = useState(false)
  return (
    <section id="fit" className="relative w-full bg-ink px-5 py-20 text-linen lg:px-[3.2vw] lg:py-[7vw]">
      <div className="text-center">
        {COMPARE_HEADING.map((l, i) => (
          <AnimatedLines key={l} text={l} className={`${heading} ${i === 1 ? 'text-[#6f6a62]' : ''}`} baseDelay={0.1 * (i + 1)} />
        ))}
      </div>

      <motion.div {...fadeUp(0)} className={`${card} mx-auto mt-10 max-w-[1200px] lg:mt-[3vw]`}>
        <div className="grid grid-cols-2 gap-4 border-b border-linen/15 pb-4 font-sans-tight text-[15px] font-semibold lg:text-[clamp(16px,1.1vw,21px)]">
          <span className="text-linen/50">עוד קורס</span>
          <span className="text-claret">הליווי</span>
        </div>
        {rows.map(([a, b]) => (
          <CompareRow key={a} old={a} next={b} />
        ))}
      </motion.div>

      <div className="mt-24 grid gap-8 lg:mt-[8vw] lg:grid-cols-[1fr_1fr] lg:gap-[4vw]">
        <div>
          <AnimatedLines text={FIT_HEADING} className={heading} />
        </div>
        <div className="flex items-end">
          <AnimatedLines text={FIT_BODY} className="max-w-[560px] font-sans text-[18px] leading-[1.55] text-linen/75 lg:text-[clamp(18px,1.3vw,25px)]" baseDelay={0.15} />
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:mt-[3vw] lg:grid-cols-2 lg:gap-[1.4vw]">
        {[
          { title: 'זה בשבילך אם', items: yes, ok: true },
          { title: 'זה לא בשבילך אם', items: no, ok: false },
        ].map((col, ci) => {
          // On phones the "not for you" list folds away behind its heading to keep the page short.
          const foldable = isMobile && !col.ok
          const open = !foldable || noOpen
          const list = (
            <ul className="mt-5 space-y-4">
              {col.items.map((it) => (
                <li key={it} className={`flex gap-3 font-sans text-[17px] leading-[1.5] lg:text-[clamp(17px,1.2vw,23px)] ${col.ok ? 'text-linen/90' : 'text-linen/60'}`}>
                  <Check ok={col.ok} />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          )
          return (
            <motion.div
              key={col.title}
              {...fadeUp(ci)}
              className={card}
              style={col.ok ? { background: 'linear-gradient(160deg, #2a1612 0%, #171513 70%)' } : undefined}
            >
              {foldable ? (
                <button
                  type="button"
                  onClick={() => setNoOpen((v) => !v)}
                  aria-expanded={open}
                  aria-controls="fit-no-list"
                  className="flex w-full cursor-pointer items-center justify-between gap-4 text-start"
                >
                  <h3 className="font-display text-[28px]">{col.title}</h3>
                  <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[14px] bg-[#262220]">
                    <motion.svg width="18" height="18" viewBox="0 0 21 21" fill="none" animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3 }} aria-hidden="true">
                      <path d="M10.5 2v17M2 10.5h17" stroke="#f4efe6" strokeWidth="1.7" strokeLinecap="round" />
                    </motion.svg>
                  </span>
                </button>
              ) : (
                <h3 className="font-display text-[28px] lg:text-[clamp(28px,2.2vw,44px)]">{col.title}</h3>
              )}
              {foldable ? (
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id="fit-no-list"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      {list}
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                list
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default Fit
