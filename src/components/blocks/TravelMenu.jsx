import { GAME_LOCATIONS } from "../../data/gameLocations.js";
import "./game-ui.css";

export default function TravelMenu({
  currentLocation,
  onClose,
  onTravel,
}) {
  return (
    <div className="objectives-overlay">
      <section
        aria-labelledby="travel-menu-title"
        aria-modal="true"
        className="game-panel travel-menu"
        role="dialog"
      >
        <header className="objectives-menu__header">
          <div>
            <p className="game-eyebrow">R.O.V.E.R. // MARS TRANSIT</p>
            <h2 className="game-title" id="travel-menu-title">
              SELECT DESTINATION
            </h2>
          </div>
          <button
            aria-label="Close travel menu"
            className="game-icon-button"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </header>
        <p className="travel-menu__message">
          I can get us there safely. Where are we headed?
        </p>
        <nav aria-label="Available destinations" className="travel-menu__destinations">
          {GAME_LOCATIONS.map((destination) => (
            <button
              aria-current={
                destination.name === currentLocation ? "location" : undefined
              }
              className="game-button"
              disabled={destination.name === currentLocation}
              key={destination.id}
              onClick={() => onTravel(destination)}
              type="button"
            >
              {destination.name}
            </button>
          ))}
        </nav>
      </section>
    </div>
  );
}
