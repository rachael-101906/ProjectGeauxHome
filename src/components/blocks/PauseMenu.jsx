import "./game-ui.css";

const menuItems = [
  { label: "RESUME", action: "onResume" },
  { label: "CONTROLS", action: "onControls" },
  { label: "SETTINGS", action: "onSettings" },
  { label: "MAIN MENU", action: "onMainMenu" },
  { label: "QUIT", action: "onQuit", variant: "pause-menu__quit" },
];

export default function PauseMenu({
  onResume,
  onControls,
  onSettings,
  onMainMenu,
  onQuit,
  notice,
}) {
  const actions = { onResume, onControls, onSettings, onMainMenu, onQuit };

  return (
    <div className="pause-overlay">
      <section
        aria-labelledby="pause-menu-title"
        aria-modal="true"
        className="game-panel pause-menu"
        role="dialog"
      >
        <p className="game-eyebrow">MISSION PAUSED</p>
        <h2 className="game-title" id="pause-menu-title">
          SYSTEM MENU
        </h2>

        <nav aria-label="Pause menu" className="pause-menu__actions">
          {menuItems.map(({ label, action, variant }) => (
            <button
              className={`game-button${variant ? ` ${variant}` : ""}`}
              key={action}
              onClick={actions[action]}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>
        {notice && (
          <p aria-live="polite" className="pause-menu__notice">
            {notice}
          </p>
        )}
      </section>
    </div>
  );
}
