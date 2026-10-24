// src/screens/SaveSelect.jsx

import homeBackground from "../components/assets/backgrounds/home-page.png";

export default function SaveSelect({
  onBack,
  onContinue,
  onNewMission,
  saveError = "",
  saveSlots = [null, null, null],
}) {
  return (
    <div
      className="save-select"
      style={{ backgroundImage: `url("${homeBackground}")` }}
    >

      <h1 className="save-title">
        MISSION TERMINAL
      </h1>

      {saveError && (
        <p aria-live="assertive" className="save-error" role="alert">
          {saveError}
        </p>
      )}

      <div className="save-slots">
        {saveSlots.map((save, index) => (
          <div className="save-slot" key={index}>
            <h2>MISSION {index + 1}</h2>

            {save ? (
              <>
                <p className="save-slot__status">
                  {save.status === "briefing" ? "BRIEFING" : "IN PROGRESS"}
                </p>
                <p className="save-slot__objective">{save.currentObjective}</p>
                <p className="save-slot__date">
                  SAVED {new Date(save.updatedAt).toLocaleDateString()}
                </p>
                <button
                  className="new-mission-btn"
                  onClick={() => onContinue(save)}
                  type="button"
                >
                  CONTINUE
                </button>
              </>
            ) : (
              <>
                <p>EMPTY</p>
                <button
                  className="new-mission-btn"
                  onClick={() => onNewMission(index)}
                  type="button"
                >
                  NEW MISSION
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <button className="back-btn" onClick={onBack} type="button">
        BACK
      </button>

    </div>
  );
}