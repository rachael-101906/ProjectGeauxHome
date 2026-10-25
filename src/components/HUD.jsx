import "./css/game-ui.css";
import healthCritical from "./assets/icons/third-health.png";
import healthLow from "./assets/icons/half-health.png";
import healthGood from "./assets/icons/threequarter-health.png";
import healthFull from "./assets/icons/full-health.png";

export default function HUD({
  health = 100,
  currentObjective = "",
  selectedTool = "Drill",
  onSelectTool,
  onOpenInventory,
  toolIcons = {},
}) {
  const normalizedHealth = Math.min(100, Math.max(0, Number(health) || 0));
  const healthImage =
    normalizedHealth >= 87.5
      ? healthFull
      : normalizedHealth >= 62.5
        ? healthGood
        : normalizedHealth >= 37.5
          ? healthLow
          : healthCritical;
  const tools = ["Drill", "Blaster", "Inventory"];

  return (
    <div className="game-hud">
      <section aria-label="Suit health" className="game-panel hud-status">
        <p className="game-eyebrow">HEALTH</p>
        <div className="hud-meter">
          <div className="hud-meter__heading">
            <span>Health</span>
            <span>{normalizedHealth}%</span>
          </div>
          <div
            aria-label={`Health: ${normalizedHealth}%`}
            aria-valuemax="100"
            aria-valuemin="0"
            aria-valuenow={normalizedHealth}
            className="hud-health-art"
            role="progressbar"
          >
            <img alt="" src={healthImage} />
          </div>
        </div>
      </section>
      {currentObjective && (
        <section aria-label="Current objective" className="game-panel hud-objective">
          <p className="game-eyebrow">CURRENT OBJECTIVE</p>
          <p className="hud-objective__text">{currentObjective}</p>
        </section>
      )}
      <nav aria-label="Tool hotbar" className="game-panel hud-hotbar">
        {tools.map((tool, index) => (
          <button
            aria-pressed={
              tool === "Inventory"
                ? undefined
                : selectedTool === tool
            }
            className={`hud-tool${
              selectedTool === tool ? " is-selected" : ""
            }`}
            key={tool}
            onClick={() => {
              if (tool === "Inventory") {
                onOpenInventory?.();
              } else {
                onSelectTool?.(tool);
              }
            }}
            type="button"
          >
            <span aria-hidden="true" className="hud-tool__key">
              {index + 1}
            </span>

            {toolIcons[tool] && (
              <img
                alt=""
                aria-hidden="true"
                className="hud-tool__icon"
                draggable="false"
                src={toolIcons[tool]}
              />
            )}

            <span>{tool}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
