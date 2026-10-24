import { Snowflake, Hammer, Gem, Flame, Mountain } from 'lucide-react'

const ICONS = {
  ice: Snowflake,
  iron: Hammer,
  silica: Gem,
  sulfur: Flame,
  basalt: Mountain,
}

const COLORS = {
  ice: 'text-cyan-300',
  iron: 'text-slate-300',
  silica: 'text-pink-300',
  sulfur: 'text-yellow-300',
  basalt: 'text-stone-400',
}

export default function ResourceIcon({ id, size = 18 }) {
  const Icon = ICONS[id] ?? Gem
  return <Icon size={size} className={COLORS[id] ?? ''} />
}
