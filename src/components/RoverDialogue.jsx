import "./game-ui.css";

export default function RoverDialogue({
  lines,
  onContinue,
  onClose,
}) {
  return (
    <div className="objectives-overlay">
      <section
        aria-labelledby="rover-dialogue-title"
        aria-modal="true"
        className="game-panel rover-dialogue"
        role="dialog"
      >
        <p className="game-eyebrow">R.O.V.E.R. // MISSION GUIDE</p>
        <h2 className="game-title" id="rover-dialogue-title">
          STATUS UPDATE
        </h2>
        <div className="rover-dialogue__lines">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="rover-dialogue__actions">
          <button className="game-button" onClick={onContinue} type="button">
            CONTINUE
          </button>
          <button className="game-button" onClick={onClose} type="button">
            CLOSE
          </button>
        </div>
      </section>
    </div>
  );
}
