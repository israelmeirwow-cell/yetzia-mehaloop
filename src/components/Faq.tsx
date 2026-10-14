import { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import AnimatedLines from './AnimatedLines'

interface FaqItem {
  question: string
  answer: string
}

const items: FaqItem[] = [
  {
    question: 'כמה זמן זה דורש ממני?',
    answer:
      'הכול מותאם אישית. את השיחות קובעות לפי הלו״ז שלך, והמשימה היומית בווטסאפ היא בגודל שמתאים לזמן שיש לך באותו שבוע. זה עובד גם לצד לימודים, שירות או עבודה.',
  },
  {
    question: 'אין לי רעיון מגובש, רק תחושה שיש בי יותר. זה בשבילי?',
    answer:
      'כן. שלב המיפוי בנוי בדיוק בשביל זה. נתחיל מהחוזקות שלך ומהדברים שאנשים כבר פונים אליך בגללם, ומשם נבנה כיוון.',
  },
  {
    question: 'ומה אם מה שתוקע אותי זה בכלל הראש שלי?',
    answer:
      'לרוב זה בדיוק ככה, ולכן שבירת תבניות היא חלק מרכזי בליווי. נזהה את הדפוסים שחוזרים אצלך, כמו דחיינות, פחד מביקורת או הצורך שהכול יהיה מושלם, ונבנה תגובה חדשה בעזרת כלים מ־CBT ו־NLP.',
  },
  {
    question: 'ומה אם קשה לי להתמיד?',
    answer: 'זה החלק שלנו. נבנה מערכת התמדה שמתאימה לך, והמשימה היומית דואגת שהתנופה לא תיעלם. ויש מישהי שמחכה לשמוע איך הלך.',
  },
  {
    question: 'כבר עשיתי קורסים וליווים. במה זה שונה?',
    answer: 'קורס מוסיף לך ידע. אנחנו עושות הפוך: מצמצמות לדבר אחד, ומוודאות שבכל שבוע משהו קורה בשטח ולא רק במחברת.',
  },
]

function PlusIcon({ open }: { open: boolean }) {
  return (
    <motion.svg width="21" height="21" viewBox="0 0 21 21" fill="none" animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3 }} aria-hidden="true">
      <path d="M10.5 2v17M2 10.5h17" stroke="#f4efe6" strokeWidth="1.7" strokeLinecap="round" />
    </motion.svg>
  )
}

function FaqCard({ item, id, isOpen, onToggle, index, isInView }: { item: FaqItem; id: string; isOpen: boolean; onToggle: () => void; index: number; isInView: boolean }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative overflow-hidden rounded-[26px] bg-soot lg:rounded-[34px]"
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(270deg, transparent 0%, transparent 70%, rgba(224,68,47,0.5) 100%)' }}
        initial={false}
        animate={{ clipPath: isHovered && !isOpen ? 'inset(0% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)' }}
        transition={{ duration: isHovered ? 1.2 : 0.5, ease: 'easeOut' }}
      />

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${id}-a`}
        className="relative flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-6 text-start lg:px-[2.5vw] lg:py-[2vw]"
      >
        <span className="font-sans text-[18px] font-semibold leading-[1.35] text-linen lg:text-[clamp(18px,1.25vw,24px)]">{item.question}</span>
        <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-[#262220] lg:h-[53px] lg:w-[53px] lg:rounded-[16px]">
          <PlusIcon open={isOpen} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${id}-a`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="relative overflow-hidden"
          >
            <p className="px-6 pb-6 font-sans text-[17px] leading-[1.55] text-linen/65 lg:px-[2.5vw] lg:pb-[2vw] lg:text-[clamp(17px,1.15vw,22px)]">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Faq() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  const [openId, setOpenId] = useState<number | null>(null)
  const toggle = (id: number) => setOpenId((current) => (current === id ? null : id))
  const columns = [items.slice(0, 3), items.slice(3)]

  return (
    <section id="faq" ref={ref} className="relative w-full bg-ink px-5 pb-24 pt-16 lg:px-[2.2vw] lg:pb-[8vw] lg:pt-[6vw]">
      <div className="mx-auto text-center">
        <AnimatedLines text="יש שאלה?" className="font-display text-[clamp(42px,5.5vw,106px)] leading-[1] text-linen" />
        <AnimatedLines text="מה ששואלים אותנו" baseDelay={0.1} className="font-display text-[clamp(42px,5.5vw,106px)] leading-[1] text-[#6f6a62]" />
      </div>

      <div className="mt-10 grid items-start gap-4 lg:mt-[2.8vw] lg:grid-cols-2 lg:gap-[1.4vw]">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-4 lg:gap-[1.4vw]">
            {col.map((item, i) => {
              const id = ci * 3 + i
              return <FaqCard key={item.question} id={`faq-${id}`} item={item} index={id} isInView={isInView} isOpen={openId === id} onToggle={() => toggle(id)} />
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

export default Faq
