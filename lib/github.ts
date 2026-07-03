import type { GitHubData, ContributionWeek, LanguageData, RecentCommit } from '@/types/github'
import { GITHUB_TELEMETRY_QUERY } from './githubQueries'

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const USERNAME = 'preetsinghmakkar'

interface RawCommit {
  messageHeadline: string
  committedDate: string
  url: string
  abbreviatedOid: string
}

interface RawRepo {
  name: string
  url: string
  stargazerCount: number
  forkCount: number
  isArchived: boolean
  pushedAt: string
  defaultBranchRef: {
    name: string
    target: { history: { nodes: RawCommit[] } }
  } | null
  languages: { edges: { size: number; node: { name: string; color: string } }[] }
}

interface RawResponse {
  user: {
    followers: { totalCount: number }
    following: { totalCount: number }
    pullRequests: { totalCount: number }
    issues: { totalCount: number }
    repositories: { totalCount: number; nodes: RawRepo[] }
    contributionsCollection: {
      commitContributionsByRepository: {
        repository: { name: string; url: string }
        contributions: { totalCount: number }
      }[]
      contributionCalendar: {
        totalContributions: number
        weeks: ContributionWeek[]
      }
    }
  }
}

function calculateStreaks(weeks: ContributionWeek[]) {
  const days = weeks.flatMap(w => w.contributionDays)
  let longest = 0, temp = 0, current = 0
  for (const day of days) {
    if (day.contributionCount > 0) { temp++; if (temp > longest) longest = temp } else temp = 0
  }
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) current++; else break
  }
  return { current, longest }
}

function aggregateLanguages(repos: RawRepo[]): LanguageData[] {
  const map = new Map<string, { size: number; color: string }>()
  for (const repo of repos) {
    if (repo.isArchived) continue
    for (const { size, node } of repo.languages.edges) {
      const ex = map.get(node.name)
      map.set(node.name, { size: (ex?.size ?? 0) + size, color: node.color ?? '#6b7280' })
    }
  }
  const sorted = [...map.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 6)
  const total = sorted.reduce((s, [, v]) => s + v.size, 0)
  return sorted.map(([name, { size, color }]) => ({
    name, color, percentage: Math.round((size / total) * 100),
  }))
}

function getRecentCommits(repos: RawRepo[]): RecentCommit[] {
  const commits: RecentCommit[] = []
  for (const repo of repos) {
    const nodes = repo.defaultBranchRef?.target?.history?.nodes
    if (!nodes) continue
    for (const c of nodes) {
      commits.push({
        repo: repo.name, repoUrl: repo.url,
        message: c.messageHeadline, committedDate: c.committedDate,
        commitUrl: c.url, sha: c.abbreviatedOid,
      })
    }
  }
  return commits
    .sort((a, b) => new Date(b.committedDate).getTime() - new Date(a.committedDate).getTime())
    .slice(0, 5)
}

export function createFallbackData(): GitHubData {
  return {
    weeks: [],
    metrics: {
      totalContributions: 0, currentStreak: 0, longestStreak: 0,
      totalRepositories: 0, followers: 0, following: 0,
      totalStars: 0, totalForks: 0, pullRequests: 0, issues: 0,
      mostActiveRepo: '—', mostActiveRepoUrl: '#',
      latestCommitMessage: '—',
      latestCommitSha: '000000', latestCommitUrl: '#',
      latestPushDate: new Date().toISOString(), defaultBranch: 'main',
      apiLatency: 0, rateLimitRemaining: 0, rateLimitTotal: 5000,
    },
    languages: [],
    recentCommits: [],
    fetchedAt: new Date().toISOString(),
  }
}

export async function fetchGitHubData(): Promise<GitHubData> {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.warn('[github] GITHUB_TOKEN not set — returning placeholder data')
    return createFallbackData()
  }

  const now = new Date()
  const oneYearAgo = new Date(now)
  oneYearAgo.setFullYear(now.getFullYear() - 1)

  try {
    const start = Date.now()
    const res = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GITHUB_TELEMETRY_QUERY,
        variables: { username: USERNAME, from: oneYearAgo.toISOString(), to: now.toISOString() },
      }),
      next: { revalidate: 3600 },
    })
    const apiLatency = Date.now() - start

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json.errors) throw new Error(json.errors[0].message)

    const rateLimit = json.data?.rateLimit ?? json.extensions?.rateLimit
    const rateLimitRemaining: number = rateLimit?.remaining ?? 5000
    const rateLimitTotal: number = rateLimit?.limit ?? 5000

    const { user } = json.data as RawResponse
    const { contributionsCollection, repositories } = user
    const { contributionCalendar, commitContributionsByRepository } = contributionsCollection
    const { weeks } = contributionCalendar
    const repos = repositories.nodes

    const { current: currentStreak, longest: longestStreak } = calculateStreaks(weeks)
    const totalStars = repos.reduce((s, r) => s + r.stargazerCount, 0)
    const totalForks = repos.reduce((s, r) => s + r.forkCount, 0)
    const mostActive = commitContributionsByRepository[0]
    const latestRepo = repos.find(r => r.defaultBranchRef?.target?.history?.nodes?.length)
    const latestCommit = latestRepo?.defaultBranchRef?.target?.history?.nodes?.[0]

    return {
      weeks,
      metrics: {
        totalContributions: contributionCalendar.totalContributions,
        currentStreak, longestStreak,
        totalRepositories: repositories.totalCount,
        followers: user.followers.totalCount,
        following: user.following.totalCount,
        totalStars, totalForks,
        pullRequests: user.pullRequests.totalCount,
        issues: user.issues.totalCount,
        mostActiveRepo: mostActive?.repository.name ?? latestRepo?.name ?? '—',
        mostActiveRepoUrl: mostActive?.repository.url ?? latestRepo?.url ?? '#',
        latestCommitMessage: latestCommit?.messageHeadline ?? '—',
        latestCommitSha: latestCommit?.abbreviatedOid ?? '—',
        latestCommitUrl: latestCommit?.url ?? '#',
        latestPushDate: latestCommit?.committedDate ?? now.toISOString(),
        defaultBranch: latestRepo?.defaultBranchRef?.name ?? 'main',
        apiLatency, rateLimitRemaining, rateLimitTotal,
      },
      languages: aggregateLanguages(repos),
      recentCommits: getRecentCommits(repos),
      fetchedAt: now.toISOString(),
    }
  } catch (err) {
    console.error('[github] API error:', err)
    return createFallbackData()
  }
}
