import { Coins, Pickaxe, Crosshair, Wind } from 'lucide-react'
import { useGame } from '../state/gameStore'
import { RESOURCES } from '../data/resources'
import ResourceIcon from './ResourceIcon'

export default function Inventory() {
  const { tintinas, inventory, gear } = useGame((s) => s.game)

  return (
    <aside className="rounded-lg border border-orange-900/60 bg-black/30 p-4 space-y-4">
      <div className="flex items-center gap-2 text-lg text-amber-300">
        <Coins size={20} /> {tintinas} T
      </div>

      <div>
        <h3 className="mb-2 text-xs uppercase tracking-widest text-orange-300/70">Cargo</h3>
        <ul className="space-y-1">
          {Object.values(RESOURCES).map((r) => (
            <li key={r.id} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ResourceIcon id={r.id} /> {r.name}
              </span>
              <span>{inventory[r.id]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-xs uppercase tracking-widest text-orange-300/70">Gear</h3>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2"><Pickaxe size={16} /> T{gear.drill} Drill</li>
          <li className="flex items-center gap-2">
            <Crosshair size={16} /> {gear.blaster ? `T${gear.blaster} Blaster` : 'No blaster'}
          </li>
          <li className="flex items-center gap-2">
            <Wind size={16} /> {gear.hasFilter ? 'Filter installed' : 'No filter'}
          </li>
        </ul>
      </div>
    </aside>
  )
}
