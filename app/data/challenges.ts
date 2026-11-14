/**
 * Challenge catalogue.
 * NOTE: prices and rules are placeholders modelled on common industry ranges —
 * replace with Artix's final commercial terms before going live.
 */
export type Rule = { label: string; values: string[] }

export interface ChallengeModel {
  id: string
  name: string
  tagline: string
  badge?: string
  phases: string[]
  rules: Rule[]
  prices: Record<number, number>
}

export const sizes = [5_000, 10_000, 25_000, 50_000, 100_000, 200_000] as const

export const models: ChallengeModel[] = [
  {
    id: 'two-step',
    name: '2-Step Evaluation',
    tagline: 'Lowest cost, most forgiving drawdown.',
    badge: 'Most popular',
    phases: ['Phase 1', 'Phase 2', 'Funded'],
    rules: [
      { label: 'Profit target', values: ['8%', '5%', '—'] },
      { label: 'Max daily loss', values: ['5%', '5%', '5%'] },
      { label: 'Max overall loss', values: ['10%', '10%', '10%'] },
      { label: 'Min. trading days', values: ['3', '3', '—'] },
      { label: 'Time limit', values: ['None', 'None', 'None'] },
      { label: 'Leverage', values: ['1:100', '1:100', '1:100'] },
      { label: 'Profit split', values: ['—', '—', 'Up to 90%'] }
    ],
    prices: { 5000: 39, 10000: 69, 25000: 159, 50000: 279, 100000: 499, 200000: 949 }
  },
  {
    id: 'one-step',
    name: '1-Step Evaluation',
    tagline: 'One target. Funded faster.',
    phases: ['Evaluation', 'Funded'],
    rules: [
      { label: 'Profit target', values: ['10%', '—'] },
      { label: 'Max daily loss', values: ['3%', '3%'] },
      { label: 'Max overall loss', values: ['6% trailing', '6% trailing'] },
      { label: 'Min. trading days', values: ['3', '—'] },
      { label: 'Time limit', values: ['None', 'None'] },
      { label: 'Leverage', values: ['1:50', '1:50'] },
      { label: 'Profit split', values: ['—', 'Up to 90%'] }
    ],
    prices: { 5000: 59, 10000: 99, 25000: 199, 50000: 339, 100000: 579, 200000: 1099 }
  },
  {
    id: 'instant',
    name: 'Instant Funding',
    tagline: 'Skip the test. Trade funded from day one.',
    phases: ['Funded'],
    rules: [
      { label: 'Profit target', values: ['—'] },
      { label: 'Max daily loss', values: ['3%'] },
      { label: 'Max overall loss', values: ['6% trailing'] },
      { label: 'Min. trading days', values: ['5 before 1st payout'] },
      { label: 'Time limit', values: ['None'] },
      { label: 'Leverage', values: ['1:30'] },
      { label: 'Profit split', values: ['Up to 80%'] }
    ],
    prices: { 5000: 89, 10000: 159, 25000: 349, 50000: 629, 100000: 1149, 200000: 2199 }
  }
]

export const fmtMoney = (n: number) =>
  n >= 1000 ? `$${n / 1000}K` : `$${n.toLocaleString('en-US')}`
