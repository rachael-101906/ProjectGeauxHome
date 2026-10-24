import { SELL_PRICES } from '../data/prices'
import { RESOURCES } from '../data/resources'
import { SHOP_BY_ID } from '../data/shop'
import { UPGRADES_BY_ID } from '../data/upgrades'
import { ok, fail, canAfford, payCost, formatCost } from './helpers'

// ---- Martian: buys ore -------------------------------------------------

export function sellOre(game, oreId, qty) {
  const have = game.inventory[oreId] ?? 0
  const n = Math.min(qty, have)
  if (n <= 0) return fail(game, `You have no ${RESOURCES[oreId].name} to sell.`)

  const earned = SELL_PRICES[oreId] * n
  return ok(
    {
      ...game,
      tintinas: game.tintinas + earned,
      inventory: { ...game.inventory, [oreId]: have - n },
    },
    `Sold ${n} ${RESOURCES[oreId].name} for ${earned} T.`,
  )
}

export const sellAllOre = (game, oreId) => sellOre(game, oreId, game.inventory[oreId] ?? 0)

// ---- Human: sells gear -------------------------------------------------

// Why an item can't be bought right now, or null if it can.
export function gearBlocker(game, itemId) {
  const item = SHOP_BY_ID[itemId]
  if (!item) return 'Unknown item.'

  if (item.kind === 'drill') {
    if (game.gear.drill >= item.tier) return 'Owned'
    if (item.tier !== game.gear.drill + 1) return `Buy T${item.tier - 1} Drill first.`
  }
  if (item.kind === 'blaster') {
    if (game.gear.blaster >= item.tier) return 'Owned'
    if (item.tier !== game.gear.blaster + 1) {
      return item.tier === 1 ? null : `Buy T${item.tier - 1} Blaster first.`
    }
  }
  if (item.kind === 'filter' && game.gear.hasFilter) return 'Owned'

  if (game.tintinas < item.price) return `Need ${item.price} T.`
  return null
}

export function buyGear(game, itemId) {
  const blocker = gearBlocker(game, itemId)
  if (blocker) return fail(game, blocker)

  const item = SHOP_BY_ID[itemId]
  const gear = { ...game.gear }
  if (item.kind === 'drill') gear.drill = item.tier
  if (item.kind === 'blaster') gear.blaster = item.tier
  if (item.kind === 'filter') gear.hasFilter = true

  return ok(
    { ...game, tintinas: game.tintinas - item.price, gear },
    `Bought ${item.name} for ${item.price} T.`,
  )
}

// ---- Robot: installs upgrades -----------------------------------------

export function upgradeBlocker(game, upgradeId) {
  const up = UPGRADES_BY_ID[upgradeId]
  if (!up) return 'Unknown upgrade.'
  if (game.upgrades[upgradeId]) return 'Installed'
  const missing = up.requires.filter((id) => !game.upgrades[id])
  if (missing.length) {
    return `Needs ${missing.map((id) => UPGRADES_BY_ID[id].name).join(', ')} first.`
  }
  if (!canAfford(game.inventory, up.cost)) return `Need ${formatCost(up.cost)}.`
  return null
}

export function buyUpgrade(game, upgradeId) {
  const blocker = upgradeBlocker(game, upgradeId)
  if (blocker) return fail(game, blocker)

  const up = UPGRADES_BY_ID[upgradeId]
  return ok(
    {
      ...game,
      inventory: payCost(game.inventory, up.cost),
      upgrades: { ...game.upgrades, [upgradeId]: true },
    },
    `${up.name} installed!`,
  )
}