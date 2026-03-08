import { describe, it, expect, vi, beforeEach } from 'vitest'
import prOpenedFixture from './fixtures/pr-opened.json'
import checkSuiteFixture from './fixtures/check-suite-failed.json'
import dependabotFixture from './fixtures/dependabot-alert.json'

// Mock BullMQ to avoid Redis dependency in tests
vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn().mockResolvedValue({ id: 'mock-job-id' }),
  })),
}))

describe('event router', () => {
  let router: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('../router.js')
    router = mod.router
  })

  it('dispatches PR opened events to pr-reviewer', async () => {
    const result = await router.dispatch('pull_request', prOpenedFixture, 'delivery-1')

    expect(result.dispatched).toBe(true)
    expect(result.agentType).toBe('pr-reviewer')
  })

  it('dispatches check suite failures to ci-debugger', async () => {
    const result = await router.dispatch('check_suite', checkSuiteFixture, 'delivery-2')

    expect(result.dispatched).toBe(true)
    expect(result.agentType).toBe('ci-debugger')
  })

  it('dispatches dependabot alerts to security', async () => {
    const result = await router.dispatch('dependabot_alert', dependabotFixture, 'delivery-3')

    expect(result.dispatched).toBe(true)
    expect(result.agentType).toBe('security')
  })

  it('ignores unknown events', async () => {
    const result = await router.dispatch('star', { action: 'created', repository: { name: 'test', owner: { login: 'user' } } }, 'delivery-4')

    expect(result.dispatched).toBe(false)
  })

  it('ignores draft PRs', async () => {
    const draftPR = JSON.parse(JSON.stringify(prOpenedFixture))
    draftPR.pull_request.draft = true

    const result = await router.dispatch('pull_request', draftPR, 'delivery-5')

    expect(result.dispatched).toBe(false)
  })

  it('ignores successful check suites', async () => {
    const successSuite = JSON.parse(JSON.stringify(checkSuiteFixture))
    successSuite.check_suite.conclusion = 'success'

    const result = await router.dispatch('check_suite', successSuite, 'delivery-6')

    expect(result.dispatched).toBe(false)
  })

  it('ignores bot PRs', async () => {
    const botPR = JSON.parse(JSON.stringify(prOpenedFixture))
    botPR.pull_request.user.login = 'renovate[bot]'

    const result = await router.dispatch('pull_request', botPR, 'delivery-7')

    expect(result.dispatched).toBe(false)
  })

  it('ignores PRs with skip-review label', async () => {
    const skipPR = JSON.parse(JSON.stringify(prOpenedFixture))
    skipPR.pull_request.labels = [{ name: 'skip-review' }]

    const result = await router.dispatch('pull_request', skipPR, 'delivery-8')

    expect(result.dispatched).toBe(false)
  })

  it('dispatches cron events', async () => {
    const result = await router.dispatchCron('tool-discovery', '0 3 * * *', null)

    expect(result.dispatched).toBe(true)
    expect(result.agentType).toBe('tool-discovery')
  })
})
