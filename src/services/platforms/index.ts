// Registry of per-platform profile-stats sync functions, keyed by Platform.
// The sync coordinator uses this to run every configured profile in one pass.

import type { Platform, Profile } from '@/lib/types'

import { syncCodeChef } from './codechef'
import { syncCodeforces } from './codeforces'
import { syncGFG } from './gfg'
import { syncGitHub } from './github'
import { syncHackerRank } from './hackerrank'
import { syncLeetCode } from './leetcode'

export type ProfileSyncFn = (username: string) => Promise<Partial<Profile>>

export const SYNC_FUNCTIONS: Record<Platform, ProfileSyncFn> = {
  leetcode: syncLeetCode,
  codeforces: syncCodeforces,
  codechef: syncCodeChef,
  hackerrank: syncHackerRank,
  geeksforgeeks: syncGFG,
  github: syncGitHub,
}