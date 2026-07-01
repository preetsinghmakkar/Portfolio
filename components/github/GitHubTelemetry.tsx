'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, animate, useMotionValue, useTransform, useInView } from 'framer-motion'
import { ExternalLink, Star, GitFork } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/MotionWrapper'
import type { GitHubData, GitHubMetrics, LanguageData, RecentCommit, ActiveRepo, ContributionWeek } from '@/types/github'

const Heatmap3D = dynamic(() => import('./Heatmap3D'), {
  ssr: false,
  loading: () => (
    <div className="h-[340px] sm:h-[380px] lg:h-[440px] flex items-center justify-center bg-transparent">
      <span className="font-mono text-[11px] tracking-widest text-[#4b5563] animate-pulse">INITIALISING 3D SCENE...</span>
    </div>
  ),
})

// ── localStorage cache (60-min TTL, stale-while-revalidate at 30 min) ─────────

const CACHE_KEY         = 'gh_telemetry_v2'
const CACHE_TTL_MS      = 60 * 60 * 1000   // hard expiry — force fresh fetch
const CACHE_STALE_MS    = 30 * 60 * 1000   // soft expiry — serve stale, revalidate in background

interface CacheEntry { data: GitHubData; savedAt: number }

function readCache(): { data: GitHubData; ageMs: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    const ageMs = Date.now() - entry.savedAt
    if (ageMs > CACHE_TTL_MS) { localStorage.removeItem(CACHE_KEY); return null }
    return { data: entry.data, ageMs }
  } catch { return null }
}

function writeCache(data: GitHubData): void {
  if (typeof window === 'undefined') return
  try {
    const entry: CacheEntry = { data, savedAt: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch { /* quota exceeded or private browsing — no-op */ }
}

function formatCacheAge(ms: number): string {
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

// ── Utilities ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  const w = Math.floor(d / 7)
  return `${w}w ago`
}

function makeBar(pct: number, total = 14): string {
  const filled = Math.max(1, Math.round((pct / 100) * total))
  return '█'.repeat(filled) + '░'.repeat(total - filled)
}

// ── Terminal boot sequence ─────────────────────────────────────────────────────

const BOOT_STEPS = [
  'Initializing GitHub GraphQL API...',
  'Authenticating with personal access token...',
  'Loading repository manifest...',
  'Fetching contribution calendar...',
  'Aggregating language statistics...',
  'Rendering 3D contribution scene...',
  'Engineering metrics online.',
]

function LoadingTerminal() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= BOOT_STEPS.length - 1) return
    const t = setTimeout(() => setStep(s => s + 1), 420)
    return () => clearTimeout(t)
  }, [step])

  return (
    <div className="rounded-xl border border-white/7 bg-[#0d0d0d] p-6 sm:p-8">
      {/* Terminal chrome */}
      <div className="flex items-center gap-1.5 mb-6">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[10px] tracking-widest text-[#4b5563]">github-telemetry.sh</span>
      </div>
      <div className="space-y-3 min-h-[180px]">
        {BOOT_STEPS.slice(0, step + 1).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <span className="text-accent font-bold shrink-0">›</span>
            <span className={`font-mono text-[11px] sm:text-xs ${i < step ? 'text-[#9ca3af]' : 'text-white'}`}>
              {line}
            </span>
            {i < step && (
              <span className="ml-auto font-mono text-[10px] text-accent shrink-0">✓</span>
            )}
            {i === step && step < BOOT_STEPS.length - 1 && (
              <span className="ml-auto h-3 w-1.5 bg-accent animate-pulse shrink-0" />
            )}
            {i === step && step === BOOT_STEPS.length - 1 && (
              <span className="ml-2 font-mono text-[10px] text-accent animate-pulse shrink-0">●</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Count-up ───────────────────────────────────────────────────────────────────

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const motionVal = useMotionValue(0)
  const display   = useTransform(motionVal, v => Math.round(v).toLocaleString())
  const ref       = useRef<HTMLSpanElement>(null)
  const inView    = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (inView) {
      const ctrl = animate(motionVal, value, { duration: 1.8, ease: 'easeOut' })
      return ctrl.stop
    }
  }, [inView, value, motionVal])

  return <><motion.span ref={ref}>{display}</motion.span>{suffix}</>
}

// ── Metric row with pulse ──────────────────────────────────────────────────────

function MetricRow({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        {inView && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="h-1 w-1 rounded-full bg-accent shrink-0"
          />
        )}
        <span className="font-mono text-[10px] tracking-widest text-[#6b7280] uppercase">{label}</span>
      </div>
      <span className={`font-mono text-sm font-bold tabular-nums ${accent ? 'text-accent' : 'text-white'}`}>
        <CountUp value={value} />
      </span>
    </div>
  )
}

// ── Right metrics panel ────────────────────────────────────────────────────────

function MetricsPanel({ metrics }: { metrics: GitHubMetrics }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Live badge */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="font-mono text-[10px] tracking-widest text-accent font-bold">LIVE ENGINEERING METRICS</span>
      </div>

      {/* Stats grid */}
      <div className="rounded-lg border border-white/7 bg-[#0d0d0d] px-5 py-4 flex-1">
        <MetricRow label="Contributions / yr" value={metrics.totalContributions} accent />
        <MetricRow label="Current Streak"      value={metrics.currentStreak} />
        <MetricRow label="Longest Streak"      value={metrics.longestStreak} />
        <MetricRow label="Public Repos"        value={metrics.totalRepositories} />
        <MetricRow label="Stars Earned"        value={metrics.totalStars} />
        <MetricRow label="Forks"               value={metrics.totalForks} />
        <MetricRow label="Pull Requests"       value={metrics.pullRequests} />
        <MetricRow label="Issues"              value={metrics.issues} />
      </div>

      {/* Engineering Status */}
      <div className="rounded-lg border border-white/7 bg-[#0d0d0d] p-5">
        <p className="font-mono text-[9px] tracking-[0.18em] text-[#6b7280] uppercase mb-4">Engineering Status</p>
        <div className="space-y-2.5 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[#6b7280]">STATUS</span>
            <span className="flex items-center gap-1.5 text-accent font-bold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6b7280]">SYNC</span>
            <span className="text-[#9ca3af]">{relativeTime(metrics.latestPushDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6b7280]">HEAD</span>
            <span className="text-accent">⌥ {metrics.defaultBranch}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6b7280]">COMMIT</span>
            <a href={metrics.latestCommitUrl} target="_blank" rel="noopener noreferrer"
               className="text-[#9ca3af] hover:text-accent transition-colors font-bold">
              {metrics.latestCommitSha}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6b7280]">ACTIVE REPO</span>
            <a href={metrics.mostActiveRepoUrl} target="_blank" rel="noopener noreferrer"
               className="text-accent hover:underline truncate max-w-[120px]">
              {metrics.mostActiveRepo}
            </a>
          </div>
          {metrics.apiLatency > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[#6b7280]">API LATENCY</span>
              <span className="text-[#9ca3af]">{metrics.apiLatency} ms</span>
            </div>
          )}
          {metrics.rateLimitRemaining > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[#6b7280]">RATE LIMIT</span>
              <span className="text-[#9ca3af]">
                {metrics.rateLimitRemaining.toLocaleString()} / {metrics.rateLimitTotal.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 border-l-2 border-accent/25 pl-3">
          <p className="font-mono text-[10px] text-[#9ca3af] italic leading-relaxed line-clamp-2">
            "{metrics.latestCommitMessage}"
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Terminal language bars ─────────────────────────────────────────────────────

function LanguageBars({ languages }: { languages: LanguageData[] }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  if (!languages.length) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-1.5">
            <div className="h-2 w-24 bg-white/5 rounded" />
            <div className="h-2.5 bg-white/4 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className="space-y-3.5 font-mono">
      {languages.map((lang, i) => (
        <div key={lang.name}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#9ca3af]">{lang.name}</span>
            <span className="text-[10px] text-[#6b7280]">{lang.percentage}%</span>
          </div>
          <motion.p
            className="text-[10px] tracking-tight"
            style={{ color: lang.color || '#00ff66' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            {inView
              ? makeBar(lang.percentage)
              : makeBar(0)}
          </motion.p>
        </div>
      ))}
    </div>
  )
}

// ── Terminal commit feed ───────────────────────────────────────────────────────

function CommitFeed({ commits }: { commits: RecentCommit[] }) {
  if (!commits.length) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-1.5">
            <div className="h-2.5 w-16 bg-white/5 rounded" />
            <div className="h-2 bg-white/4 rounded" />
            <div className="h-2 w-2/3 bg-white/4 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-0 font-mono text-[11px]">
      {commits.map((commit, i) => (
        <motion.div
          key={`${commit.sha}-${i}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <a
            href={commit.commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block px-2 py-2.5 -mx-2 rounded-md transition-all hover:bg-white/4"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-accent/80 group-hover:text-accent transition-colors font-bold shrink-0">
                {commit.sha}
              </span>
              <span className="text-[#6b7280] shrink-0">{relativeTime(commit.committedDate)}</span>
            </div>
            <p className="text-[#9ca3af] group-hover:text-white transition-colors leading-tight line-clamp-1">
              {commit.message}
            </p>
            <p className="text-[#4b5563] mt-0.5 text-[10px]">
              <span className="text-accent/60">▸</span> {commit.repo}
            </p>
          </a>
          {i < commits.length - 1 && (
            <div className="border-t border-white/5 my-0.5" />
          )}
        </motion.div>
      ))}
    </div>
  )
}

// ── Contribution timeline (last 7 days) ───────────────────────────────────────

function ContributionTimeline({ weeks }: { weeks: ContributionWeek[] }) {
  const last7 = useMemo(() => {
    const all = weeks.flatMap(w => w.contributionDays)
    return all.slice(-7).reverse()
  }, [weeks])

  if (!last7.length) return null

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <p className="font-mono text-[9px] tracking-[0.18em] text-[#6b7280] uppercase mb-3">Recent Activity</p>
      <div className="space-y-1.5 font-mono text-[10px]">
        {last7.slice(0, 5).map((day, i) => {
          const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`
          return (
            <div key={day.date} className="flex items-center justify-between">
              <span className="text-[#6b7280] w-24 shrink-0">{label}</span>
              <div className="flex items-center gap-2 flex-1 mx-3">
                <div className="h-[2px] flex-1 bg-white/5 overflow-hidden rounded">
                  <motion.div
                    className="h-full bg-accent/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (day.contributionCount / Math.max(1, last7[0]?.contributionCount ?? 1)) * 100)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                  />
                </div>
              </div>
              <span className="text-[#9ca3af] w-20 text-right shrink-0">
                {day.contributionCount} contrib{day.contributionCount !== 1 ? 's' : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Active repositories ────────────────────────────────────────────────────────

function ActiveRepos({ repos }: { repos: ActiveRepo[] }) {
  if (!repos.length) return null

  return (
    <div className="rounded-lg border border-white/7 bg-[#0d0d0d] p-6">
      <p className="font-mono text-[9px] tracking-[0.18em] text-[#6b7280] uppercase mb-5">
        ▸ Active Repositories
      </p>
      <div className="space-y-0">
        {repos.map((repo, i) => (
          <motion.div
            key={repo.name}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.07 }}
          >
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-3 -mx-2 px-2 rounded-md transition-all hover:bg-white/4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: repo.languageColor || '#6b7280' }}
                />
                <div className="min-w-0">
                  <p className="font-mono text-[12px] font-bold text-white group-hover:text-accent transition-colors truncate">
                    {repo.name}
                  </p>
                  <p className="font-mono text-[10px] text-[#6b7280]">
                    {repo.language} · {relativeTime(repo.pushedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4 font-mono text-[10px] text-[#6b7280]">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {repo.stars}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="h-3 w-3" />
                  {repo.forks}
                </span>
              </div>
            </a>
            {i < repos.length - 1 && <div className="border-t border-white/4" />}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Streak + follower stats card ───────────────────────────────────────────────

function StatsCard({ metrics }: { metrics: GitHubMetrics }) {
  return (
    <div className="rounded-lg border border-white/7 bg-[#0d0d0d] p-6 h-full">
      <p className="font-mono text-[9px] tracking-[0.18em] text-[#6b7280] uppercase mb-5">▸ Contribution Stats</p>
      <div className="space-y-5">
        <div>
          <p className="font-mono text-[10px] text-[#4b5563] mb-1">CURRENT STREAK</p>
          <p className="font-mono text-3xl font-extrabold text-accent">
            <CountUp value={metrics.currentStreak} suffix=" days" />
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-[#4b5563] mb-1">LONGEST STREAK</p>
          <p className="font-mono text-3xl font-extrabold text-white">
            <CountUp value={metrics.longestStreak} suffix=" days" />
          </p>
        </div>
        <div className="pt-4 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-[#4b5563]">FOLLOWERS</p>
            <p className="font-mono text-sm font-bold text-[#9ca3af]"><CountUp value={metrics.followers} /></p>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-[#4b5563]">FOLLOWING</p>
            <p className="font-mono text-sm font-bold text-[#9ca3af]"><CountUp value={metrics.following} /></p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Offline banner ─────────────────────────────────────────────────────────────

function OfflineBanner() {
  return (
    <div className="rounded-xl border border-white/7 bg-[#0d0d0d] p-10 sm:p-16 text-center">
      <p className="font-mono text-[11px] tracking-widest text-[#4b5563] mb-2">OFFLINE MODE</p>
      <p className="font-mono text-sm text-[#6b7280]">Using cached engineering data.</p>
      <p className="font-mono text-[10px] text-[#4b5563] mt-3">
        Set <code className="text-accent">GITHUB_TOKEN</code> in <code className="text-[#9ca3af]">.env.local</code> for live data.
      </p>
    </div>
  )
}

// ── Main section ───────────────────────────────────────────────────────────────

export function GitHubTelemetry() {
  const [data,      setData]      = useState<GitHubData | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(false)
  const [fromCache, setFromCache] = useState(false)
  const [cacheAge,  setCacheAge]  = useState(0)

  useEffect(() => {
    const cached = readCache()

    if (cached) {
      setData(cached.data)
      setFromCache(true)
      setCacheAge(cached.ageMs)
      setLoading(false)

      // Stale-while-revalidate: background refresh if cache is > 30 min old
      if (cached.ageMs > CACHE_STALE_MS) {
        fetch('/api/github')
          .then(r => r.json())
          .then((d: GitHubData) => { writeCache(d); setData(d); setFromCache(false) })
          .catch(() => { /* keep showing cached data on background failure */ })
      }
      return
    }

    // Cache miss — show loading terminal, then fetch
    fetch('/api/github')
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json() })
      .then((d: GitHubData) => { writeCache(d); setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  return (
    <section id="telemetry" className="relative py-24 sm:py-32 lg:py-40 border-t border-white/6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">

        {/* Header */}
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-accent mb-4">— ENGINEERING_TELEMETRY</p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-tight tracking-tighter text-white">
              GITHUB
              <br />
              <span className="text-[#374151]">ACTIVITY</span>
            </h2>
            <a
              href="https://github.com/preetsinghmakkar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded border border-white/8 px-4 py-2 font-mono text-[11px] tracking-widest text-[#9ca3af] transition-all hover:border-accent/40 hover:text-accent hover:shadow-[0_0_12px_rgba(0,255,102,0.12)]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              GITHUB PROFILE
            </a>
          </div>
          {!loading && !error && data && (
            <p className="mt-3 font-mono text-[10px] tracking-widest text-[#4b5563]">
              {fromCache
                ? `○ CACHED · ${formatCacheAge(cacheAge)}`
                : '● LIVE'}
            </p>
          )}
        </Reveal>

        {/* Loading terminal */}
        {loading && (
          <div className="mt-14">
            <LoadingTerminal />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-14"><OfflineBanner /></div>
        )}

        {/* Data loaded */}
        {!loading && !error && data && (
          <div className="mt-14 space-y-5">

            {/* Row 1: Heatmap (left) + Metrics (right) */}
            <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">

              {/* 3D Heatmap card */}
              <Reveal delay={0.05}>
                <div className="rounded-xl border border-white/7 bg-[#0d0d0d] overflow-hidden">
                  {/* Minimal header — no "contribution-heatmap-3d" text */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="font-mono text-[10px] text-[#4b5563]">
                      {data.metrics.totalContributions.toLocaleString()} contributions this year
                    </span>
                  </div>
                  <Heatmap3D weeks={data.weeks} />
                  {/* Contribution timeline inside heatmap card */}
                  {data.weeks.length > 0 && (
                    <div className="px-5 pb-5">
                      <ContributionTimeline weeks={data.weeks} />
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Metrics + Status */}
              <Reveal delay={0.15}>
                <MetricsPanel metrics={data.metrics} />
              </Reveal>
            </div>

            {/* Row 2: Languages | Commits | Streak stats */}
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              <StaggerItem>
                <div className="rounded-lg border border-white/7 bg-[#0d0d0d] p-6 h-full">
                  <p className="font-mono text-[9px] tracking-[0.18em] text-[#6b7280] uppercase mb-5">▸ Top Languages</p>
                  <LanguageBars languages={data.languages} />
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="rounded-lg border border-white/7 bg-[#0d0d0d] p-6 h-full">
                  <p className="font-mono text-[9px] tracking-[0.18em] text-[#6b7280] uppercase mb-5">▸ Recent Commits</p>
                  <CommitFeed commits={data.recentCommits} />
                </div>
              </StaggerItem>

              <StaggerItem className="sm:col-span-2 lg:col-span-1">
                <StatsCard metrics={data.metrics} />
              </StaggerItem>
            </Stagger>

            {/* Row 3: Active repositories — full width */}
            {data.activeRepos.length > 0 && (
              <Reveal delay={0.1}>
                <ActiveRepos repos={data.activeRepos} />
              </Reveal>
            )}

          </div>
        )}
      </div>
    </section>
  )
}
