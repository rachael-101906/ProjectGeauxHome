import { useEffect, useRef, useState } from "react";
import HUD from "../components/HUD.jsx";
import ObjectivesMenu from "../components/ObjectivesMenu.jsx";
import PauseMenu from "../components/PauseMenu.jsx";
import RoverDialogue from "../components/RoverDialogue.jsx";
import TradingPost, { ORE_ICONS } from "./TradingPost.jsx";
import hughRight from "../components/assets/characters/Hugh.png";
import hughLeft from "../components/assets/characters/HughL.png";
import oreTypes from "../data/ores.js";
import shop from "../data/shop.js";
import { DRILL_FRAMES } from "../data/art.js";

import smoke from "../components/assets/icons/pixel-art-32x32-2f.gif";
import spaceship from "../components/assets/icons/spaceship.png";
import arcadia from "../components/assets/backgrounds/arcadia.png";
import albaMons from "../components/assets/backgrounds/alba-mons.png";
import tempeTerra from "../components/assets/backgrounds/tempe-terra.png";
import vastitasBorealis from "../components/assets/backgrounds/vastitas-borealis.png";
import roverSprite from "../components/assets/characters/rover.png";

import { rover_dialogue, user_dialogue } from "../data/dialogue.js";

// Movement tuning: percent of the screen crossed per second.
const MOVE_SPEED_X = 30;
const MOVE_SPEED_Y = 34;
// minX/maxX keep Hugh clear of the left and right travel buttons.
const MOVE_LIMITS = { minX: 10, maxX: 90, minY: 50, maxY: 88 };
const START_POSITION = { x: 37, y: 86 }; // Right up against the crashed ship's nose.

// Ore deposits per map (percent of the screen). Placeholder layout — tweak freely.
// Follows data/ores.js: ice @ Vastitas, iron/silica @ Alba Mons; Tempe Terra
// hosts sulfur/basalt until Olympus Mons gets its own map.
const ORE_NODES = {
  arcadia: [],
  albaMons: [
    { id: "a1", ore: "iron", x: 35, y: 70 },
    { id: "a2", ore: "iron", x: 62, y: 82 },
    { id: "a3", ore: "silica", x: 75, y: 64 },
  ],
  tempeTerra: [
    { id: "t1", ore: "sulfur", x: 30, y: 78 },
    { id: "t2", ore: "basalt", x: 66, y: 72 },
  ],
  vastitas: [
    { id: "v1", ore: "ice", x: 30, y: 74 },
    { id: "v2", ore: "ice", x: 52, y: 84 },
    { id: "v3", ore: "ice", x: 72, y: 68 },
  ],
};
const ORE_REACH = { x: 8, y: 10 };
const ORE_RESPAWN_MS = 10000;
const TOOL_KEYS = { 1: "Drill", 2: "Blaster", 3: "Repair Tool" };

const DEFAULT_WALLET = {
  tintinas: 0,
  inventory: { ice: 0, iron: 0, silica: 0, sulfur: 0, basalt: 0 },
  gear: { pickaxe: 1, hasFilter: false, blasters: [] },
  upgrades: {},
};
const drillDamage = (tier) =>
  shop.find((item) => item.type === "pickaxe" && item.tier === tier)?.oreDamage ?? 5;

// R.O.V.E.R. waits on the right side of the crash site (percent of the screen).
// Hugh can press E when he is within ROVER_REACH of it.
const ROVER_SPOT = { x: 80, y: 53 };
const ROVER_REACH = { x: 12, y: 10 };

// Held-key lookup, lowercase so Caps Lock / Shift don't break movement.
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

const ROVER_ASK_NAME = 0;
const ROVER_LAST_LINE = rover_dialogue.length - 1;

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

export default function Base({ onMainMenu, onSave, saveError, savedGame = {} }) {
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseNotice, setPauseNotice] = useState("");
  const [selectedTool, setSelectedTool] = useState(
    savedGame.selectedTool || "Drill"
  );
  const [travelTarget, setTravelTarget] = useState(null);
  const [roverOpen, setRoverOpen] = useState(false);
  const [roverLine, setRoverLine] = useState(ROVER_ASK_NAME);
  const [hughReply, setHughReply] = useState(false);
  const [fadeToBlack, setFadeToBlack] = useState(false);
  // Cutscene: null -> "jump" (Hugh hops on) -> "ride" (both drive off) -> trading post.
  const [rideStage, setRideStage] = useState(null);
  const [tradingOpen, setTradingOpen] = useState(false);
  const [wallet, setWallet] = useState(() => ({
    ...DEFAULT_WALLET,
    ...(savedGame.wallet || {}),
  }));
  const [nodeHealth, setNodeHealth] = useState({});
  const [miningNotice, setMiningNotice] = useState(null);
  const [drilling, setDrilling] = useState(false);
  const [drillFrame, setDrillFrame] = useState(0);

  // Cycle the 3 drill frames while drilling.
  useEffect(() => {
    if (!drilling) return setDrillFrame(0);
    const id = window.setInterval(() => setDrillFrame((f) => (f + 1) % 3), 70);
    return () => window.clearInterval(id);
  }, [drilling]);

  // Hugh's position lives in a ref and is written straight to the element each frame
  const hughRef = useRef(null);
  const positionRef = useRef({ ...START_POSITION });
  const heldKeys = useRef(new Set());
  const nearRoverRef = useRef(false);
  const [nearRover, setNearRover] = useState(false);

  const movementBlocked =
    paused ||
    objectivesOpen ||
    roverOpen ||
    Boolean(travelTarget) ||
    Boolean(rideStage) ||
    tradingOpen;
  const blockedRef = useRef(movementBlocked);
  blockedRef.current = movementBlocked;

  const locationIndex = Math.max(
    0,
    locations.findIndex(
      (location) => location.id === (savedGame.location || "arcadia")
    )
  );
  const currentLocation = locations[locationIndex];
  const previousLocation =
    locations[(locationIndex - 1 + locations.length) % locations.length];
  const nextLocation = locations[(locationIndex + 1) % locations.length];
  const isCrashSite = currentLocation.id === "arcadia";
  const oreNodes = ORE_NODES[currentLocation.id] || [];
  positionRef.current.atCrashSite = isCrashSite; // R.O.V.E.R. only lives here.

  // Fresh deposits each time Hugh arrives on a map.
  useEffect(() => {
    setNodeHealth({});
  }, [currentLocation.id]);

  function updateWallet(next) {
    setWallet(next);
    onSave?.({ wallet: next });
  }

  function flashNotice(text) {
    setMiningNotice({ text, id: Date.now() });
  }

  function findNearbyNode() {
    const { x, y } = positionRef.current;
    return oreNodes.find(
      (node) =>
        Math.abs(node.x - x) <= ORE_REACH.x && Math.abs(node.y - y) <= ORE_REACH.y
    );
  }

  function drillNode(node) {
    if (!node) return;
    if (selectedTool !== "Drill") return flashNotice("EQUIP THE DRILL [1]");
    const type = oreTypes[node.ore];
    if (type.needsFilter && !wallet.gear.hasFilter)
      return flashNotice("NEED A SULFUR FILTER (DJ-TMONEY)");
    const current = nodeHealth[node.id] ?? type.health;
    if (current <= 0) return flashNotice("DEPOSIT DEPLETED");

    setDrilling(true);
    window.setTimeout(() => setDrilling(false), 280);
    const remaining = Math.max(0, current - drillDamage(wallet.gear.pickaxe));
    setNodeHealth((h) => ({ ...h, [node.id]: remaining }));

    if (remaining === 0) {
      updateWallet({
        ...wallet,
        inventory: {
          ...wallet.inventory,
          [node.ore]: (wallet.inventory[node.ore] || 0) + 1,
        },
      });
      flashNotice(`+1 ${node.ore.toUpperCase()}`);
      window.setTimeout(
        () => setNodeHealth((h) => ({ ...h, [node.id]: type.health })),
        ORE_RESPAWN_MS
      );
    }
  }

  // Latest handlers for the keyboard loop (which is bound once).
  const actionRef = useRef({});
  actionRef.current = { drillNode, findNearbyNode, setSelectedTool };
  const [nearNodeId, setNearNodeId] = useState(null);
  const nearNodeRef = useRef(null);

  useEffect(() => {
    if (onSave) {
      onSave({
        selectedTool,
        location: savedGame.location || "arcadia",
        currentObjective: savedGame.currentObjective,
        objectives: savedGame.objectives,
      });
    }
  }, [
    onSave,
    savedGame.currentObjective,
    savedGame.location,
    savedGame.objectives,
    selectedTool,
  ]);

  // Smooth movement loop
  useEffect(() => {
    const held = heldKeys.current;

    function onKeyDown(event) {
      if (
        event.key.toLowerCase() === "e" &&
        !event.repeat &&
        nearRoverRef.current &&
        !blockedRef.current
      ) {
        event.preventDefault();
        setRoverOpen(true);
        return;
      }

      if (!blockedRef.current && TOOL_KEYS[event.key]) {
        actionRef.current.setSelectedTool(TOOL_KEYS[event.key]);
        return;
      }

      if (
        event.key.toLowerCase() === "e" &&
        !event.repeat &&
        !blockedRef.current
      ) {
        const node = actionRef.current.findNearbyNode();
        if (node) {
          event.preventDefault();
          actionRef.current.drillNode(node);
          return;
        }
      }

      const direction = MOVE_KEYS[event.key.toLowerCase()];
      if (!direction || event.ctrlKey || event.metaKey || event.altKey) return;
      if (blockedRef.current) return;
      event.preventDefault();
      held.add(direction);
    }

    function onKeyUp(event) {
      const direction = MOVE_KEYS[event.key.toLowerCase()];
      if (direction) held.delete(direction);
    }

    const releaseAll = () => held.clear();

    let frame;
    let last = performance.now();

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (blockedRef.current) {
        held.clear();
      } else if (held.size > 0) {
        const dx = (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0);
        const dy = (held.has("down") ? 1 : 0) - (held.has("up") ? 1 : 0);
        const position = positionRef.current;
        position.x = Math.min(
          MOVE_LIMITS.maxX,
          Math.max(MOVE_LIMITS.minX, position.x + dx * MOVE_SPEED_X * dt)
        );
        position.y = Math.min(
          MOVE_LIMITS.maxY,
          Math.max(MOVE_LIMITS.minY, position.y + dy * MOVE_SPEED_Y * dt)
        );
        const element = hughRef.current;
        if (element) {
          element.style.left = `${position.x}%`;
          element.style.top = `${position.y}%`;
          if (dx !== 0) element.dataset.facing = dx > 0 ? "right" : "left";
          element.dataset.walking = "true";
        }
      } else if (hughRef.current?.dataset.walking) {
        delete hughRef.current.dataset.walking;
      }

      // Check proximity to R.O.V.E.R.
      const { x, y } = positionRef.current;
      const near =
        positionRef.current.atCrashSite !== false &&
        Math.abs(x - ROVER_SPOT.x) <= ROVER_REACH.x &&
        Math.abs(y - ROVER_SPOT.y) <= ROVER_REACH.y;
      if (near !== nearRoverRef.current) {
        nearRoverRef.current = near;
        setNearRover(near);
      }
      const nodeId = actionRef.current.findNearbyNode()?.id ?? null;
      if (nodeId !== nearNodeRef.current) {
        nearNodeRef.current = nodeId;
        setNearNodeId(nodeId);
      }

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
    };
  }, []);

  function closeRover() {
    setRoverOpen(false);
    setRoverLine(ROVER_ASK_NAME);
    setHughReply(false);
  }

  // Hugh's selected name appears as his own line before R.O.V.E.R. responds.
  const roverActions = hughReply
    ? [{ label: "CONTINUE", onClick: () => { setHughReply(false); setRoverLine(1); } }]
    : roverLine === ROVER_ASK_NAME
    ? user_dialogue.map((label, index) => ({
        label,
        onClick: index === 0 ? () => setHughReply(true) : closeRover,
      }))
    : roverLine < ROVER_LAST_LINE
    ? [{ label: "CONTINUE", onClick: () => setRoverLine((line) => line + 1) }]
    : [
        { label: "HOP ON R.O.V.E.R.", onClick: finishRoverDialogue },
        { label: "NOT YET", onClick: closeRover },
      ];

  function resetHughTo(position) {
    Object.assign(positionRef.current, position);
    const el = hughRef.current;
    if (el) {
      el.style.left = `${position.x}%`;
      el.style.top = `${position.y}%`;
    }
  }

  // Hugh jumps onto R.O.V.E.R., they drive off together, fade, and the
  // trading post at Vastitas Borealis opens.
  function finishRoverDialogue() {
    closeRover();
    setRideStage("jump");
    if (hughRef.current) {
      hughRef.current.dataset.facing =
        positionRef.current.x < ROVER_SPOT.x ? "right" : "left";
    }
    resetHughTo({ x: ROVER_SPOT.x - 1, y: ROVER_SPOT.y - 6 }); // land on his deck
    window.setTimeout(() => setRideStage("ride"), 800);
    window.setTimeout(() => setFadeToBlack(true), 2600);
    window.setTimeout(() => {
      onSave?.({ location: "vastitas" });
      resetHughTo({ x: 50, y: 80 });
      setRideStage(null);
      setTradingOpen(true);
      setFadeToBlack(false);
    }, 3600);
  }

  function confirmTravel() {
    if (!travelTarget) return;
    if (onSave) onSave({ location: travelTarget.id });
    resetHughTo(travelTarget.id === "arcadia" ? START_POSITION : { x: 50, y: 80 });
    setTravelTarget(null);
  }

  // Handle Pause and Objectives hotkeys
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" || event.key.toLowerCase() === "p") {
        event.preventDefault();

        if (objectivesOpen && !paused && event.key === "Escape") {
          setObjectivesOpen(false);
          return;
        }

        setObjectivesOpen(false);
        setPaused((isPaused) => !isPaused);
        setPauseNotice("");
        return;
      }

      if (paused) {
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        setObjectivesOpen((isOpen) => !isOpen);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [objectivesOpen, paused]);

  return (
    <main className="mission-screen">
      <div
        aria-hidden="true"
        className="mission-landscape mission-landscape--image"
        style={{ backgroundImage: `url("${currentLocation.asset}")` }}
      >
        {/* The crashed ship only exists at the crash site (Arcadia). */}
        {isCrashSite && (
          <div className="mission-crash-site">
            <img className="mission-ship" src={spaceship} alt="" />
            <img className="mission-ship-smoke" src={smoke} alt="" />
          </div>
        )}
      </div>

      {oreNodes.map((node) => {
        const max = oreTypes[node.ore].health;
        const hp = nodeHealth[node.id] ?? max;
        return (
          <button
            aria-label={`Drill ${node.ore}`}
            className={`ore-node${hp <= 0 ? " ore-node--empty" : ""}`}
            key={node.id}
            onClick={() => !movementBlocked && drillNode(node)}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            type="button"
          >
            <img alt="" draggable="false" src={ORE_ICONS[node.ore]} />
            <span className="ore-node__bar">
              <span style={{ width: `${(hp / max) * 100}%` }} />
            </span>
            {nearNodeId === node.id && hp > 0 && !movementBlocked && (
              <span className="rover-npc__prompt">[E] DRILL {node.ore.toUpperCase()}</span>
            )}
          </button>
        );
      })}

      <div
        aria-label="Hugh Mann"
        className={`hugh-mann${rideStage === "jump" ? " hugh-mann--jumping" : ""}${
          rideStage === "ride" ? " hugh-mann--hidden" : ""
        }${drilling ? " hugh-mann--drilling" : ""}`}
        ref={hughRef}
        role="img"
        style={{
          left: `${positionRef.current.x}%`,
          top: `${positionRef.current.y}%`,
          "--hugh-right": `url("${hughRight}")`,
          "--hugh-left": `url("${hughLeft}")`,
        }}
      >
        <span className="hugh-mann__sprite" />
        {selectedTool === "Drill" && (
          <img
            alt=""
            aria-hidden="true"
            className="hugh-drill"
            draggable="false"
            src={DRILL_FRAMES[Math.min(4, wallet.gear.pickaxe)]?.[drillFrame]}
          />
        )}
      </div>

      {miningNotice && (
        <p className="mining-notice" key={miningNotice.id}>{miningNotice.text}</p>
      )}

      {isCrashSite && rideStage !== "ride" && (
        <button
          aria-label="Talk to R.O.V.E.R."
          className="rover-npc"
          onClick={() => !movementBlocked && setRoverOpen(true)}
          style={{ left: `${ROVER_SPOT.x}%`, top: `${ROVER_SPOT.y}%` }}
          type="button"
        >
          <span className="rover-npc__art">
            <img alt="" draggable="false" src={roverSprite} />
          </span>
          {nearRover && !movementBlocked && (
            <span className="rover-npc__prompt">[E] TALK</span>
          )}
        </button>
      )}

      <header className="mission-location">
        <p className="game-eyebrow">PROJECT GEAUX HOME // MISSION 01</p>
        <h1>{currentLocation.name}</h1>
        <p>
          {currentLocation.id === "arcadia"
            ? "CRASH SITE // SECTOR 01"
            : "TRAVEL ROUTE // SECTOR 02"}
        </p>
      </header>

      <button
        aria-label={`Travel toward ${previousLocation.name}`}
        className="edge-travel edge-travel--left"
        onClick={() => setTravelTarget(previousLocation)}
        type="button"
      >
        <span aria-hidden="true">‹</span>
        <small>{previousLocation.name}</small>
      </button>
      <button
        aria-label={`Travel toward ${nextLocation.name}`}
        className="edge-travel edge-travel--right"
        onClick={() => setTravelTarget(nextLocation)}
        type="button"
      >
        <small>{nextLocation.name}</small>
        <span aria-hidden="true">›</span>
      </button>

      {saveError && (
        <p aria-live="assertive" className="mission-save-error" role="alert">
          SAVE ERROR: {saveError}
        </p>
      )}

      <HUD
        currentObjective={
          savedGame.objectiveUnlocked ? savedGame.currentObjective : ""
        }
        onSelectTool={setSelectedTool}
        selectedTool={selectedTool}
      />

      {currentLocation.id === "arcadia" && (
        <aside className={`rover-tab${roverOpen ? " rover-tab--open" : ""}`}>
          <button
            aria-expanded={roverOpen}
            className="rover-tab__button"
            onClick={() => (roverOpen ? closeRover() : setRoverOpen(true))}
            type="button"
          >
            <img src={roverSprite} alt="Talk to Rover" />
          </button>
          {roverOpen && (
            <RoverDialogue
              actions={roverActions}
              key={`${roverLine}-${hughReply ? "hugh" : "rover"}`}
              message={hughReply ? "Hugh Mann." : rover_dialogue[roverLine]}
              speaker={hughReply ? "HUGH MANN" : "R.O.V.E.R."}
            />
          )}
        </aside>
      )}

      {rideStage === "ride" && (
        <div
          aria-hidden="true"
          className="rover-ride"
          style={{ left: `${ROVER_SPOT.x}%`, top: `${ROVER_SPOT.y}%` }}
        >
          <span className="hugh-mann__sprite rover-ride__hugh" style={{ backgroundImage: `url("${hughRight}")` }} />
          <span className="rover-npc__art">
            <img alt="" draggable="false" src={roverSprite} />
          </span>
        </div>
      )}

      {tradingOpen && (
        <TradingPost
          onChange={updateWallet}
          onLeave={() => setTradingOpen(false)}
          wallet={wallet}
        />
      )}
      <div className={`black-fade${fadeToBlack ? " black-fade--active" : ""}`} />

      <div className="mission-actions">
        <button
          className="game-button"
          onClick={() => !paused && setObjectivesOpen(true)}
          type="button"
        >
          OBJECTIVES [TAB]
        </button>
        <button
          className="game-button"
          onClick={() => {
            setObjectivesOpen(false);
            setPaused(true);
          }}
          type="button"
        >
          PAUSE [ESC]
        </button>
      </div>

      <ObjectivesMenu
        isOpen={objectivesOpen && !paused}
        objectives={savedGame.objectives || missionObjectives}
        onClose={() => setObjectivesOpen(false)}
      />

      {paused && (
        <PauseMenu
          onControls={() =>
            setPauseNotice("TAB: OBJECTIVES  //  ESC OR P: RESUME")
          }
          onMainMenu={onMainMenu}
          onQuit={() =>
            setPauseNotice("CLOSE THIS BROWSER TAB TO QUIT THE GAME.")
          }
          onResume={() => {
            setPaused(false);
            setPauseNotice("");
          }}
          onSettings={() => setPauseNotice("NO CONFIGURABLE SETTINGS YET.")}
          notice={pauseNotice}
        />
      )}

      {travelTarget && (
        <div
          className="travel-prompt"
          role="dialog"
          aria-modal="true"
          aria-labelledby="travel-prompt-title"
        >
          <section className="game-panel travel-prompt__panel">
            <p className="game-eyebrow">EDGE OF SECTOR</p>
            <h2 id="travel-prompt-title">TRAVEL TO {travelTarget.name}?</h2>
            <p>The route ahead will move you away from the crash site.</p>
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