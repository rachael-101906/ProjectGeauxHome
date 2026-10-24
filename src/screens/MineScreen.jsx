import { Pickaxe } from 'lucide-react'
import { useGame } from '../state/gameStore'
import { RESOURCES } from '../data/resources'
import { miningBlocker } from '../systems/mining'
import ResourceIcon from '../components/ResourceIcon'

// Generic mining panel: lists whatever ore exists at the player's current location.
export default function MineScreen() {
  const game = useGame((s) => s.game)
  const mine = useGame((s) => s.mine)

  const here = Object.values(RESOURCES).filter((r) => r.location === game.location)
  if (here.length === 0) return null

  return (
    <section className="rounded-lg border border-orange-900/60 bg-black/30 p-4">
      <h2 className="mb-3 flex items-center gap-2 text-lg text-orange-200">
        <Pickaxe size={20} /> Mine
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {here.map((r) => {
          const blocker = miningBlocker(game, r.id)
          return (
            <button
              key={r.id}
              disabled={!!blocker}
              onClick={() => mine(r.id)}
              className="flex items-center justify-between rounded-md border border-orange-800/60 bg-orange-900/20 p-3 text-left transition enabled:hover:bg-orange-700/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <ResourceIcon id={r.id} size={22} />
                <span>
                  <div>{r.name}</div>
                  <div className="text-xs text-orange-200/60">Tier {r.tier}</div>
                </span>
              </span>
              <span className="text-xs text-orange-200/80">
                {blocker ?? `+${game.gear.pickaxe} per click`}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
