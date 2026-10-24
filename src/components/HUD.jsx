import "./game-ui.css";
import CurrentObjective from "./CurrentObjective.jsx";
import healthCritical from "./assets/icons/15.png";
import healthLow from "./assets/icons/17.png";
import healthGood from "./assets/icons/16.png";
import healthFull from "./assets/icons/18.png";

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
  const normalizedHealth = Math.min(100, Math.max(0, Number(health) || 0));
  const healthImage =
    normalizedHealth >= 87.5
      ? healthFull
      : normalizedHealth >= 62.5
        ? healthGood
        : normalizedHealth >= 37.5
          ? healthLow
          : healthCritical;

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
              {resource.key === "health" ? (
                <div
                  aria-label={`${resource.label}: ${value}%`}
                  aria-valuemax="100"
                  aria-valuemin="0"
                  aria-valuenow={value}
                  className="hud-health-art"
                  role="progressbar"
                >
                  <img alt="" src={healthImage} />
                </div>
              ) : (
                <progress
                  aria-label={`${resource.label}: ${value}%`}
                  max="100"
                  value={value}
                >
                  {value}%
                </progress>
              )}
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
