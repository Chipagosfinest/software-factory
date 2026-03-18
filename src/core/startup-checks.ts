/**
 * Startup validation — fail fast on missing config.
 *
 * Missing env vars cause silent failures at runtime in autonomous systems.
 * Better to crash on startup with a clear message than silently skip
 * every agent run for hours.
 */

interface EnvCheck {
  name: string
  required: boolean
  description: string
}

const ENV_CHECKS: EnvCheck[] = [
  { name: 'OPENROUTER_API_KEY', required: true, description: 'LLM inference via OpenRouter' },
  { name: 'GITHUB_WEBHOOK_SECRET', required: false, description: 'Webhook signature verification (recommended)' },
  { name: 'REDIS_URL', required: false, description: 'BullMQ queue (required for production)' },
  { name: 'GLOBAL_DAILY_BUDGET_USD', required: false, description: 'Daily cost cap (default: $20)' },
  { name: 'ALLOWED_REPOS', required: false, description: 'Repo allowlist (empty = allow all in dev)' },
]

export function validateStartupConfig(): void {
  const missing: string[] = []
  const warnings: string[] = []

  for (const check of ENV_CHECKS) {
    const value = process.env[check.name]
    if (!value || value.trim() === '') {
      if (check.required) {
        missing.push(`  ${check.name} — ${check.description}`)
      } else {
        warnings.push(`  ${check.name} — ${check.description}`)
      }
    }
  }

  if (warnings.length > 0) {
    console.warn(`[startup] Optional env vars not set:`)
    for (const w of warnings) console.warn(w)
  }

  if (missing.length > 0) {
    console.error(`[startup] FATAL: Required env vars missing:`)
    for (const m of missing) console.error(m)
    console.error(`\nSet these in .env or environment before starting.`)
    process.exit(1)
  }

  // Validate budget is a real number
  const budget = parseFloat(process.env.GLOBAL_DAILY_BUDGET_USD || '20')
  if (isNaN(budget) || budget <= 0) {
    console.error(`[startup] FATAL: GLOBAL_DAILY_BUDGET_USD must be a positive number, got: ${process.env.GLOBAL_DAILY_BUDGET_USD}`)
    process.exit(1)
  }

  // Warn if budget is suspiciously high
  if (budget > 100) {
    console.warn(`[startup] WARNING: Daily budget set to $${budget}. Are you sure? (set GLOBAL_DAILY_BUDGET_USD)`)
  }

  console.log(`[startup] Config validated. Daily budget: $${budget.toFixed(2)}`)
}
