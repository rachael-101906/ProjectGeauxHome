import { useEffect } from "react";
import "./game-ui.css";

const defaultObjectives = [
  { name: "Communication Array", progress: 0 },
  { name: "Life Support Core", progress: 0 },
  { name: "Power System", progress: 0 },
  { name: "Propulsion Engine", progress: 0 },
];

function clampProgress(progress) {
  return Math.min(100, Math.max(0, Number(progress) || 0));
}

export default function ObjectivesMenu({
  isOpen = true,
  objectives = defaultObjectives,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen || !onClose) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const totalProgress =
    objectives.length === 0
      ? 0
      : Math.round(
          objectives.reduce(
            (total, objective) => total + clampProgress(objective.progress),
            0,
          ) / objectives.length,
        );

  return (
    <div className="objectives-overlay">
      <section
        className="game-panel objectives-menu"
        aria-labelledby="objectives-title"
        aria-modal="true"
        role="dialog"
      >
        <header className="objectives-menu__header">
          <div>
            <p className="game-eyebrow">SHIP SYSTEMS // TAB MENU</p>
            <h2 className="game-title" id="objectives-title">
              MISSION OBJECTIVES
            </h2>
          </div>
          {onClose && (
            <button
              aria-label="Close objectives"
              className="game-icon-button"
              onClick={onClose}
              type="button"
            >
              X
            </button>
          )}
        </header>

        <div
          aria-label={`Overall mission progress: ${totalProgress}%`}
          className="objectives-menu__overall"
        >
          <span>OVERALL REPAIR STATUS</span>
          <span className="objectives-menu__percentage">{totalProgress}%</span>
          <progress max="100" value={totalProgress}>
            {totalProgress}%
          </progress>
        </div>

        <ul className="objectives-list">
          {objectives.map((objective) => {
            const progress = clampProgress(objective.progress);

            return (
              <li className="objectives-list__item" key={objective.name}>
                <div className="objectives-list__heading">
                  <span>{objective.name}</span>
                  <span>{progress}%</span>
                </div>
                <progress
                  aria-label={`${objective.name} progress`}
                  max="100"
                  value={progress}
                >
                  {progress}%
                </progress>
                <span className="objectives-list__status">
                  {progress === 100 ? "SYSTEM RESTORED" : "REPAIR REQUIRED"}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="objectives-menu__hint">
          PRESS ESC TO CLOSE <span aria-hidden="true">///</span> TAB: OBJECTIVES
        </p>
      </section>
    </div>
  );
}
