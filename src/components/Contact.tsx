import { useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react'
import AnimatedLines from './AnimatedLines'
import LogoMark from './LogoMark'
import useIsMobile from '../hooks/useIsMobile'
import { CONFIG, loopPoints, smooth, toPath } from '../lib/loop'
import { visitorData } from '../lib/visitor'

const HEADING = 'זה הזמן לצאת מהלופ.'
const SUB = 'משאירים פרטים, ואנחנו חוזרות אליך לתיאום שיחת מיפוי של 20 דקות. או שולחים לנו הודעה בווטסאפ.'
const NOTE = 'אנחנו מלוות מספר קטן של אנשים בכל פעם, כדי שכל אחד ואחת יקבלו יחס אישי אמיתי.'
const stageOptions = ['יש לי רעיון ונתקעתי', 'יש לי כמה רעיונות וקשה לי לבחור', 'יש בי יותר, חסר לי כיוון']
const goalOptions = ['הכנסה צדדית קבועה', 'לבנות עסק', 'עוד לא ברור לי']

const LINE_W = 1600
const LINE_H = 260

/** The loop line, straightening out as the section scrolls into view. */
// Frames are quantised and cached, so scrolling never rebuilds the 720-point line twice for the same frame.
const STRAIGHT_STEPS = 48
const straightCache = new Map<number, string>()
function straightPath(step: number) {
  let d = straightCache.get(step)
  if (!d) {
    const p = step / STRAIGHT_STEPS
    const pts = loopPoints(LINE_W, LINE_H, { straight: (u) => 1 - smooth(u - 0.25, u + 0.15, p * 1.4) })
    d = toPath(pts.filter((_, i) => i % 3 === 0))
    straightCache.set(step, d)
  }
  return d
}

function StraighteningLoop() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const d = useTransform(scrollYProgress, (p) => straightPath(Math.round(p * STRAIGHT_STEPS)))
  const end = useMemo(() => loopPoints(LINE_W, LINE_H)[720], [])
  const dotScale = useTransform(scrollYProgress, [0.75, 1], [0, 1])

  return (
    <div ref={ref} className="pointer-events-none absolute inset-x-0 top-[24px] h-[90px] lg:top-[2vw] lg:h-[8vw]">
      <svg viewBox={`0 0 ${LINE_W} ${LINE_H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" fill="none" aria-hidden="true">
        <motion.path d={d} stroke="rgba(244,239,230,0.28)" strokeWidth={2.4} strokeLinecap="round" />
        <motion.circle cx={end[0]} cy={end[1]} r={8} fill="#e0442f" style={{ scale: dotScale, transformOrigin: `${end[0]}px ${end[1]}px` }} />
      </svg>
    </div>
  )
}

const ARCH = { outer: '50% 50% 30px 30px / 150px 150px 30px 30px', inner: '50% 50% 21px 21px / 141px 141px 21px 21px' }
const ARCH_MOBILE = { outer: '50% 50% 26px 26px / 110px 110px 26px 26px', inner: '50% 50% 18px 18px / 102px 102px 18px 18px' }

/** A radio row with a hand-sized target: a fine ring that fills red when chosen. */
function Choice({ name, options, value, onChange, legend }: { name: string; options: string[]; value: string; onChange: (v: string) => void; legend: string }) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="font-sans-tight text-[15px] font-semibold tracking-[0.02em] text-ink/65">{legend}</legend>
      <div className="mt-2 divide-y divide-ink/10 border-y border-ink/10">
        {options.map((o) => {
          const active = value === o
          return (
            <label key={o} className="group flex min-h-[52px] cursor-pointer items-center gap-3 py-3">
              <input type="radio" name={name} value={o} checked={active} onChange={() => onChange(o)} className="peer sr-only" />
              <span
                className={`relative flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-claret peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-linen ${
                  active ? 'border-claret' : 'border-ink/35 group-hover:border-ink'
                }`}
                aria-hidden="true"
              >
                <motion.span className="h-[10px] w-[10px] rounded-full bg-claret" initial={false} animate={{ scale: active ? 1 : 0 }} transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }} />
              </span>
              <span className={`font-display text-[19px] leading-[1.25] transition-colors ${active ? 'text-ink' : 'text-ink/75 group-hover:text-ink'}`}>{o}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** An underline field, like a printed invitation: serif text, a fine rule that turns red while typing. */
function Field({ label, hint, error, id, children }: { label: string; hint?: string; error?: string; id: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="font-sans-tight text-[15px] font-semibold tracking-[0.02em] text-ink/65">
        {label}
        {hint && <span className="ms-1 font-normal tracking-normal text-ink/55">{hint}</span>}
      </label>
      <div className="relative mt-1">
        {children}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] origin-right scale-x-0 bg-claret transition-transform duration-500 ease-out peer-focus:scale-x-100" aria-hidden="true" />
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 font-sans text-[14px] font-medium text-claret-deep">
          {error}
        </p>
      )}
    </div>
  )
}

const lineInput =
  'peer block w-full border-0 border-b bg-transparent px-0 pb-2 pt-1 font-display text-[22px] text-ink outline-none transition-colors placeholder:text-ink/30'

type FieldKey = 'name' | 'phone' | 'email'
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

function send(body: Record<string, unknown>) {
  if (!CONFIG.leadsEndpoint) return
  fetch(CONFIG.leadsEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  }).catch(() => {})
}

/**
 * The "שיחת מיפוי" form: used inside the pop-up (any "שיחת מיפוי" button) and at the bottom of the page.
 * Two ways out: "קביעת שיחה" saves it and emails both sides; "שליחה בווטסאפ" opens WhatsApp with a ready message.
 */
export function LeadForm({ openedFrom = 'כפתור שיחת מיפוי', framed = true, onClose }: { openedFrom?: string; framed?: boolean; onClose?: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState('')
  const [goal, setGoal] = useState('')
  const [idea, setIdea] = useState('')
  const [error, setError] = useState<{ field: FieldKey; text: string } | null>(null)
  const [done, setDone] = useState<'' | 'form' | 'whatsapp'>('')
  const [waUrl, setWaUrl] = useState('')
  const refs = { name: useRef<HTMLInputElement>(null), phone: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null) }
  const isMobile = useIsMobile()
  const arch = isMobile ? ARCH_MOBILE : ARCH
  const uid = useId()

  const fail = (field: FieldKey, text: string) => {
    setError({ field, text })
    refs[field].current?.focus()
    return false
  }

  const check = (needEmail: boolean) => {
    if (!name.trim()) return fail('name', 'חסר שם. איך קוראים לך?')
    if (phone.replace(/\D/g, '').length < 9) return fail('phone', 'מספר הטלפון קצר מדי. כדאי לבדוק שהוקלד במלואו.')
    if (needEmail && !email.trim()) return fail('email', 'חסר מייל. לשם נשלח את האישור.')
    if (email.trim() && !validEmail(email)) return fail('email', 'המייל לא נראה תקין. כדאי לבדוק שאין רווח או אות חסרה.')
    setError(null)
    return true
  }

  const payload = (channel: 'form' | 'whatsapp') => ({
    type: 'contact',
    channel,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    stage,
    goal,
    idea: idea.trim(),
    ...visitorData(openedFrom),
  })

  const book = (e: FormEvent) => {
    e.preventDefault()
    if (!check(true)) return
    send(payload('form'))
    setDone('form')
  }

  const whatsapp = () => {
    if (!check(false)) return
    const lines = [`היי! אני ${name.trim()} ואשמח לתאם שיחת מיפוי ✨`, `טלפון: ${phone.trim()}`]
    if (email.trim()) lines.push(`מייל: ${email.trim()}`)
    if (stage) lines.push(`איפה זה עומד: ${stage}`)
    if (goal) lines.push(`המטרה שלי: ${goal}`)
    if (idea.trim()) lines.push(`הרעיון: ${idea.trim()}`)
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`
    // Opened first, in the click itself, so the browser does not block it as a pop-up.
    window.open(url, '_blank', 'noopener')
    send(payload('whatsapp'))
    setWaUrl(url)
    setDone('whatsapp')
  }

  const rule = (invalid: boolean) => (invalid ? 'border-claret' : 'border-ink/25 hover:border-ink/50')
  const errFor = (f: FieldKey) => (error?.field === f ? error.text : undefined)
  const id = (f: string) => `${uid}-${f}`
  const first = name.trim().split(/\s+/)[0]

  return (
    <form
      onSubmit={book}
      noValidate
      className={`relative px-6 pb-8 pt-[92px] text-ink sm:px-10 lg:px-[3vw] lg:pb-[2.8vw] lg:pt-[118px] ${framed ? '' : 'min-h-full'}`}
      style={{ borderRadius: arch.outer, background: 'linear-gradient(180deg, #f8f4ed 0%, #efe8dc 100%)', boxShadow: framed ? '0 40px 100px -30px rgba(0,0,0,0.65)' : 'none' }}
    >
      <span className="pointer-events-none absolute inset-[9px] border border-ink/15" style={{ borderRadius: arch.inner }} aria-hidden="true" />

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="סגירה"
          className="absolute left-1/2 top-[22px] z-10 flex h-[44px] w-[44px] -translate-x-1/2 cursor-pointer items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink lg:top-[30px]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <div className="relative text-center">
        <span className="mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-full bg-ink text-linen" aria-hidden="true">
          <LogoMark size={30} />
        </span>
        <h3 className="mt-4 font-display text-[34px] leading-[1.05] lg:text-[clamp(34px,2.6vw,46px)]">{done ? (done === 'form' ? `קיבלנו${first ? `, ${first}` : ''}!` : 'נשאר רק ללחוץ שליחה') : 'שיחת מיפוי'}</h3>
        {!done && <p className="mt-2 font-sans text-[15px] text-ink/65">20 דקות · בלי התחייבות</p>}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="relative mt-6 text-center" aria-live="polite">
            {done === 'form' ? (
              <>
                <p className="mx-auto max-w-[36ch] font-display text-[22px] leading-[1.35]">נחזור אליך בימים הקרובים לתאם את השיחה.</p>
                <p className="mx-auto mt-3 max-w-[40ch] font-sans text-[15px] text-ink/65">
                  שלחנו אישור ל־<span dir="ltr">{email.trim()}</span>. לא הגיע? כדאי להציץ בתיקיית הקידומי מכירות או הספאם.
                </p>
              </>
            ) : (
              <p className="mx-auto max-w-[38ch] font-sans text-[16px] leading-[1.5] text-ink/75">
                ווטסאפ נפתח עם ההודעה מוכנה. אם לא נפתח לבד,{' '}
                <a href={waUrl} target="_blank" rel="noopener" className="font-semibold text-claret-deep underline underline-offset-4">
                  אפשר ללחוץ כאן
                </a>
                .
              </p>
            )}
            {onClose && (
              <button type="button" onClick={onClose} className="mx-auto mt-8 flex h-[52px] cursor-pointer items-center justify-center rounded-full border border-ink/25 px-8 font-sans-tight text-[17px] font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-linen">
                חזרה לאתר
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <div className="relative mt-8 grid gap-6 sm:grid-cols-2 sm:gap-x-8">
              <Field id={id('name')} label="איך קוראים לך?" error={errFor('name')}>
                <input
                  id={id('name')}
                  ref={refs.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  aria-invalid={!!errFor('name') || undefined}
                  aria-describedby={errFor('name') ? `${id('name')}-err` : undefined}
                  className={`${lineInput} ${rule(!!errFor('name'))}`}
                />
              </Field>
              <Field id={id('phone')} label="מספר טלפון" error={errFor('phone')}>
                <input
                  id={id('phone')}
                  ref={refs.phone}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="050-0000000"
                  aria-invalid={!!errFor('phone') || undefined}
                  aria-describedby={errFor('phone') ? `${id('phone')}-err` : undefined}
                  className={`${lineInput} text-right ${rule(!!errFor('phone'))}`}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field id={id('email')} label="מייל" hint="(לשם נשלח אישור)" error={errFor('email')}>
                  <input
                    id={id('email')}
                    ref={refs.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    dir="ltr"
                    placeholder="name@gmail.com"
                    aria-invalid={!!errFor('email') || undefined}
                    aria-describedby={errFor('email') ? `${id('email')}-err` : undefined}
                    className={`${lineInput} text-right ${rule(!!errFor('email'))}`}
                  />
                </Field>
              </div>
            </div>

            <div className="relative mt-8 grid gap-7 sm:grid-cols-2 sm:gap-x-8">
              <Choice name={id('stage')} legend="איפה זה עומד עכשיו?" options={stageOptions} value={stage} onChange={setStage} />
              <Choice name={id('goal')} legend="מה המטרה שלך?" options={goalOptions} value={goal} onChange={setGoal} />
            </div>

            <div className="relative mt-8">
              <Field id={id('idea')} label="משפט אחד על הרעיון" hint="(לא חובה)">
                <textarea id={id('idea')} value={idea} onChange={(e) => setIdea(e.target.value)} rows={1} className={`${lineInput} resize-none text-[20px] [field-sizing:content] ${rule(false)}`} />
              </Field>
            </div>

            <div className="relative mt-9 grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                className="group flex h-[60px] w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-ink font-sans-tight text-[18px] font-semibold text-linen transition-colors duration-300 hover:bg-claret-deep active:scale-[0.99]"
              >
                קביעת שיחה
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">
                  <path d="M19 7H2M7.5 1.5 2 7l5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={whatsapp}
                className="flex h-[60px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-ink/30 font-sans-tight text-[18px] font-semibold text-ink transition-colors duration-300 hover:border-[#1f8f4e] hover:bg-[#1f8f4e] hover:text-linen active:scale-[0.99]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4.1 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z" />
                </svg>
                שליחה בווטסאפ
              </button>
            </div>
            <p className="relative mt-3 text-center font-sans text-[14px] leading-[1.45] text-ink/60">"קביעת שיחה" שולחת לנו את הפרטים ואישור למייל שלך. "ווטסאפ" פותח הודעה מוכנה אלינו.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

/** In place of the form: one button that opens the registration window (ContactModal catches #contact links). */
function CallCard() {
  const isMobile = useIsMobile()
  const arch = isMobile ? ARCH_MOBILE : ARCH
  return (
    <div
      className="relative px-6 pb-9 pt-[92px] text-center text-ink sm:px-10 lg:px-[3vw] lg:pb-[3vw] lg:pt-[118px]"
      style={{ borderRadius: arch.outer, background: 'linear-gradient(180deg, #f8f4ed 0%, #efe8dc 100%)', boxShadow: '0 40px 100px -30px rgba(0,0,0,0.65)' }}
    >
      <span className="pointer-events-none absolute inset-[9px] border border-ink/15" style={{ borderRadius: arch.inner }} aria-hidden="true" />
      <span className="relative mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-full bg-ink text-linen" aria-hidden="true">
        <LogoMark size={30} />
      </span>
      <h3 className="relative mt-4 font-display text-[34px] leading-[1.05] lg:text-[clamp(34px,2.6vw,46px)]">שיחת מיפוי</h3>
      <p className="relative mt-2 font-sans text-[15px] text-ink/65">20 דקות · בלי התחייבות</p>
      <p className="relative mx-auto mt-6 max-w-[34ch] font-display text-[21px] leading-[1.4] text-ink/80">דקה למלא פרטים, ואנחנו חוזרות אליך לתאם. אפשר גם לשלוח לנו הודעה בווטסאפ.</p>
      <a
        href="#contact"
        className="group relative mt-8 flex h-[60px] w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-ink font-sans-tight text-[18px] font-semibold text-linen transition-colors duration-300 hover:bg-claret-deep active:scale-[0.99]"
      >
        לתיאום שיחת מיפוי
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">
          <path d="M19 7H2M7.5 1.5 2 7l5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  )
}

function Contact() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="contact" ref={ref} className="relative w-full overflow-hidden bg-ink px-5 pb-20 pt-[130px] text-linen lg:px-[3.2vw] lg:pb-[7vw] lg:pt-[11vw]">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(45% 40% at 12% 18%, rgba(224,68,47,0.25), rgba(224,68,47,0) 70%)' }} />
      <StraighteningLoop />

      <div className="relative grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-[5vw]">
        <div className="lg:sticky lg:top-[12vh]">
          <AnimatedLines text={HEADING} className="font-display text-[clamp(52px,7.4vw,150px)] leading-[0.98]" baseDelay={0.08} />
          <AnimatedLines text={SUB} className="mt-6 max-w-[520px] font-sans-tight text-[20px] leading-[1.4] lg:text-[clamp(20px,1.7vw,32px)]" baseDelay={0.2} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-5 max-w-[460px] font-sans text-[16px] leading-[1.5] text-linen/60 lg:text-[clamp(16px,1.1vw,20px)]"
          >
            {NOTE}
          </motion.p>
          <motion.a
            href={CONFIG.instagramUrl}
            target="_blank"
            rel="noopener"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-4 inline-flex min-h-[44px] items-center font-sans-tight text-[16px] font-medium text-linen underline decoration-linen/40 underline-offset-4 hover:decoration-linen"
          >
            נוח יותר באינסטגרם? שלחו לנו "לופ" בהודעה פרטית
          </motion.a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          <CallCard />
        </motion.div>
      </div>
    </section>
  )
}

export default Contact
