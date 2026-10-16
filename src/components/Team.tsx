import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import AnimatedLines from './AnimatedLines'
import LogoMark from './LogoMark'
import { CONFIG } from '../lib/loop'

const HEADING = ['אנחנו לא עוד מנטוריות.', 'אנחנו המוח השני שלך.']
const BODY =
  'כשזה הרעיון שלך, קשה להסתכל עליו מבחוץ. הרצון שיהיה מושלם והפחד לטעות הם בדיוק מה שתוקע. אנחנו עושות את זה בשבילך: רואות את מה שקשה לראות מבפנים, ומחזיקות אותך בכיוון.'

// The two founders. Photos in public/images/ (portrait); `position` keeps the face inside the arch.
const mentors = [
  {
    name: 'רז בזק',
    role: 'מייסדת שותפה',
    field: 'שחקנית · יוצרת תוכן · פרילנסרית · מאמנת בשיטת CBT ו-NLP',
    photo: import.meta.env.BASE_URL + 'images/raz.jpg',
    position: '54% 22%',
    instagram: { url: CONFIG.instagramUrl, name: 'רז בזק | יוצאות מהלופ' },
    story: [] as string[],
  },
  {
    name: 'לבב מלכה',
    role: 'מייסדת שותפה',
    field: 'יזמות · ניהול עסקים · שיווק · מכירות · פסיכולוגיה · קופירייטינג · אסטרטגיה עסקית',
    photo: import.meta.env.BASE_URL + 'images/levav.jpg',
    position: '60% 30%',
    instagram: null,
    // Levav's own words (Israel's WhatsApp note, 16.10.2026)
    story: [
      '״היו לי אינסוף רעיונות, וכל אחד מהם הרגיש כמו הדבר הבא שלי. הייתי מתחילה משהו, משקיעה בו, חוקרת ולומדת, ואז פתאום היה צץ רעיון חדש שהלהיב אותי יותר, והייתי עוברת אליו. ככה מצאתי את עצמי קופצת בין כיוונים, מתחילה שוב ושוב, אבל מתקשה להתמיד בדרך אחת ולבנות ממנה משהו אמיתי.',
      'עד שהבנתי שאני לא צריכה עוד רעיון, אלא את היכולת לבחור כיוון, להתמקד בו ולהתחיל להפוך אותו למציאות. ומשם התפתחה יציאה מהלופ.״',
    ],
  },
]

function InstagramGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

const FIELDS_LABEL = 'כמה זוויות על אותו רעיון:'
const fields = ['עסקים', 'סושיאל', 'שיווק', 'מכירות', 'AI']
const NETWORK = 'ויש לנו קשרים עם אנשי מקצוע בתחומים שהעסק שלך יצטרך. נחבר אותך בדיוק למי שצריך.'
const CLOSER = 'יש המון דרכים להתחיל עסק. רק אחת מהן שלך, ואותה אנחנו מוצאות.'

const tones = ['#0e0d0c', '#a8321f', '#3f4a3a']

function Portrait({ mentor, index, isInView }: { mentor: (typeof mentors)[number]; index: number; isInView: boolean }) {
  return (
    <motion.figure
      className="m-0"
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, delay: index * 0.12, ease: 'easeOut' }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] lg:aspect-[1/1]" style={{ background: tones[index % tones.length] }}>
        {mentor.photo ? (
          <img src={mentor.photo} alt={mentor.name} loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: mentor.position }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-linen/70">
            <LogoMark size={64} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-[8px] rounded-t-[999px] border border-linen/20 sm:inset-[14px]" />
      </div>
      <figcaption className="mt-3 flex flex-col gap-1.5 border-t border-ink/30 pt-3">
        <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <span className="font-display text-[22px] leading-[1.1] text-ink sm:text-[clamp(26px,2.3vw,40px)]">{mentor.name}</span>
          <span className="font-sans-tight text-[14px] font-medium text-ink/70 sm:text-[15px]">{mentor.role}</span>
        </span>
        <span className="font-sans text-[14px] leading-[1.5] text-ink/70 sm:text-[16px]">{mentor.field}</span>
        {mentor.instagram && (
          <a
            href={mentor.instagram.url}
            target="_blank"
            rel="noopener"
            className="mt-1 inline-flex min-h-[44px] items-center gap-2 self-start font-sans-tight text-[14px] font-semibold text-ink/80 underline-offset-4 hover:underline sm:text-[15px]"
          >
            <InstagramGlyph />
            {mentor.instagram.name}
          </a>
        )}
      </figcaption>
    </motion.figure>
  )
}

function Team() {
  const gridRef = useRef<HTMLDivElement>(null)
  const gridInView = useInView(gridRef, { once: true, amount: 0.2 })

  return (
    <section id="team" className="relative w-full bg-stone px-5 py-20 text-ink lg:px-[3.2vw] lg:py-[8vw]">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-[4vw]">
        <div>
          <h2>
            {HEADING.map((line, i) => (
              <AnimatedLines key={line} text={line} baseDelay={i * 0.08} className={`font-display text-[clamp(42px,5.4vw,106px)] leading-[1.02] ${i === 1 ? 'font-light text-claret-deep' : ''}`} />
            ))}
          </h2>
        </div>
        <div className="flex items-end">
          <AnimatedLines text={BODY} className="max-w-[640px] font-sans text-[18px] leading-[1.55] text-ink/80 lg:text-[clamp(18px,1.3vw,25px)]" baseDelay={0.2} />
        </div>
      </div>

      <div ref={gridRef} className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:mt-[5vw] lg:gap-[2.4vw]">
        {mentors.map((m, i) => (
          <Portrait key={i} mentor={m} index={i} isInView={gridInView} />
        ))}
      </div>

      {mentors
        .filter((m) => m.story.length > 0)
        .map((m) => (
          <motion.figure
            key={m.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="m-0 mt-12 grid gap-4 border-t border-ink/30 pt-6 lg:mt-[4vw] lg:grid-cols-[1fr_2fr] lg:gap-[4vw] lg:pt-[2.4vw]"
          >
            <figcaption className="font-display text-[26px] leading-[1.1] text-ink sm:text-[clamp(26px,2.3vw,40px)]">
              {m.name}
              <span className="mt-1 block font-sans-tight text-[14px] font-medium text-ink/70 sm:text-[15px]">איך הגיעה ליציאה מהלופ</span>
            </figcaption>
            <blockquote className="m-0 max-w-[760px] space-y-4 font-sans text-[18px] leading-[1.6] text-ink/80 lg:text-[clamp(18px,1.3vw,24px)]">
              {m.story.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </blockquote>
          </motion.figure>
        ))}

      <div className="mt-14 grid gap-8 lg:mt-[5vw] lg:grid-cols-2 lg:gap-[4vw]">
        <div>
          <p className="font-sans-tight text-[15px] font-medium text-ink/60">{FIELDS_LABEL}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {fields.map((f, i) => (
              <motion.span
                key={f}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
                className="rounded-full border border-ink/40 px-5 py-2 font-sans-tight text-[17px] font-medium"
              >
                {f}
              </motion.span>
            ))}
          </div>
          <AnimatedLines text={NETWORK} className="mt-6 max-w-[520px] font-sans text-[17px] leading-[1.55] text-ink/75" />
        </div>
        <AnimatedLines text={CLOSER} className="font-display text-[clamp(30px,3vw,58px)] leading-[1.1]" />
      </div>
    </section>
  )
}

export default Team
