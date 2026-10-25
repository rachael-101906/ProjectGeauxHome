import "./css/game-ui.css";

export default function CurrentObjective({
  objective,
  progress,
  expanded = false,
  onClose,
}) {
  return (
    <section
      aria-label="Current objective"
      aria-modal={expanded ? "true" : undefined}
      className={`game-panel hud-objective current-objective${expanded ? " current-objective--expanded" : ""}`}
      role={expanded ? "dialog" : undefined}
    >
      <header className="current-objective__header">
        <p className="game-eyebrow">CURRENT OBJECTIVE</p>
        {expanded && (
          <button
            aria-label="Close current objective"
            className="game-icon-button"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        )}
      </header>
      <p aria-live="polite" className="hud-objective__text">
        {objective}
      </p>
      {Number.isFinite(progress) && (
        <progress
          aria-label={`Objective progress: ${progress} of 10 Ice`}
          max="10"
          value={progress}
        >
          {progress}/10
        </progress>
      )}
    </section>
  );
}
