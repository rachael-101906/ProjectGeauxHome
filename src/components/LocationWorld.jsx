import { useEffect, useMemo, useRef, useState } from "react";
import { getGameLocation } from "../data/gameLocations.js";
import usePlayerController from "../systems/PlayerController.js";
import Player from "./Player.jsx";
import "./location-world.css";

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1800;
const INTERACTION_RANGE = 115;
const ACTION_DURATION = 420;

function getEntityClass(resource) {
  return resource.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function LocationWorld({
  location,
  selectedTool,
  onSelectTool,
  onInteract,
  paused = false,
}) {
  const scene = getGameLocation(location);
  const controller = usePlayerController({
    initialPosition: scene.spawn,
    onSelectTool,
    paused,
  });
  const [action, setAction] = useState(null);
  const actionTimeout = useRef(null);
  const interactionHandler = useRef(onInteract);
  const interactables = useMemo(
    () => [
      ...scene.resourceNodes.map((node) => ({
        ...node,
        type: "resource",
        label: `${node.resource} node`,
      })),
      ...scene.npcs
        .filter((npc) => npc.id === "rover")
        .map((npc) => ({ ...npc, type: "rover", label: "R.O.V.E.R." })),
      ...(scene.interactables ?? []).map((item) => ({
        ...item,
        label: item.name,
      })),
    ],
    [scene],
  );

  useEffect(() => {
    interactionHandler.current = onInteract;
  }, [onInteract]);

  const nearbyInteractable = interactables.find(
    (entity) =>
      Math.hypot(entity.x - controller.position.x, entity.y - controller.position.y) <=
      INTERACTION_RANGE,
  );

  useEffect(() => {
    if (paused) return undefined;

    function handleKeyDown(event) {
      if (event.key.toLowerCase() !== "e" || event.repeat) return;
      if (!nearbyInteractable) return;
      event.preventDefault();
      interactionHandler.current?.(nearbyInteractable);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nearbyInteractable, paused]);

  useEffect(
    () => () => {
      if (actionTimeout.current) window.clearTimeout(actionTimeout.current);
    },
    [],
  );

  function useEquippedItem() {
    if (paused) return;
    setAction(selectedTool === "Blaster" ? "shooting" : "mining");
    window.clearTimeout(actionTimeout.current);
    actionTimeout.current = window.setTimeout(() => setAction(null), ACTION_DURATION);
  }

  const animation = action ?? controller.animation;

  return (
    <section
      aria-label={`${scene.name} exploration area`}
      className={`location-game location-game--${scene.tint}`}
      onPointerDown={(event) => {
        if (event.button === 0 && !event.target.closest("button")) {
          useEquippedItem();
        }
      }}
    >
      <div
        className="location-game__world"
        style={{
          backgroundImage: `url("${scene.background}")`,
          height: WORLD_HEIGHT,
          left: `calc(50% - ${controller.position.x}px)`,
          top: `calc(50% - ${controller.position.y}px)`,
          width: WORLD_WIDTH,
        }}
      >
        {(scene.decorations ?? []).map((decoration) => (
          <img
            alt=""
            aria-hidden="true"
            className="location-decoration"
            key={decoration.id}
            src={decoration.image}
            style={{
              left: decoration.x,
              top: decoration.y,
              width: decoration.width,
            }}
          />
        ))}
        {scene.resourceNodes.map((node) => (
          <div
            aria-label={`${node.resource} resource node`}
            className={`location-entity location-entity--resource location-entity--${getEntityClass(node.resource)}`}
            key={node.id}
            role="img"
            style={{ left: node.x, top: node.y }}
          >
            <span aria-hidden="true">◆</span>
            <span className="location-entity__label">{node.resource}</span>
          </div>
        ))}
        {scene.npcs.map((npc) => (
          <div
            aria-label={`NPC: ${npc.name}`}
            className="location-entity location-entity--npc"
            key={npc.id}
            role="img"
            style={{ left: npc.x, top: npc.y }}
          >
            <span aria-hidden="true">●</span>
            <span className="location-entity__label">{npc.name}</span>
          </div>
        ))}
        {(scene.interactables ?? []).map((item) => (
          <div
            aria-label={item.name}
            className="location-entity location-entity--habitat"
            key={item.id}
            role="img"
            style={{ left: item.x, top: item.y }}
          >
            <span aria-hidden="true">⚡</span>
            <span className="location-entity__label">{item.name}</span>
          </div>
        ))}
        {scene.enemySpawnPoints.map((spawn) => (
          <div
            aria-label={`${spawn.enemy} spawn point`}
            className="location-entity location-entity--enemy"
            key={spawn.id}
            role="img"
            style={{ left: spawn.x, top: spawn.y }}
          >
            <span aria-hidden="true">!</span>
            <span className="location-entity__label">{spawn.enemy}</span>
          </div>
        ))}
      </div>

      <Player
        animation={animation}
        direction={controller.direction}
        equippedItem={selectedTool}
        frame={controller.frame}
      />

      {nearbyInteractable && !paused && (
        <p aria-live="polite" className="location-game__prompt">
          PRESS E TO {nearbyInteractable.type === "resource"
            ? `COLLECT ${nearbyInteractable.resource.toUpperCase()}`
            : nearbyInteractable.type === "habitat"
              ? "RESTORE HABITAT POWER"
              : "TALK TO R.O.V.E.R."}
        </p>
      )}

      <div aria-label="Equipment hotbar" className="player-hotbar">
        {["Pickaxe", "Blaster"].map((tool, index) => (
          <button
            aria-pressed={selectedTool === tool}
            className={`player-hotbar__slot${selectedTool === tool ? " is-selected" : ""}`}
            key={tool}
            onClick={() => onSelectTool(tool)}
            type="button"
          >
            <span className="player-hotbar__key">{index + 1}</span>
            {tool}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="location-game__controls">
        WASD MOVE <span aria-hidden="true">·</span> 1 PICKAXE{" "}
        <span aria-hidden="true">·</span> 2 BLASTER{" "}
        <span aria-hidden="true">·</span> E INTERACT
      </p>
    </section>
  );
}
