// betArray.ts — 64 outcomes with tunable RTP and no 0x entries in the paytable
export type HandLabel =
  | 'Bust'
  | 'Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Full House'
  | 'Four of a Kind'
  | 'Jackpot'

export const LABEL_BY_HAND: Record<string, HandLabel> = {
  'No Win': 'Bust',
  'Pair': 'Pair',
  'Three of a Kind': 'Three of a Kind',
  'Straight': 'Straight',
  'Full House': 'Full House',
  'Four of a Kind': 'Four of a Kind',
  'Jackpot': 'Jackpot',
  'Bust': 'Bust',
}

type Dist = { label: HandLabel; mult: number; count: number }

function buildBetArray64(targetRtp = 0.98) {
  const fixedSum = 20 + 12 + 8 + 5 + 3 + 3 // = 51
  const rawP = Math.round(targetRtp * 64 - fixedSum)
  const p = Math.max(10, Math.min(14, rawP))
  const used = 1 + 1 + 1 + 1 + 2 + p
  const busts = Math.max(0, 64 - used)

  const dist: Dist[] = [
    { label: 'Jackpot',         mult: 20, count: 1 },
    { label: 'Four of a Kind',  mult: 12, count: 1 },
    { label: 'Full House',      mult:  8, count: 1 },
    { label: 'Straight',        mult:  5, count: 1 },
    { label: 'Three of a Kind', mult:  3, count: 2 },
    { label: 'Pair',            mult:  1, count: p },
    { label: 'Bust',            mult:  0, count: busts },
  ]

  const labels: HandLabel[] = []
  const payouts: number[] = []
  for (const d of dist) {
    for (let i = 0; i < d.count; i++) {
      labels.push(d.label)
      payouts.push(d.mult)
    }
  }
  while (labels.length < 64) { labels.push('Bust'); payouts.push(0) }
  if (labels.length > 64) { labels.length = 64; payouts.length = 64 }

  const totalPayout = payouts.reduce((a, b) => a + b, 0)
  const rtp = totalPayout / 64

  return { labels, payouts, rtp, counts: dist }
}

const built = buildBetArray64(0.98)

export const JACKS_OR_BETTER_BET_ARRAY: readonly number[] = built.payouts
export const HAND_BY_INDEX: readonly HandLabel[] = built.labels
export const CURRENT_RTP = built.rtp
export const CURRENT_COUNTS = built.counts
