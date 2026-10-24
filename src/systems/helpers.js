// Shared helpers. Every system returns { game, msg }:
//   game = the new state (or the same object if nothing happened)
//   msg  = a line for R.O.V.E.R. / the log

export const ok = (game, msg) => ({ game, msg, ok: true })
export const fail = (game, msg) => ({ game, msg, ok: false })

// cost is { resourceId: amount }
export function canAfford(inventory, cost) {
  return Object.entries(cost).every(([id, amount]) => (inventory[id] ?? 0) >= amount)
}

export function payCost(inventory, cost) {
  const next = { ...inventory }
  for (const [id, amount] of Object.entries(cost)) next[id] -= amount
  return next
}

export function formatCost(cost) {
  return Object.entries(cost)
    .map(([id, amount]) => `${amount} ${id}`)
    .join(', ')
}