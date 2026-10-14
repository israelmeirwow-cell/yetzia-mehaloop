/**
 * Where a visitor came from and how they used the site, sent with every "שיחת מיפוי" request
 * so the team email and the sheet show the full picture. Nothing leaves the browser until the form is sent.
 */

const PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ttclid'] as const
const SESSION_KEY = 'ootl-visit'
const LOCAL_KEY = 'ootl-visitor'

interface Session {
  params: Record<string, string>
  referrer: string
  landing: string
  start: number
  maxScroll: number
}

interface Local {
  firstVisit: number
  visits: number
  firstSource: string
}

let session: Session | null = null

function read<T>(store: Storage, key: string): T | null {
  try {
    const raw = store.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(store: Storage, key: string, v: unknown) {
  try {
    store.setItem(key, JSON.stringify(v))
  } catch {
    /* storage can be blocked; tracking is a nice-to-have */
  }
}

/** A readable name for where the visit came from. */
function sourceLabel(params: Record<string, string>, referrer: string) {
  const host = (() => {
    try {
      return referrer ? new URL(referrer).hostname.replace(/^www\./, '') : ''
    } catch {
      return ''
    }
  })()
  const s = (params.utm_source || '').toLowerCase()
  const paid = /cpc|paid|ads?$/.test((params.utm_medium || '').toLowerCase()) || !!params.fbclid || !!params.gclid || !!params.ttclid
  const tag = paid ? ' (ממומן)' : ''
  if (s.includes('ig') || s.includes('instagram') || host.includes('instagram')) return 'אינסטגרם' + tag
  if (s.includes('fb') || s.includes('facebook') || host.includes('facebook') || params.fbclid) return 'פייסבוק' + tag
  if (s.includes('tiktok') || host.includes('tiktok') || params.ttclid) return 'טיקטוק' + tag
  if (s.includes('google') || host.includes('google') || params.gclid) return 'גוגל' + tag
  if (s.includes('whatsapp') || host.includes('whatsapp') || host === 'wa.me') return 'ווטסאפ'
  if (params.utm_source) return params.utm_source + tag
  if (host) return host
  return 'כניסה ישירה (קישור, הקלדה או אפליקציה)'
}

function device() {
  const ua = navigator.userAgent
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'אחר'
  const inApp = /Instagram/.test(ua) ? 'בתוך אינסטגרם' : /FBAN|FBAV/.test(ua) ? 'בתוך פייסבוק' : /TikTok|musical_ly/i.test(ua) ? 'בתוך טיקטוק' : ''
  const browser = inApp || (/Edg\//.test(ua) ? 'Edge' : /SamsungBrowser/.test(ua) ? 'Samsung' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : 'אחר')
  const kind = window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 768 ? 'טלפון' : 'מחשב'
  return `${kind} · ${os} · ${browser} · ${screen.width}×${screen.height}`
}

function onScroll() {
  if (!session) return
  const h = document.documentElement
  const pct = Math.round(((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100)
  if (pct > session.maxScroll) {
    session.maxScroll = Math.min(100, pct)
    write(sessionStorage, SESSION_KEY, session)
  }
}

/** Call once when the app starts. */
export function startVisitor() {
  if (session) return
  const params: Record<string, string> = {}
  try {
    const q = new URLSearchParams(window.location.search)
    PARAM_KEYS.forEach((k) => {
      const v = q.get(k)
      if (v) params[k] = v
    })
  } catch {
    /* ignore */
  }
  const prev = read<Session>(sessionStorage, SESSION_KEY)
  session = prev
    ? { ...prev, params: { ...prev.params, ...params } }
    : { params, referrer: document.referrer, landing: window.location.pathname + window.location.search, start: Date.now(), maxScroll: 0 }
  write(sessionStorage, SESSION_KEY, session)

  if (!prev) {
    const local = read<Local>(localStorage, LOCAL_KEY)
    write(localStorage, LOCAL_KEY, local ? { ...local, visits: local.visits + 1 } : { firstVisit: Date.now(), visits: 1, firstSource: sourceLabel(params, document.referrer) })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
}

const fmtDate = (t: number) =>
  new Date(t).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function duration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s} שניות`
  const m = Math.floor(s / 60)
  return m < 60 ? `${m} דק׳ ו־${s % 60} שנ׳` : `${Math.floor(m / 60)} שע׳ ו־${m % 60} דק׳`
}

/** Everything known about this visit, as flat fields for the sheet and the email. */
export function visitorData(openedFrom: string): Record<string, string> {
  const s = session ?? read<Session>(sessionStorage, SESSION_KEY)
  const local = read<Local>(localStorage, LOCAL_KEY)
  const params = s?.params ?? {}
  return {
    source: sourceLabel(params, s?.referrer ?? ''),
    ...params,
    referrer_url: s?.referrer || '',
    landing: s?.landing || '',
    opened_from: openedFrom,
    time_on_site: s ? duration(Date.now() - s.start) : '',
    scroll_depth: s ? `${s.maxScroll}%` : '',
    visits: local ? String(local.visits) : '',
    first_visit: local ? fmtDate(local.firstVisit) : '',
    first_source: local?.firstSource || '',
    device: device(),
    language: navigator.language || '',
    page: window.location.href,
  }
}
