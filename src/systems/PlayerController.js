import { useEffect, useRef, useState } from "react";
import { getAnimationState, DIRECTIONS } from "./AnimationController.js";

const MOVEMENT_KEYS = {
  w: { x: 0, y: -1, direction: DIRECTIONS.UP },
  a: { x: -1, y: 0, direction: DIRECTIONS.LEFT },
  s: { x: 0, y: 1, direction: DIRECTIONS.DOWN },
  d: { x: 1, y: 0, direction: DIRECTIONS.RIGHT },
};

const WALK_SPEED = 220;
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1800;

export default function usePlayerController({
  initialPosition,
  onSelectTool,
  paused,
}) {
  const [position, setPosition] = useState(initialPosition);
  const [direction, setDirection] = useState(DIRECTIONS.DOWN);
  const [isMoving, setIsMoving] = useState(false);
  const [frame, setFrame] = useState(0);
  const pressedKeys = useRef(new Set());
  const toolHandler = useRef(onSelectTool);

  useEffect(() => {
    toolHandler.current = onSelectTool;
  }, [onSelectTool]);

  useEffect(() => {
    setPosition(initialPosition);
    setDirection(DIRECTIONS.DOWN);
    pressedKeys.current.clear();
  }, [initialPosition]);

  useEffect(() => {
    if (paused) {
      pressedKeys.current.clear();
      setIsMoving(false);
      return undefined;
    }

    function handleKeyDown(event) {
      const key = event.key.toLowerCase();
      if (MOVEMENT_KEYS[key]) {
        event.preventDefault();
        pressedKeys.current.add(key);
      } else if (key === "1" || key === "2") {
        toolHandler.current?.(key === "1" ? "Pickaxe" : "Blaster");
      }
    }

    function handleKeyUp(event) {
      pressedKeys.current.delete(event.key.toLowerCase());
    }

    function clearMovement() {
      pressedKeys.current.clear();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearMovement);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearMovement);
    };
  }, [paused]);

  useEffect(() => {
    if (paused) return undefined;

    let requestId;
    let previousTime = 0;
    let lastSpriteFrame = 0;
    let currentFrame = 0;

    function update(time) {
      const delta = previousTime
        ? Math.min((time - previousTime) / 1000, 0.05)
        : 0;
      previousTime = time;

      let dx = 0;
      let dy = 0;
      let facingDirection;
      for (const key of pressedKeys.current) {
        const movement = MOVEMENT_KEYS[key];
        dx += movement.x;
        dy += movement.y;
        facingDirection = movement.direction;
      }

      const moving = dx !== 0 || dy !== 0;
      setIsMoving(moving);
      if (moving) {
        const magnitude = Math.hypot(dx, dy);
        dx /= magnitude;
        dy /= magnitude;
        setPosition((current) => ({
          x: Math.max(
            100,
            Math.min(WORLD_WIDTH - 100, current.x + dx * WALK_SPEED * delta),
          ),
          y: Math.max(
            150,
            Math.min(WORLD_HEIGHT - 100, current.y + dy * WALK_SPEED * delta),
          ),
        }));
        if (facingDirection) setDirection(facingDirection);

        if (time - lastSpriteFrame > 140) {
          currentFrame = currentFrame === 0 ? 1 : 0;
          setFrame(currentFrame);
          lastSpriteFrame = time;
        }
      }

      requestId = window.requestAnimationFrame(update);
    }

    requestId = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(requestId);
  }, [paused]);

  return {
    position,
    direction,
    animation: getAnimationState(direction, isMoving),
    frame,
  };
}
