const SCREENS = { arcadia: HomeBase, alba_mons: MineScreen, vastitas: TradeScreen, olympus: CombatScreen }
export default function App() {
  const location = useGame((s) => s.location)
  const Screen = SCREENS[location]
  return <Screen />
}