// YouTube URL validation via main-process fetch (bypasses renderer CORS).
// Returns a map of url -> boolean availability.

export async function validateYoutubeUrls(urls: string[]): Promise<Map<string, boolean>> {
  const ipc = (window as any).electron?.ipcRenderer
  const result = new Map<string, boolean>()
  if (!ipc || typeof ipc.invoke !== 'function') {
    // Browser fallback — can't verify due to CORS, assume available
    urls.forEach((u) => result.set(u, true))
    return result
  }
  // Check in parallel but with slight delay to avoid rate limiting
  await Promise.all(
    urls.map(async (url, i) => {
      await new Promise((r) => setTimeout(r, i * 150))
      try {
        const res = await ipc.invoke('yt:check', url)
        result.set(url, res?.available === true)
      } catch {
        result.set(url, false)
      }
    })
  )
  return result
}