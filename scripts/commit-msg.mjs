// Writes a git commit message for the currently staged changes, using a local OpenAI-compatible LLM.
// Usage: node scripts/commit-msg.mjs   (prints the message to stdout; used by `make deploy`)
// Env: LLM_URL (default http://127.0.0.1:9694/v1), LLM_MODEL (default router/text).
// Falls back to a plain dated message if the LLM is unreachable or returns nothing.
import { execSync } from 'node:child_process'

const base = (process.env.LLM_URL || 'http://127.0.0.1:9694/v1').replace(/\/+$/, '')
const model = process.env.LLM_MODEL || 'router/text'
const fallback = `Deploy ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`

const git = (args) => execSync(`git ${args}`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

// Source changes matter for the message; docs/ is generated build output, so only summarise it.
const stat = git('diff --cached --stat -- . ":(exclude)docs"').trim()
const diff = git('diff --cached -- . ":(exclude)docs" ":(exclude)package-lock.json"').slice(0, 24000)
const docsCount = git('diff --cached --name-only -- docs').split('\n').filter(Boolean).length

if (!stat && !docsCount) {
  console.log(fallback)
  process.exit(0)
}

const prompt = `Write a git commit message for these staged changes.
Format: a short imperative subject line (max 72 chars), then optionally a blank line and a few "- " bullet points.
Output only the commit message, no quotes, no code fences, no preamble.
${docsCount ? `\nThe rebuilt static site in docs/ also changed (${docsCount} files); mention it only briefly.` : ''}

Stat:
${stat || '(only docs/ build output changed)'}

Diff:
${diff}`

try {
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: 4000, temperature: 0.2 }),
    signal: AbortSignal.timeout(120_000)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const msg = (data.choices?.[0]?.message?.content ?? '')
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/^```\w*\n?|```$/g, '')
    .trim()
  console.log(msg || fallback)
} catch (err) {
  console.error(`commit-msg: LLM unavailable (${err.message}), using fallback message`)
  console.log(fallback)
}
