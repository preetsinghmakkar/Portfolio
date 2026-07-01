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
          name
          url
          stargazerCount
          forkCount
          isArchived
          pushedAt
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
  }
`
