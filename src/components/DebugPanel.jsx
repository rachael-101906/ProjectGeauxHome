import { useGame } from '../state/gameStore'
import { RESOURCE_IDS } from '../data/resources'

// Only rendered when the URL has ?debug=1. Handy for testing late-game content.
export default function DebugPanel() {
  const debugPatch = useGame((s) => s.debugPatch)

  return (
    <div className="rounded-lg border border-dashed border-fuchsia-500/60 bg-fuchsia-950/20 p-3 text-xs">
      <div className="mb-2 uppercase tracking-widest text-fuchsia-300">Debug</div>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded border border-fuchsia-500/60 px-2 py-1"
          onClick={() => debugPatch((g) => ({ tintinas: g.tintinas + 1000 }))}
        >
          +1000 T
        </button>
        <button
          className="rounded border border-fuchsia-500/60 px-2 py-1"
          onClick={() =>
            debugPatch((g) => ({
              inventory: Object.fromEntries(
                RESOURCE_IDS.map((id) => [id, g.inventory[id] + 20]),
              ),
            }))
          }
        >
          +20 of every ore
        </button>
      </div>
    </div>
  )
}
