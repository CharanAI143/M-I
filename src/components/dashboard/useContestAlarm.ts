import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store'
import type { Contest } from '@/lib/contests'

export type ContestPlatform = 'codechef' | 'leetcode' | 'codeforces'

export function useContestAlarm(
  contests: Record<ContestPlatform, Contest[]>,
  onError: (msg: string) => void
) {
  const settings = useAppStore((s) => s.settings)
  const [contestPlatform, setContestPlatform] = useState<ContestPlatform>('codechef')
  const [alarmOn, setAlarmOn] = useState(false)
  const [alarmSynced, setAlarmSynced] = useState(false)
  const notifiedContests = useRef<Map<string, boolean>>(new Map())

  // ── Contest Alarm (notify at user-chosen lead time) ──────────
  // Inside Electron the alarm runs in the main process so notifications keep
  // firing even when the window is closed (the app stays in the tray). The
  // local Notification scheduling below is only a browser-only fallback.
  const backgroundAlarm = typeof window.alarm !== 'undefined'

  const toggleAlarm = async () => {
    if (backgroundAlarm) {
      setAlarmOn((on) => !on)
      return
    }
    if (!alarmOn) {
      // Request permission when turning the alarm on (browser fallback)
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        try {
          await Notification.requestPermission()
        } catch {}
      }
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
        onError('Notification permission required to enable alarm.')
        return
      }
      notifiedContests.current = new Map()
      setAlarmOn(true)
      return
    }
    setAlarmOn(false)
    notifiedContests.current.clear()
  }

  const remindMinutes = settings?.contestRemindMinutes ?? 15
  const remindMs = remindMinutes * 60 * 1000

  // Push the alarm config to the background scheduler whenever it changes.
  // Gated on `alarmSynced` so the initial mount doesn't stamp a stale default
  // (off/15/codechef) over the config the main process restored on startup.
  useEffect(() => {
    if (!backgroundAlarm || !alarmSynced) return
    window.alarm?.set({ enabled: alarmOn, remindMinutes, platform: contestPlatform })
  }, [alarmOn, remindMinutes, contestPlatform, backgroundAlarm, alarmSynced])

  // Restore the alarm state from the main process (survives window close) and
  // stay in sync when it is toggled from the tray menu.
  useEffect(() => {
    if (!backgroundAlarm) return
    const syncFromMain = async () => {
      try {
        const config = await window.alarm?.get()
        if (config) {
          setAlarmOn(config.enabled)
          setContestPlatform(config.platform)
          useAppStore.getState().updateSettings({ contestRemindMinutes: config.remindMinutes })
        }
      } catch {}
      finally {
        setAlarmSynced(true)
      }
    }
    syncFromMain()
    const unsubscribe = window.alarm?.onChanged((config) => {
      if (config) {
        setAlarmOn(config.enabled)
        setContestPlatform(config.platform)
        useAppStore.getState().updateSettings({ contestRemindMinutes: config.remindMinutes })
      }
    })
    return unsubscribe
  }, [backgroundAlarm])

  const prevRemindMinutes = useRef(remindMinutes)
  useEffect(() => {
    if (remindMinutes !== prevRemindMinutes.current) {
      prevRemindMinutes.current = remindMinutes
      notifiedContests.current.clear()
    }
  }, [remindMinutes])

  // Schedule per-contest reminder + "live now" notifications at the configured
  // lead time (browser-only fallback; the Electron main process handles this
  // in the background).
  useEffect(() => {
    if (!alarmOn || backgroundAlarm) return

    const platformContests = contests[contestPlatform]
    const upcoming = platformContests
      .filter((c) => c.startTime + c.duration > Date.now())
      .sort((a, b) => a.startTime - b.startTime)

    const timers: ReturnType<typeof setTimeout>[] = []
    const nowMs = Date.now()

    const maybeNotify = (id: string, title: string, body: string) => {
      if (notifiedContests.current.has(id)) return
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
      try {
        new Notification(title, { body, icon: undefined })
        notifiedContests.current.set(id, true)
      } catch {}
    }

    for (const contest of upcoming) {
      const id = `${contest.platform}-${contest.title}-${contest.startTime}`
      const remindAt = contest.startTime - remindMs

      // Reminder at the configured lead time.
      if (remindAt > nowMs) {
        timers.push(
          setTimeout(
            () =>
              maybeNotify(
                id,
                'Contest Reminder',
                `${contest.title} on ${contest.platform} starts in ${remindMinutes} minute${remindMinutes === 1 ? '' : 's'}.`
              ),
            remindAt - nowMs
          )
        )
      } else if (contest.startTime > nowMs) {
        // Lead time already passed but the contest hasn't started — notify now
        // with the real remaining time.
        const minsLeft = Math.max(1, Math.ceil((contest.startTime - nowMs) / 60000))
        maybeNotify(
          id,
          'Contest Reminder',
          `${contest.title} on ${contest.platform} starts in ${minsLeft} minute${minsLeft === 1 ? '' : 's'}.`
        )
      }

      // "Live now" notification at start time.
      if (contest.startTime > nowMs) {
        timers.push(
          setTimeout(
            () =>
              maybeNotify(
                `live:${id}`,
                'Contest Started',
                `${contest.title} on ${contest.platform} is live now!`
              ),
            contest.startTime - nowMs
          )
        )
      }
    }

    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarmOn, contests, contestPlatform, remindMs])

  return { contestPlatform, setContestPlatform, alarmOn, toggleAlarm, remindMinutes }
}