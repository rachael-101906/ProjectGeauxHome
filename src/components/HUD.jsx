import "./game-ui.css";
import CurrentObjective from "./CurrentObjective.jsx";

const resources = [
  { key: "health", label: "HEALTH", value: 100 },
  { key: "oxygen", label: "OXYGEN", value: 100 },
  { key: "water", label: "WATER", value: 100 },
  { key: "power", label: "POWER", value: 100 },
];

export default function HUD({
  health = 100,
  oxygen = 100,
  water = 100,
  power = 100,
  currentObjective = "Find R.O.V.E.R.",
  objectiveProgress,
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

      <CurrentObjective
        objective={currentObjective}
        progress={objectiveProgress}
      />
    </div>
  );
}
