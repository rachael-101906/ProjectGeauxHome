import { UPGRADES } from '../data/upgrades'

export function installedCount(game) {
  return UPGRADES.filter((u) => game.upgrades[u.id]).length
}

// Win condition: all four ship systems installed.
export function hasWon(game) {
  return installedCount(game) === UPGRADES.length
}