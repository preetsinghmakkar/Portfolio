export type ContributionLevel =
  | 'NONE'
  | 'FIRST_QUARTILE'
  | 'SECOND_QUARTILE'
  | 'THIRD_QUARTILE'
  | 'FOURTH_QUARTILE'

export interface ContributionDay {
  date: string
  contributionCount: number
  contributionLevel: ContributionLevel
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface LanguageData {
  name: string
  color: string
  percentage: number
}

export interface RecentCommit {
  repo: string
  repoUrl: string
  message: string
  committedDate: string
  commitUrl: string
  sha: string
}

export interface ActiveRepo {
  name: string
  url: string
  language: string
  languageColor: string
  stars: number
  forks: number
  pushedAt: string
}

export interface GitHubMetrics {
  totalContributions: number
  currentStreak: number
  longestStreak: number
  totalRepositories: number
  followers: number
  following: number
  totalStars: number
  totalForks: number
  pullRequests: number
  issues: number
  mostActiveRepo: string
  mostActiveRepoUrl: string
  latestCommitMessage: string
  latestCommitSha: string
  latestCommitUrl: string
  latestPushDate: string
  defaultBranch: string
  apiLatency: number
  rateLimitRemaining: number
  rateLimitTotal: number
}


export interface GitHubData {
  weeks: ContributionWeek[]
  metrics: GitHubMetrics
  languages: LanguageData[]
  recentCommits: RecentCommit[]
  activeRepos: ActiveRepo[]
  fetchedAt: string
}
