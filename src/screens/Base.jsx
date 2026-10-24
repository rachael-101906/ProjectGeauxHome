
import { useCallback, useEffect, useRef, useState } from "react";

import HUD from "../components/HUD.jsx";
import ObjectivesMenu from "../components/ObjectivesMenu.jsx";
import PauseMenu from "../components/PauseMenu.jsx";
import RoverDialogue from "../components/RoverDialogue.jsx";

import smoke from "../components/assets/icons/pixel-art-32x32-2f.gif";
import arcadia from "../components/assets/backgrounds/arcadia.png";
import albaMons from "../components/assets/backgrounds/alba-mons.png";
import tempeTerra from "../components/assets/backgrounds/tempe-terra.png";
import vastitasBorealis from "../components/assets/backgrounds/vastitas-borealis.png";
import spaceship from "../components/assets/icons/spaceship.png";
import roverSprite from "../components/assets/characters/rover.png";
import ores from "../data/ores.js";

import hugh from "../components/assets/characters/Hugh.png";
import hughLeft from "../components/assets/characters/HughL.png";
import hughSway1 from "../components/assets/characters/HughLSway1.png";
import hughSway2 from "../components/assets/characters/HughLSway2.png";


import { rover_dialogue, user_dialogue } from "../data/dialogue.js";

// ============================================
// GAME CONFIGURATION
// ============================================

const MOVE_SPEED_X = 30;
const MOVE_SPEED_Y = 34;

const MOVE_LIMITS = {
  minX: 10,
  maxX: 90,
  minY: 50,
  maxY: 88,
};

const START_POSITION = {
  x: 25,
  y: 72,
};

const ROVER_SPOT = {
  x: 80,
  y: 53,
};

const ROVER_REACH = {
  x: 12,
  y: 10,
};

// A mineable ore deposit appears at this position in each location.
const MINE_SPOT = { x: 55, y: 75 };
const MINE_REACH = { x: 9, y: 12 };
const LOCATION_TITLE_DURATION = 1000;
const ROVER_RIDE_DURATION = 2200;

const TRANSITION_DURATION = 1200;
const INTRO_DURATION = 1200;

const ROVER_ASK_NAME = 0;
const ROVER_LAST_LINE = rover_dialogue.length - 1;
const LOCATION_ORES = {
  arcadia: "iron",
  albaMons: "silica",
  tempeTerra: "iron",
  vastitas: "ice",
};
const PICKAXE_DAMAGE = {
  Drill: 10,
  T1P: 5,
  T2P: 10,
  T3P: 20,
  T4P: 40,
};

const MOVE_KEYS = {
  arrowleft: "left",
  a: "left",
  arrowright: "right",
  d: "right",
  arrowup: "up",
  w: "up",
  arrowdown: "down",
  s: "down",
};


const WALK_ANIMATION_SPEED = 0.16; // Seconds per frame

const HUGH_SPRITES = {
  right: hugh,
  left: hughLeft,
  sway1: hughSway1,
  sway2: hughSway2,
};

const missionObjectives = [
  { name: "Communication Array", progress: 0 },
  { name: "Life Support Core", progress: 0 },
  { name: "Power System", progress: 0 },
  { name: "Propulsion Engine", progress: 0 },
];

const locations = [
  { id: "arcadia", name: "ARCADIA PLANITIA", asset: arcadia },
  { id: "albaMons", name: "ALBA MONS", asset: albaMons },
  { id: "tempeTerra", name: "TEMPE TERRA", asset: tempeTerra },
  { id: "vastitas", name: "VASTITAS BOREALIS", asset: vastitasBorealis },
];

// ============================================
// HELPERS
// ============================================

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isTyping(target) {
  return (
    target instanceof HTMLElement &&
    (
      target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
    )
  );
}

function getLocation(id) {
  return locations.find((location) => location.id === id) ?? locations[0];
}

// ============================================
// BASE GAME
// ============================================

export default function Base({
  onMainMenu,
  onSave,
  saveError,
  savedGame = {},
}) {
  // ------------------------------------------
  // GAME STATE
  // ------------------------------------------

  const [locationId, setLocationId] = useState(
    () => getLocation(savedGame.location).id
  );

  const [selectedTool, setSelectedTool] = useState(
    savedGame.selectedTool || "Drill"
  );

  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseNotice, setPauseNotice] = useState("");

  const [travelTarget, setTravelTarget] = useState(null);
  const [showTravelArrows, setShowTravelArrows] = useState(
    savedGame.showTravelArrows ?? false
  );

  // Dialogue
  const [roverOpen, setRoverOpen] = useState(false);
  const [roverLine, setRoverLine] = useState(ROVER_ASK_NAME);

  // Player interaction
  const [nearRover, setNearRover] = useState(false);
  const [oreCount, setOreCount] = useState(() => Math.max(0, Number(savedGame.oreCount) || 0));
  const [minedLocations, setMinedLocations] = useState(() => Array.isArray(savedGame.minedLocations) ? savedGame.minedLocations : []);
  const [oreHealth, setOreHealth] = useState(() => savedGame.oreHealth ?? {});
  const [miningNotice, setMiningNotice] = useState("");
  const [roverIntroComplete, setRoverIntroComplete] = useState(
    savedGame.roverIntroComplete === true,
  );

  // Cutscene and transitions
  const [fadeIn, setFadeIn] = useState(true);
  const [fadeToBlack, setFadeToBlack] = useState(false);
  const [showIntroDialogue, setShowIntroDialogue] = useState(true);
  const [showMoveTutorial, setShowMoveTutorial] = useState(true);
  const [showLocationTitle, setShowLocationTitle] = useState(true);
  const [charactersVisible, setCharactersVisible] = useState(false);
  const [roverRide, setRoverRide] = useState(false);

  // ------------------------------------------
  // REFS
  // ------------------------------------------
  const hughRef = useRef(null);
  const hughSpriteRef = useRef(null);

  const facingRef = useRef("right");
  const walkFrameRef = useRef(0);
  const walkTimerRef = useRef(0);

  const positionRef = useRef({
    x: clamp(savedGame.playerX ?? START_POSITION.x,
      MOVE_LIMITS.minX, MOVE_LIMITS.maxX),
    y: clamp(savedGame.playerY ?? START_POSITION.y,
      MOVE_LIMITS.minY, MOVE_LIMITS.maxY),
  });

  const heldKeys = useRef(new Set());
  const nearRoverRef = useRef(false);
  const blockedRef = useRef(false);
  const miningNoticeTimerRef = useRef(null);

  const transitionTimerRef = useRef(null);
  const frameRef = useRef(null);

  // ------------------------------------------
  // DERIVED STATE
  // ------------------------------------------

  const currentLocation = getLocation(locationId);

  const locationIndex = locations.findIndex(
    (location) => location.id === locationId
  );

  const previousLocation =
    locations[
      (locationIndex - 1 + locations.length) % locations.length
    ];

  const nextLocation =
    locations[(locationIndex + 1) % locations.length];

  const movementBlocked =
    paused ||
    objectivesOpen ||
    roverOpen ||
    Boolean(travelTarget) ||
    roverRide ||
    showLocationTitle ||
    !charactersVisible ||
    fadeIn ||
    fadeToBlack;

  blockedRef.current = movementBlocked;

  // ------------------------------------------
  // SAVE HELPERS
  // ------------------------------------------

  const saveProgress = useCallback(
    (updates = {}) => {
      onSave?.({
        selectedTool,
        location: locationId,
        playerX: positionRef.current.x,
        playerY: positionRef.current.y,
        showTravelArrows,
        oreCount,
        minedLocations,
        oreHealth,
        roverIntroComplete,
        ...updates,
      });
    },
    [
      onSave,
      selectedTool,
      locationId,
      showTravelArrows,
      oreCount,
      minedLocations,
      oreHealth,
      roverIntroComplete,
    ]
  );

  const mineResource = useCallback(() => {
    const { x, y } = positionRef.current;
    const closeEnough =
      Math.abs(x - MINE_SPOT.x) <= MINE_REACH.x &&
      Math.abs(y - MINE_SPOT.y) <= MINE_REACH.y;

    if (!closeEnough) {
      setMiningNotice("MOVE CLOSER TO MINE");
    } else if (!(selectedTool in PICKAXE_DAMAGE)) {
      setMiningNotice("SELECT THE DRILL TO MINE");
    } else if (minedLocations.includes(locationId)) {
      setMiningNotice("THIS DEPOSIT IS EMPTY");
    } else {
      const oreId = LOCATION_ORES[locationId] ?? "ice";
      const ore = ores[oreId];
      const currentHealth = oreHealth[locationId] ?? ore.health;
      const damage = PICKAXE_DAMAGE[selectedTool];
      const remainingHealth = Math.max(0, currentHealth - damage);
      const nextOreHealth = { ...oreHealth, [locationId]: remainingHealth };

      setOreHealth(nextOreHealth);

      if (remainingHealth > 0) {
        setMiningNotice(`HIT ${oreId.toUpperCase()}: ${remainingHealth} HP LEFT`);
        saveProgress({ oreHealth: nextOreHealth });
      } else {
        const nextMinedLocations = [...minedLocations, locationId];
        const nextOreCount = oreCount + 1;
        setOreCount(nextOreCount);
        setMinedLocations(nextMinedLocations);
        setMiningNotice(`MINED ${oreId.toUpperCase()} +1 MARTIAN ORE`);
        saveProgress({
          oreCount: nextOreCount,
          minedLocations: nextMinedLocations,
          oreHealth: nextOreHealth,
        });
      }
    }

    if (miningNoticeTimerRef.current) {
      window.clearTimeout(miningNoticeTimerRef.current);
    }
    miningNoticeTimerRef.current = window.setTimeout(() => {
      setMiningNotice("");
    }, 1800);
  }, [selectedTool, minedLocations, locationId, oreCount, oreHealth, saveProgress]);

  const mineResourceRef = useRef(mineResource);
  mineResourceRef.current = mineResource;
  const saveProgressRef = useRef(saveProgress);
  saveProgressRef.current = saveProgress;

  // ------------------------------------------
  // OPENING FADE
  // ------------------------------------------

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFadeIn(false);
    }, INTRO_DURATION);

    return () => window.clearTimeout(timer);
  }, []);

  // Each location gets a brief title card before Hugh and the NPCs appear.
  useEffect(() => {
    setShowLocationTitle(true);
    setCharactersVisible(false);

    const titleTimer = window.setTimeout(() => {
      setShowLocationTitle(false);
      setCharactersVisible(true);
      setFadeIn(false);
    }, LOCATION_TITLE_DURATION);

    return () => window.clearTimeout(titleTimer);
  }, [locationId]);

  // ------------------------------------------
  // POSITION RENDERING
  // ------------------------------------------

  const updatePlayerPosition = useCallback(() => {
    const element = hughRef.current;
    if (!element) return;

    const { x, y } = positionRef.current;

    element.style.left = `${x}%`;
    element.style.top = `${y}%`;
  }, []);

  // Keep player positioning consistent when the
  // active location changes.
  useEffect(() => {
    updatePlayerPosition();
  }, [locationId, updatePlayerPosition]);

  // ------------------------------------------
  // R.O.V.E.R. PROXIMITY
  // ------------------------------------------

  const checkRoverProximity = useCallback(() => {
    if (locationId !== "arcadia") {
      nearRoverRef.current = false;
      setNearRover(false);
      return;
    }

    const { x, y } = positionRef.current;

    const near =
      Math.abs(x - ROVER_SPOT.x) <= ROVER_REACH.x &&
      Math.abs(y - ROVER_SPOT.y) <= ROVER_REACH.y;

    if (near !== nearRoverRef.current) {
      nearRoverRef.current = near;
      setNearRover(near);
    }
  }, [locationId]);

  // ------------------------------------------
  // PLAYER SPRITE ANIMATION
  // ------------------------------------------

  function updateHughSprite(moving, dx, dt) {
    const sprite = hughSpriteRef.current;
    if (!sprite) return;

    // Update facing only when moving horizontally.
    if (dx > 0) {
      facingRef.current = "right";
    } else if (dx < 0) {
      facingRef.current = "left";
    }

    if (!moving) {
      walkTimerRef.current = 0;
      walkFrameRef.current = 0;
      sprite.src = HUGH_SPRITES[facingRef.current];
      return;
    }

    walkTimerRef.current += dt;

    if (walkTimerRef.current >= WALK_ANIMATION_SPEED) {
      walkTimerRef.current %= WALK_ANIMATION_SPEED;
      walkFrameRef.current = 1 - walkFrameRef.current;
    }

    sprite.src =
      walkFrameRef.current === 0
        ? HUGH_SPRITES.sway1
        : HUGH_SPRITES.sway2;
  }

  // ------------------------------------------
  // MOVEMENT SYSTEM
  // ------------------------------------------

  useEffect(() => {
    const held = heldKeys.current;

    function onKeyDown(event) {
      if (isTyping(event.target)) return;

      const key = event.key.toLowerCase();

      // Interact with R.O.V.E.R. or mine nearby ore with E.
      if (key === "e" && !event.repeat && !blockedRef.current) {
        if (nearRoverRef.current) {
          event.preventDefault();
          held.clear();
          setRoverOpen(true);
          setShowIntroDialogue(false);
          return;
        }

        const { x, y } = positionRef.current;
        const nearMine =
          Math.abs(x - MINE_SPOT.x) <= MINE_REACH.x &&
          Math.abs(y - MINE_SPOT.y) <= MINE_REACH.y;

        if (nearMine) {
          event.preventDefault();
          held.clear();
          mineResourceRef.current();
          return;
        }
      }

      const direction = MOVE_KEYS[key];

      if (!direction) return;

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (blockedRef.current) return;

      event.preventDefault();
      held.add(direction);

      setShowMoveTutorial(false);
      setShowIntroDialogue(false);
    }

    function onKeyUp(event) {
      const direction = MOVE_KEYS[event.key.toLowerCase()];
      if (direction) held.delete(direction);
    }

    function releaseAll() {
      held.clear();

      if (hughRef.current) {
        delete hughRef.current.dataset.walking;
      }
    }

    let lastTime = performance.now();

    function tick(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const element = hughRef.current;

      let dx = 0;
      let dy = 0;

      if (!blockedRef.current) {
        dx =
          Number(held.has("right")) -
          Number(held.has("left"));

        dy =
          Number(held.has("down")) -
          Number(held.has("up"));
      } else {
        held.clear();
      }

      const moving = dx !== 0 || dy !== 0;

      if (moving) {
        const magnitude = Math.hypot(dx, dy);

        dx /= magnitude;
        dy /= magnitude;

        const position = positionRef.current;

        position.x = clamp(
          position.x + dx * MOVE_SPEED_X * dt,
          MOVE_LIMITS.minX,
          MOVE_LIMITS.maxX
        );

        position.y = clamp(
          position.y + dy * MOVE_SPEED_Y * dt,
          MOVE_LIMITS.minY,
          MOVE_LIMITS.maxY
        );

        if (element) {
          element.style.left = `${position.x}%`;
          element.style.top = `${position.y}%`;
        }
      }

      if (element) {
        element.dataset.walking = String(moving);
      }

      updateHughSprite(moving, dx, dt);
      checkRoverProximity();

      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);

    return () => {
      cancelAnimationFrame(frameRef.current);

      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);

      held.clear();
    };
  }, [checkRoverProximity]);

  // ------------------------------------------
  // PAUSE / OBJECTIVES CONTROLS
  // ------------------------------------------

  useEffect(() => {
    function handleKeyDown(event) {
      if (isTyping(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === "escape" || key === "p") {
        event.preventDefault();

        if (travelTarget) {
          setTravelTarget(null);
          return;
        }

        if (roverOpen) {
          setRoverOpen(false);
          setRoverLine(ROVER_ASK_NAME);
          return;
        }

        if (key === "escape" && objectivesOpen && !paused) {
          setObjectivesOpen(false);
          return;
        }

        if (fadeToBlack || fadeIn) return;

        setObjectivesOpen(false);
        setPaused((value) => !value);
        setPauseNotice("");
        return;
      }

      if (paused) return;

      if (key === "tab") {
        event.preventDefault();

        setObjectivesOpen((value) => !value);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    objectivesOpen,
    paused,
    roverOpen,
    travelTarget,
    fadeToBlack,
    fadeIn,
  ]);

  // ------------------------------------------
  // DIALOGUE
  // ------------------------------------------

  const closeRover = useCallback(() => {
    setRoverOpen(false);
    setRoverLine(ROVER_ASK_NAME);
  }, []);

  // After the introductory dialogue, Hugh can ride R.O.V.E.R. to any location.
  const beginRoverRide = useCallback((destination = getLocation("vastitas")) => {
    heldKeys.current.clear();
    setRoverOpen(false);
    setRoverRide(true);
    setShowIntroDialogue(false);
    setShowMoveTutorial(false);
    setRoverIntroComplete(true);
    setShowTravelArrows(true);

    transitionTimerRef.current = window.setTimeout(() => {
      setFadeToBlack(true);
      transitionTimerRef.current = window.setTimeout(() => {
        positionRef.current = { ...START_POSITION };
        setLocationId(destination.id);
        setNearRover(false);
        nearRoverRef.current = false;
        setRoverRide(false);
        setFadeToBlack(false);
        setShowLocationTitle(true);
        setCharactersVisible(false);
        setShowIntroDialogue(false);
        setShowMoveTutorial(false);
        saveProgressRef.current({
          location: destination.id,
          playerX: START_POSITION.x,
          playerY: START_POSITION.y,
          showTravelArrows: true,
          roverIntroComplete: true,
        });
        updatePlayerPosition();
      }, TRANSITION_DURATION);
    }, ROVER_RIDE_DURATION);
  }, [updatePlayerPosition]);

  const roverActions = roverIntroComplete
    ? locations
        .filter((location) => location.id !== locationId)
        .map((destination) => ({
          label: `TRAVEL TO ${destination.name}`,
          onClick: () => beginRoverRide(destination),
        }))
    : roverLine === ROVER_ASK_NAME
      ? user_dialogue.map((label, index) => ({
          label,
          onClick: () => {
            if (index === 0) {
              setRoverLine(1);
            } else {
              closeRover();
            }
          },
        }))
      : roverLine < ROVER_LAST_LINE
      ? [
          {
            label: "CONTINUE",
            onClick: () => {
              setRoverLine((line) => line + 1);
            },
          },
        ]
      : [
          {
            label: "LET'S GO",
            onClick: beginRoverRide,
          },
        ];

  // ------------------------------------------
  // TRAVEL SYSTEM
  // ------------------------------------------

  const startTravel = useCallback(
    (destination) => {
      if (movementBlocked) return;

      if (destination.id === locationId) return;

      setTravelTarget(destination);
    },
    [movementBlocked, locationId]
  );

  function confirmTravel() {
    if (!travelTarget || fadeToBlack) return;

    const destination = travelTarget;

    // Stop movement before transitioning.
    heldKeys.current.clear();

    setTravelTarget(null);
    setFadeToBlack(true);

    // Fade to black, update map, then fade in.
    transitionTimerRef.current = window.setTimeout(() => {
      setLocationId(destination.id);

      // Restore default spawn for the destination.
      // Later, replace with per-map spawn points.
      positionRef.current = { ...START_POSITION };

      setNearRover(false);
      nearRoverRef.current = false;

      setShowIntroDialogue(false);
      setShowMoveTutorial(false);

      setFadeToBlack(false);
      setShowLocationTitle(true);
      setCharactersVisible(false);

      // Save the new destination and position.
      saveProgress({
        location: destination.id,
        playerX: START_POSITION.x,
        playerY: START_POSITION.y,
      });

      updatePlayerPosition();
    }, TRANSITION_DURATION);
  }

  // Clean up pending transition timers.
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (miningNoticeTimerRef.current) {
        window.clearTimeout(miningNoticeTimerRef.current);
      }
    };
  }, []);

  // ------------------------------------------
  // TOOL SELECTION
  // ------------------------------------------

  function handleSelectTool(tool) {
    setSelectedTool(tool);

    saveProgress({
      selectedTool: tool,
    });
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <main
      className="mission-screen"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ================================== */}
      {/* FADE OVERLAY                       */}
      {/* ================================== */}

      <div
        className={`black-fade ${
          fadeIn || fadeToBlack ? "black-fade--active" : ""
        }`}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "black",
          zIndex: 99,
          pointerEvents: "none",
          transition: "opacity 1.2s ease-in-out",
          opacity: fadeIn || fadeToBlack ? 1 : 0,
        }}
      />

      {roverRide && (
        <div className="rover-ride-cutscene" aria-label="Hugh rides away with R.O.V.E.R.">
          <span className="rover-ride-cutscene__rover">
            <img src={roverSprite} alt="" draggable="false" />
          </span>
          <img className="rover-ride-cutscene__hugh" src={hugh} alt="" draggable="false" />
        </div>
      )}

      {/* ================================== */}
      {/* MOVEMENT TUTORIAL                  */}
      {/* ================================== */}

      {showMoveTutorial && charactersVisible && (
        <div
          className="movement-popup"
          style={{
            position: "absolute",
            top: "15%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30,
            backgroundColor: "rgba(10, 15, 25, 0.9)",
            border: "2px solid #52B2BF",
            color: "#FFF",
            padding: "10px 20px",
            borderRadius: "4px",
            fontFamily: "monospace",
            textAlign: "center",
            boxShadow: "0 0 10px rgba(82, 178, 191, 0.5)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            USE ARROW KEYS OR [W][A][S][D] TO MOVE
          </p>

          <button
            onClick={() => setShowMoveTutorial(false)}
            style={{
              marginTop: "6px",
              background: "transparent",
              border: "1px solid #52B2BF",
              color: "#52B2BF",
              fontSize: "10px",
              cursor: "pointer",
              padding: "2px 8px",
            }}
            type="button"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* ================================== */}
      {/* WORLD / LANDSCAPE                 */}
      {/* ================================== */}

      <div
        aria-hidden="true"
        className="mission-landscape mission-landscape--image"
        style={{
          backgroundImage: `url("${currentLocation.asset}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* CRASH SITE */}

        {charactersVisible && (
          <div className="mission-crash-site">
            <img
              className="mission-ship"
              src={spaceship}
              alt=""
              draggable="false"
            />

            <img
              className="mission-ship-smoke"
              src={smoke}
              alt=""
              draggable="false"
              style={{
                position: "absolute",
                transform: "translate(-8px, -14px)",
              }}
            />
          </div>
        )}
      </div>

      {/* A simple pixel-style ore deposit. Press E nearby while using the Drill. */}
      {charactersVisible && !minedLocations.includes(locationId) && (
        <button
          className="mine-node"
          onClick={mineResource}
          style={{ left: `${MINE_SPOT.x}%`, top: `${MINE_SPOT.y}%` }}
          type="button"
          aria-label="Mine the nearby ore deposit"
        >
          <span className="mine-node__rock" aria-hidden="true">◆</span>
          <span className="mine-node__label">
            {LOCATION_ORES[locationId]?.toUpperCase() ?? "ORE"} [E]
          </span>
        </button>
      )}

      {miningNotice && (
        <div className="mining-notice" role="status">{miningNotice}</div>
      )}

      {charactersVisible && (
        <div className="ore-counter" aria-live="polite">MARTIAN ORE: {oreCount}</div>
      )}

      {/* ================================== */}
      {/* PLAYER                             */}
      {/* ================================== */}

      <div
        aria-label="Hugh Mann"
        className="hugh-mann"
        ref={hughRef}
        role="img"
        style={{
          left: `${positionRef.current.x}%`,
          top: `${positionRef.current.y}%`,
          position: "absolute",
          opacity: charactersVisible ? 1 : 0,
          transition: "opacity 250ms steps(2, end)",
        }}
      >
        {currentLocation.id === "arcadia" && showIntroDialogue && (
          <div className="hugh-speech-bubble">
            Ughh... where am I?
          </div>
        )}

        <img
          ref={hughSpriteRef}
          src={HUGH_SPRITES.right}
          alt=""
          draggable="false"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        />
      </div>

      {/* ================================== */}
      {/* R.O.V.E.R. NPC                     */}
      {/* ================================== */}

      {charactersVisible && (
        <button
          aria-label="Talk to R.O.V.E.R."
          className="rover-npc"
          onClick={() => {
            if (!movementBlocked) {
              setRoverOpen(true);
              setShowIntroDialogue(false);
            }
          }}
          style={{
            left: `${ROVER_SPOT.x}%`,
            top: `${ROVER_SPOT.y}%`,
            position: "absolute",
            background: "none",
            border: "none",
            cursor: movementBlocked ? "default" : "pointer",
            opacity: charactersVisible ? 1 : 0,
            transition: "opacity 250ms steps(2, end)",
            pointerEvents: charactersVisible ? "auto" : "none",
          }}
          type="button"
        >
          {showIntroDialogue && (
            <div
              style={{
                position: "absolute",
                bottom: "110%",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              <span
                className="rover-icon-badge"
                style={{
                  backgroundColor: "#FFCC00",
                  color: "#000",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "4px",
                }}
              >
                !
              </span>

              <div
                style={{
                  backgroundColor: "#102A43",
                  color: "#9FB3C8",
                  border: "1px solid #bcccdc",
                  padding: "3px 6px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  whiteSpace: "nowrap",
                }}
              >
                Hey over here!
              </div>
            </div>
          )}

          <span className="rover-npc__art">
            <img
              alt=""
              draggable="false"
              src={roverSprite}
            />
          </span>

          {nearRover && !movementBlocked && (
            <span className="rover-npc__prompt">
              [E] TALK
            </span>
          )}
        </button>
      )}

      {/* ================================== */}
      {/* R.O.V.E.R. DIALOGUE                */}
      {/* ================================== */}

      {roverOpen && (
        <div
          className="rover-dialogue-panel"
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            zIndex: 50,
          }}
        >
          <RoverDialogue
            actions={roverActions}
            key={roverLine}
            message={
              roverIntroComplete
                ? "Beep boop. I can take you anywhere. Choose a destination."
                : rover_dialogue[roverLine]
            }
          />
        </div>
      )}

      {/* ================================== */}
      {/* LOCATION HEADER                   */}
      {/* ================================== */}

      {showLocationTitle && (
        <header className="mission-location location-title-splash">
          <p className="game-eyebrow">PROJECT GEAUX HOME // MISSION 01</p>
          <h1>{currentLocation.name}</h1>
          <p>
            {currentLocation.id === "arcadia"
              ? "CRASH SITE // SECTOR 01"
              : "TRAVEL ROUTE // SECTOR 02"}
          </p>
        </header>
      )}

      {/* ================================== */}
      {/* LOCATION NAVIGATION               */}
      {/* ================================== */}

      {showTravelArrows && charactersVisible && (
        <>
          <button
            aria-label={`Travel toward ${previousLocation.name}`}
            className="edge-travel edge-travel--left"
            disabled={movementBlocked}
            onClick={() => startTravel(previousLocation)}
            type="button"
          >
            <span aria-hidden="true">‹</span>
            <small>{previousLocation.name}</small>
          </button>

          <button
            aria-label={`Travel toward ${nextLocation.name}`}
            className="edge-travel edge-travel--right"
            disabled={movementBlocked}
            onClick={() => startTravel(nextLocation)}
            type="button"
          >
            <small>{nextLocation.name}</small>
            <span aria-hidden="true">›</span>
          </button>
        </>
      )}

      {/* ================================== */}
      {/* SAVE ERRORS                       */}
      {/* ================================== */}

      {saveError && (
        <p
          aria-live="assertive"
          className="mission-save-error"
          role="alert"
        >
          SAVE ERROR: {saveError}
        </p>
      )}

      {/* ================================== */}
      {/* HUD                                */}
      {/* ================================== */}

      {/* ================================== */}
      {/* GAME ACTIONS                       */}
      {/* ================================== */}

      {charactersVisible && (
      <div className="mission-actions">
        <button
          className="game-button"
          onClick={() => {
            if (!paused && !movementBlocked) {
              setObjectivesOpen(true);
            }
          }}
          type="button"
        >
          OBJECTIVES [TAB]
        </button>

        <button
          className="game-button"
          onClick={() => {
            if (movementBlocked) return;

            setObjectivesOpen(false);
            setPaused(true);
          }}
          type="button"
        >
          PAUSE [ESC]
        </button>
      </div>
      )}

      {/* ================================== */}
      {/* OBJECTIVES MENU                    */}
      {/* ================================== */}

      <ObjectivesMenu
        isOpen={objectivesOpen && !paused}
        objectives={savedGame.objectives || missionObjectives}
        onClose={() => setObjectivesOpen(false)}
      />

      {/* ================================== */}
      {/* PAUSE MENU                         */}
      {/* ================================== */}

      {paused && (
        <PauseMenu
          onControls={() =>
            setPauseNotice("TAB: OBJECTIVES // ESC OR P: RESUME")
          }
          onMainMenu={onMainMenu}
          onQuit={() =>
            setPauseNotice("CLOSE THIS BROWSER TAB TO QUIT THE GAME.")
          }
          onResume={() => {
            setPaused(false);
            setPauseNotice("");
          }}
          onSettings={() =>
            setPauseNotice("NO CONFIGURABLE SETTINGS YET.")
          }
          notice={pauseNotice}
        />
      )}

      {/* ================================== */}
      {/* TRAVEL CONFIRMATION                */}
      {/* ================================== */}

      {travelTarget && (
        <div
          className="travel-prompt"
          role="dialog"
          aria-modal="true"
          aria-labelledby="travel-prompt-title"
        >
          <section className="game-panel travel-prompt__panel">
            <p className="game-eyebrow">
              EDGE OF SECTOR
            </p>

            <h2 id="travel-prompt-title">
              TRAVEL TO {travelTarget.name}?
            </h2>

            <p>
              The route ahead will move you away from the crash site.
            </p>

            <div className="travel-prompt__actions">
              <button
                className="game-button"
                onClick={confirmTravel}
                type="button"
              >
                TRAVEL
              </button>

              <button
                className="game-button"
                onClick={() => setTravelTarget(null)}
                type="button"
              >
                STAY HERE
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );

}
