import { CheckCircle2, Circle } from 'lucide-react'
import { useGame } from '../state/gameStore'
import { UPGRADES } from '../data/upgrades'
import { installedCount } from '../systems/progression'

export default function HomeBase() {
  const game = useGame((s) => s.game)

  return (
    <section className="rounded-lg border border-orange-900/60 bg-black/30 p-4">
      <h2 className="mb-1 text-lg text-orange-200">Ship Status</h2>
      <p className="mb-3 text-sm text-orange-200/70">
        {installedCount(game)} / {UPGRADES.length} systems online. Gather materials, trade, and
        install every upgrade at the Trading Post in Vastitas Borealis.
      </p>
      <ul className="space-y-2">
        {UPGRADES.map((up) => (
          <li key={up.id} className="flex items-center gap-2">
            {game.upgrades[up.id] ? (
              <CheckCircle2 size={18} className="text-green-400" />
            ) : (
              <Circle size={18} className="text-orange-300/50" />
            )}
            <span className={game.upgrades[up.id] ? '' : 'text-orange-100/70'}>{up.name}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
