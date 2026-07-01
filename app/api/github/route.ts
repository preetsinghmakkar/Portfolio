import { NextResponse } from 'next/server'
import { fetchGitHubData } from '@/lib/github'

export const revalidate = 3600

export async function GET() {
  const data = await fetchGitHubData()
  return NextResponse.json(data)
}
