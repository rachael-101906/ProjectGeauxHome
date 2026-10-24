// src/screens/SaveSelect.jsx

export default function SaveSelect({ onBack }) {
  return (
    <div className="save-select">

      <h1 className="save-title">
        MISSION TERMINAL
      </h1>

      <div className="save-slots">

        <div className="save-slot">
          <h2>MISSION 1</h2>

          <p>EMPTY</p>

          <button className="new-mission-btn">
            NEW MISSION
          </button>
        </div>

        <div className="save-slot">
          <h2>MISSION 2</h2>

          <p>EMPTY</p>

          <button className="new-mission-btn">
            NEW MISSION
          </button>
        </div>

        <div className="save-slot">
          <h2>MISSION 3</h2>

          <p>EMPTY</p>

          <button className="new-mission-btn">
            NEW MISSION
          </button>
        </div>

      </div>

      <button className="back-btn" onClick={onBack}>
        BACK
      </button>

    </div>
  );
}