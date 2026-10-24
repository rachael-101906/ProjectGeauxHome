import Hugh from "./assets/characters/Hugh.png";
import HughLeft from "./assets/characters/HughL.png";
import HughWalkOne from "./assets/characters/HughLSway1.png";
import HughWalkTwo from "./assets/characters/HughLSway2.png";

const equipmentLabels = {
  Pickaxe: "PICKAXE",
  Blaster: "BLASTER",
};

function getSprite(animation, direction, frame) {
  if (animation.startsWith("walk_") && (direction === "left" || direction === "right")) {
    return frame ? HughWalkTwo : HughWalkOne;
  }

  if (direction === "left") return HughLeft;
  return Hugh;
}

export default function Player({
  animation = "idle_down",
  direction = "down",
  equippedItem = "Pickaxe",
  frame = 0,
}) {
  const isWalking = animation.startsWith("walk_");
  const isMining = animation === "mining";
  const isShooting = animation === "shooting";
  const flipsHorizontally = direction === "left" && isWalking;

  return (
    <div
      aria-label={`Hugh Mann, ${animation}, facing ${direction}, equipped ${equippedItem}`}
      className={`location-player location-player--${animation}`}
      role="img"
    >
      <span aria-hidden="true" className="location-player__shadow" />
      <img
        alt=""
        className={`location-player__sprite${flipsHorizontally ? " is-flipped" : ""}`}
        draggable="false"
        src={getSprite(animation, direction, frame)}
      />
      <span aria-hidden="true" className="location-player__equipment">
        {equipmentLabels[equippedItem] ?? "PICKAXE"}
      </span>
      {(isMining || isShooting) && (
        <span aria-hidden="true" className="location-player__action">
          {isMining ? "MINE!" : "FIRE!"}
        </span>
      )}
    </div>
  );
}
