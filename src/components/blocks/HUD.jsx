import "./game-ui.css";
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
  // Keep your existing health calculation and healthImage code here.

  const tools = ["Drill", "Blaster", "Inventory"];

  return (
    <div className="game-hud">
      {/* Keep your existing health and objective sections here. */}

      <nav aria-label="Tool hotbar" className="game-panel hud-hotbar">
        {tools.map((tool, index) => (
          <button
            key={tool}
            type="button"
            aria-pressed={
              tool === "Inventory" ? undefined : selectedTool === tool
            }
            className={`hud-tool${
              selectedTool === tool && tool !== "Inventory"
                ? " is-selected"
                : ""
            }`}
            onClick={() => {
              if (tool === "Inventory") {
                onOpenInventory?.();
              } else {
                onSelectTool?.(tool);
              }
            }}
          >
            <span aria-hidden="true" className="hud-tool__key">
              {index + 1}
            </span>

            {toolIcons[tool] && (
              <img
                src={toolIcons[tool]}
                alt=""
                aria-hidden="true"
                className="hud-tool__icon"
                draggable="false"
              />
            )}

            <span>{tool}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
