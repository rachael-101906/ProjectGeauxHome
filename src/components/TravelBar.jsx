import { useGame } from '../state/gameStore'
import { LOCATIONS } from '../data/locations'

export default function TravelBar() {
  const location = useGame((s) => s.game.location)
  const travel = useGame((s) => s.travel)

  return (
    <nav className="flex flex-wrap gap-2">
      {Object.values(LOCATIONS).map((loc) => (
        <button
          key={loc.id}
          onClick={() => travel(loc.id)}
          className={`rounded-md border px-3 py-2 text-left text-sm transition ${
            location === loc.id
              ? 'border-orange-400 bg-orange-500/20 text-orange-100'
              : 'border-orange-900/60 bg-black/30 hover:bg-orange-900/30'
          }`}
        >
          <div className="font-semibold">{loc.name}</div>
          <div className="text-xs text-orange-200/60">{loc.purpose}</div>
        </button>
      ))}
    </nav>
  )
}
