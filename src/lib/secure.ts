// Renderer-side helpers that talk to the main process over the secure bridge.
// The API key is never persisted in the renderer — it is stored encrypted in
// the main process (Electron safeStorage) and AI calls are proxied from there.

interface AIGeneratePayload {
  provider: string
  apiKey: string
  model: string
  systemPrompt: string
  userPrompt: string
  customEndpoint?: string
  temperature?: number
  maxTokens?: number
}

function hasBridge(): boolean {
  return typeof window.secure?.storeApiKey === 'function'
}

export async function secureStoreApiKey(apiKey: string): Promise<void> {
  if (hasBridge()) {
    await window.secure!.storeApiKey(apiKey)
  }
}

export async function secureGetApiKey(): Promise<string> {
  if (hasBridge()) {
    return (await window.secure!.getApiKey()) ?? ''
  }
  // No main process (plain browser dev) — nothing persisted
  return ''
}

export async function secureDeleteApiKey(): Promise<void> {
  if (hasBridge()) {
    await window.secure!.deleteApiKey()
  }
}

// Direct API fallback when running outside Electron (e.g. `npm run dev`).
async function directGenerateAI(payload: AIGeneratePayload): Promise<string> {
  const { provider, apiKey, model, systemPrompt, userPrompt, customEndpoint, temperature, maxTokens } = payload

  if (!apiKey) throw new Error('No API key provided')

  const buildOpenAICompatible = (baseUrl: string) =>
    fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 4096,
      }),
    })

  let res: Response

  switch (provider) {
    case 'anthropic': {
      res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens ?? 4096,
          temperature: temperature ?? 0.7,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      })
      if (!res.ok) {
        const err = await res.text().catch(() => '')
        throw new Error(`Anthropic API error ${res.status}: ${err}`)
      }
      const data = await res.json()
      return data.content?.[0]?.text ?? ''

    }
    case 'gemini': {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: {
            temperature: temperature ?? 0.7,
            maxOutputTokens: maxTokens ?? 4096,
          },
        }),
      })
      if (!res.ok) {
        const err = await res.text().catch(() => '')
        throw new Error(`Gemini API error ${res.status}: ${err}`)
      }
      const gData = await res.json()
      return gData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    }
    case 'custom': {
      if (!customEndpoint) throw new Error('Custom endpoint URL is required')
      const baseUrl = customEndpoint.replace(/\/+$/, '')
      res = await buildOpenAICompatible(baseUrl)
      if (!res.ok) {
        const err = await res.text().catch(() => '')
        throw new Error(`Custom API error ${res.status}: ${err}`)
      }
      const cData = await res.json()
      return cData.choices?.[0]?.message?.content ?? ''

    }
    case 'deepseek':
    case 'groq':
    case 'openai':
    default: {
      const baseUrls: Record<string, string> = {
        openai: 'https://api.openai.com/v1',
        deepseek: 'https://api.deepseek.com',
        groq: 'https://api.groq.com/openai/v1',
      }
      const baseUrl = baseUrls[provider] ?? baseUrls.openai
      res = await buildOpenAICompatible(baseUrl)
      if (!res.ok) {
        const err = await res.text().catch(() => '')
        throw new Error(`${provider} API error ${res.status}: ${err}`)
      }
      const oData = await res.json()
      return oData.choices?.[0]?.message?.content ?? ''
    }
  }
}

export async function secureGenerateAI(payload: AIGeneratePayload): Promise<string> {
  if (hasBridge()) {
    return (await window.secure!.generateAI(payload)) ?? ''
  }
  return directGenerateAI(payload)
}