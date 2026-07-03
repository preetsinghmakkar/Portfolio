const REPO_FIELDS = `
  name
  url
  stargazerCount
  forkCount
  isArchived
  pushedAt
  owner { login }
  defaultBranchRef {
    name
    target {
      ... on Commit {
        history(first: 2) {
          nodes {
            messageHeadline
            committedDate
            url
            abbreviatedOid
          }
        }
      }
    }
  }
  languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
    edges {
      size
      node { name color }
    }
  }
`

export const GITHUB_TELEMETRY_QUERY = `
  query GitHubTelemetry($username: String!, $from: DateTime!, $to: DateTime!) {
    rateLimit { limit remaining resetAt }
    user(login: $username) {
      followers { totalCount }
      following { totalCount }
      pullRequests { totalCount }
      issues { totalCount }
      repositories(
        first: 100
        ownerAffiliations: OWNER
        privacy: PUBLIC
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        totalCount
        nodes {
          ${REPO_FIELDS}
        }
      }
      contributionsCollection(from: $from, to: $to) {
        commitContributionsByRepository(maxRepositories: 1) {
          repository { name url }
          contributions { totalCount }
        }
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
    revvfi: organization(login: "RevvFi") {
      repositories(first: 20, privacy: PUBLIC, isFork: false, orderBy: { field: PUSHED_AT, direction: DESC }) {
        nodes {
          ${REPO_FIELDS}
        }
      }
    }
    vesperInterchain: organization(login: "Vesper-Interchain") {
      repositories(first: 20, privacy: PUBLIC, isFork: false, orderBy: { field: PUSHED_AT, direction: DESC }) {
        nodes {
          ${REPO_FIELDS}
        }
      }
    }
  }
`
