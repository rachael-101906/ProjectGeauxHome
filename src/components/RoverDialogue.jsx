import { Bot } from 'lucide-react'
import { useGame } from '../state/gameStore'

export default function RoverDialogue() {
  const message = useGame((s) => s.message)
  const lastOk = useGame((s) => s.lastOk)

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 ${
        lastOk ? 'border-orange-900/60 bg-black/30' : 'border-red-700/70 bg-red-950/40'
      }`}
    >
      <Bot className="mt-0.5 shrink-0 text-orange-300" size={22} />
      <div>
        <div className="text-xs uppercase tracking-widest text-orange-300/70">R.O.V.E.R.</div>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  )
}
