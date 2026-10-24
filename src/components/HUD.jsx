import "./game-ui.css";

const resources = [
  { key: "health", label: "HEALTH", value: 100 },
  { key: "oxygen", label: "OXYGEN", value: 100 },
  { key: "water", label: "WATER", value: 100 },
  { key: "power", label: "POWER", value: 100 },
];

const tools = ["Drill", "Blaster", "Repair Tool"];

export default function HUD({
  health = 100,
  oxygen = 100,
  water = 100,
  power = 100,
  currentObjective = "Restore Communications",
  selectedTool = "Drill",
  onSelectTool,
}) {
  const values = { health, oxygen, water, power };

  return (
    <div className="game-hud">
      <section aria-label="Suit status" className="game-panel hud-status">
        <p className="game-eyebrow">SUIT STATUS</p>
        {resources.map((resource) => {
          const value = Math.min(100, Math.max(0, Number(values[resource.key]) || 0));

          return (
            <div className="hud-meter" key={resource.key}>
              <div className="hud-meter__heading">
                <span>{resource.label}</span>
                <span>{value}%</span>
              </div>
              <progress
                aria-label={`${resource.label}: ${value}%`}
                max="100"
                value={value}
              >
                {value}%
              </progress>
            </div>
          );
        })}
      </section>

      <section aria-label="Current objective" className="game-panel hud-objective">
        <p className="game-eyebrow">CURRENT OBJECTIVE</p>
        <p className="hud-objective__text">{currentObjective}</p>
      </section>

      <nav aria-label="Tool hotbar" className="game-panel hud-hotbar">
        {tools.map((tool, index) => (
          <button
            aria-pressed={selectedTool === tool}
            className={`hud-tool${selectedTool === tool ? " is-selected" : ""}`}
            key={tool}
            onClick={() => onSelectTool?.(tool)}
            type="button"
          >
            <span aria-hidden="true" className="hud-tool__key">
              {index + 1}
            </span>
            <span>{tool}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
