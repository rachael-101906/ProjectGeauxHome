import { useState } from 'react'
import { Bot, Rocket, Users } from 'lucide-react'
import { useGame } from '../state/gameStore'
import { RESOURCES } from '../data/resources'
import { SELL_PRICES } from '../data/prices'
import { SHOP } from '../data/shop'
import { UPGRADES } from '../data/upgrades'
import { TRADER_LINES } from '../data/dialogue'
import { gearBlocker, upgradeBlocker } from '../systems/trading'
import { formatCost } from '../systems/helpers'
import ResourceIcon from '../components/ResourceIcon'

const TABS = [
  { id: 'martian', label: 'Dr. Oxy Genn', sub: 'Buys ore', Icon: Rocket },
  { id: 'robot', label: 'DJ-TMoney', sub: 'Sells gear', Icon: Users },
  { id: 'human', label: 'Captain McMars', sub: 'Ship upgrades', Icon: Bot },
]

const btn =
  'rounded-md border border-orange-700/70 bg-orange-700/20 px-3 py-1 text-sm transition enabled:hover:bg-orange-600/40 disabled:cursor-not-allowed disabled:opacity-40'

function MartianTab() {
  const { inventory } = useGame((s) => s.game)
  const sell = useGame((s) => s.sell)
  const sellAll = useGame((s) => s.sellAll)

  return (
    <ul className="space-y-2">
      {Object.values(RESOURCES).map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 rounded-md bg-black/20 p-2">
          <span className="flex items-center gap-2">
            <ResourceIcon id={r.id} /> {r.name}
            <span className="text-xs text-amber-300/80">{SELL_PRICES[r.id]} T each</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xs text-orange-200/60">have {inventory[r.id]}</span>
            <button className={btn} disabled={inventory[r.id] < 1} onClick={() => sell(r.id, 1)}>Sell 1</button>
            <button className={btn} disabled={inventory[r.id] < 1} onClick={() => sellAll(r.id)}>Sell all</button>
          </span>
        </li>
      ))}
    </ul>
  )
}

function HumanTab() {
  const game = useGame((s) => s.game)
  const buyGear = useGame((s) => s.buyGear)

  return (
    <ul className="space-y-2">
      {SHOP.map((item) => {
        const blocker = gearBlocker(game, item.id)
        const owned = blocker === 'Owned'
        return (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-black/20 p-2">
            <span>
              {item.name}
              {item.damage ? <span className="ml-2 text-xs text-orange-200/60">{item.damage} dmg</span> : null}
            </span>
            <span className="flex items-center gap-3">
              <span className="text-xs text-amber-300/80">{item.price === 0 ? 'Free' : `${item.price} T`}</span>
              <button className={btn} disabled={!!blocker} onClick={() => buyGear(item.id)}>
                {owned ? 'Owned' : 'Buy'}
              </button>
              {blocker && !owned && <span className="w-36 text-xs text-red-300/80">{blocker}</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function RobotTab() {
  const game = useGame((s) => s.game)
  const buyUpgrade = useGame((s) => s.buyUpgrade)

  return (
    <ul className="space-y-2">
      {UPGRADES.map((up) => {
        const blocker = upgradeBlocker(game, up.id)
        const installed = blocker === 'Installed'
        return (
          <li key={up.id} className="rounded-md bg-black/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <span>
                <div>{up.name}</div>
                <div className="text-xs text-orange-200/60">{up.description}</div>
                <div className="mt-1 text-xs text-amber-300/80">Cost: {formatCost(up.cost)}</div>
              </span>
              <span className="flex flex-col items-end gap-1">
                <button className={btn} disabled={!!blocker} onClick={() => buyUpgrade(up.id)}>
                  {installed ? 'Installed' : 'Install'}
                </button>
                {blocker && !installed && <span className="max-w-48 text-right text-xs text-red-300/80">{blocker}</span>}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function TradeScreen() {
  const [tab, setTab] = useState('martian')

  return (
    <section className="rounded-lg border border-orange-900/60 bg-black/30 p-4">
      <h2 className="mb-3 text-lg text-orange-200">Trading Post</h2>

      <div className="mb-3 flex flex-wrap gap-2">
        {TABS.map(({ id, label, sub, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm ${
              tab === id ? 'border-orange-400 bg-orange-500/20' : 'border-orange-900/60 hover:bg-orange-900/30'
            }`}
          >
            <Icon size={16} />
            <span>
              <div>{label}</div>
              <div className="text-xs text-orange-200/60">{sub}</div>
            </span>
          </button>
        ))}
      </div>

      <p className="mb-3 text-sm italic text-orange-200/70">{TRADER_LINES[tab]}</p>

      {tab === 'martian' && <MartianTab />}
      {tab === 'human' && <HumanTab />}
      {tab === 'robot' && <RobotTab />}
    </section>
  )
}
