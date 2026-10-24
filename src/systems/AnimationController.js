export const DIRECTIONS = Object.freeze({
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
});

export function getAnimationState(direction, isMoving) {
  const normalized = String(direction ?? "").toUpperCase();
  const normalizedDirection = DIRECTIONS[normalized]
    ? normalized.toLowerCase()
    : DIRECTIONS.DOWN;

  return `${isMoving ? "walk" : "idle"}_${normalizedDirection}`;
}
