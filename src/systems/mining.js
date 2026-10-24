import { CONFIG } from '../data/config'
import { RESOURCES } from '../data/resources'
import { ok, fail } from './helpers'

// Why a resource can't be mined right now, or null if it can.
export function miningBlocker(game, oreId) {
  const r = RESOURCES[oreId]
  if (!r) return 'Unknown resource.'
  if (game.location !== r.location) return 'Not mineable here.'
  if (r.tier > game.gear.drill) return `Needs a T${r.tier} Drill.`
  if (r.needsFilter && !game.gear.hasFilter) return 'Needs a Filter.'
  return null
}

export function mine(game, oreId) {
  const blocker = miningBlocker(game, oreId)
  if (blocker) return fail(game, blocker)

  const amount = game.gear.drill * CONFIG.yieldPerTier
  return ok(
    {
      ...game,
      inventory: { ...game.inventory, [oreId]: game.inventory[oreId] + amount },
    },
    `Mined ${amount} ${RESOURCES[oreId].name}.`,
  )
}