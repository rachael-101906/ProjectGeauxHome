import "./location-select.css";

const locations = [
  {
    name: "Arcadia Planitia",
    description: "Crash-site refuge and the crew's first foothold on Mars.",
    resources: "Ice, Iron, Silica",
    difficulty: "LOW",
    activity: "HOME / BASE BUILDING",
  },
  {
    name: "Alba Mons",
    description: "Volcanic tunnels conceal rich veins and stronger tools.",
    resources: "Iron, Sulfur, Basalt",
    difficulty: "MODERATE",
    activity: "MINING / TOOL UPGRADES",
  },
  {
    name: "Tempe Terra",
    description: "A fractured highland where a silent relay awaits repair.",
    resources: "Silica, Iron",
    difficulty: "MODERATE",
    activity: "COMMUNICATIONS / TECH",
  },
  {
    name: "Vastitas Borealis",
    description: "A frozen trade outpost built from a stranded cargo lander.",
    resources: "Ice, Silica",
    difficulty: "LOW",
    activity: "TRADING / CREDITS",
  },
  {
    name: "Olympus Mons",
    description: "A dangerous caldera holds the final materials for your rocket.",
    resources: "Basalt, Sulfur",
    difficulty: "HIGH",
    activity: "ENDGAME COMBAT",
  },
];

export default function LocationSelect({
  currentLocation = "Arcadia Planitia",
  onBack,
  onSelect,
}) {
  return (
    <main className="location-select-screen">
      <header className="location-select-header">
        <p className="game-eyebrow">PROJECT GEAUX HOME // MARS TRANSIT</p>
        <h1>SELECT DESTINATION</h1>
        <p className="location-select-subtitle">
          CURRENT LOCATION: {currentLocation.toUpperCase()}
        </p>
      </header>

      <section aria-label="Available Mars locations" className="location-grid">
        {locations.map((location, index) => (
          <button
            aria-current={location.name === currentLocation ? "location" : undefined}
            className={`location-card${location.name === currentLocation ? " is-current" : ""}`}
            key={location.name}
            onClick={() => onSelect(location)}
            type="button"
          >
            <span className="location-card__index">
              SECTOR // 0{index + 1}
            </span>
            <span className="location-card__name">{location.name}</span>
            <span className="location-card__description">
              {location.description}
            </span>
            <span className="location-card__detail">
              <span className="location-card__label">RESOURCES</span>
              <span>{location.resources}</span>
            </span>
            <span className="location-card__detail">
              <span className="location-card__label">ENEMY DIFFICULTY</span>
              <span
                className={`location-card__difficulty location-card__difficulty--${location.difficulty.toLowerCase()}`}
              >
                {location.difficulty}
              </span>
            </span>
            <span className="location-card__activity">{location.activity}</span>
            <span className="location-card__select">
              {location.name === currentLocation ? "CURRENT LOCATION" : "SELECT SECTOR"}
            </span>
          </button>
        ))}
      </section>

      <button className="location-select-back" onClick={onBack} type="button">
        BACK TO MISSION
      </button>
    </main>
  );
}
