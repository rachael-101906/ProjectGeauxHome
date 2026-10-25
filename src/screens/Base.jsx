import { useCallback, useEffect, useRef, useState } from "react";

import HUD from "../components/HUD.jsx";
import ObjectivesMenu from "../components/ObjectivesMenu.jsx";
import PauseMenu from "../components/PauseMenu.jsx";
import RoverDialogue from "../components/RoverDialogue.jsx";
import OlympusCombat from "../components/OlympusCombat.jsx";
import WindStorm from "../components/WindStorm.jsx";
import TradingPost, { ORE_ICONS, TRADERS } from "./TradingPost.jsx";

import hughRight from "../components/assets/characters/Hugh.png";
import hughLeft from "../components/assets/characters/HughL.png";
import hughSway1 from "../components/assets/characters/HughLSway1.png";
import hughSway2 from "../components/assets/characters/HughLSway2.png";
import roverSprite from "../components/assets/characters/rover.png";
import smoke from "../components/assets/icons/pixel-art-32x32-2f.gif";
import spaceship from "../components/assets/icons/spaceship.png";
import arcadia from "../components/assets/backgrounds/arcadia.png";
import albaMons from "../components/assets/backgrounds/alba-mons.png";
import tempeTerra from "../components/assets/backgrounds/tempe-terra.png";
import vastitasBorealis from "../components/assets/backgrounds/vastitas-borealis.png";
import olympusMons from "../components/assets/backgrounds/olympus-basalt.png";
import olympusBoss from "../components/assets/backgrounds/olympus-boss.png";

import { startRandomEvents } from "../systems/events.js";
import oreTypes from "../data/ores.js";
import shop from "../data/shop.js";
import upgrades from "../data/upgrades.js";
import { BLASTER_ART, DRILL_FRAMES } from "../data/art.js";
import {
  rover_dialogue,
  rover_travel_line,
  TRADER_DIALOGUE,
  user_dialogue,
} from "../data/dialogue.js";
import InventoryPanel from "../components/InventoryPanel.jsx";
import VoicedScene from "../components/VoicedScene.jsx";
import SCENES from "../data/voiceScenes.js";


// ============================================
// GAME CONFIGURATION
// ============================================

// Movement tuning: percent of the screen crossed per second.
const MOVE_SPEED_X = 30;
const MOVE_SPEED_Y = 34;
// minX/maxX keep Hugh clear of the left and right travel buttons.
const MOVE_LIMITS = { minX: 10, maxX: 90, minY: 50, maxY: 88 };
const START_POSITION = { x: 37, y: 86 }; // Right up against the crashed ship's nose.
const ARRIVAL_POSITION = { x: 50, y: 80 }; // Where Hugh lands on every other map.

const WALK_FRAME_SECONDS = 0.16;

// The walk frames (HughLSway1/2) are drawn facing LEFT, like HughL.png.
// When Hugh walks right we mirror them with scaleX(-1).
const HUGH_SPRITES = {
  idleRight: hughRight,
  idleLeft: hughLeft,
  walk: [hughSway1, hughSway2],
};

// R.O.V.E.R. waits on the right side of the crash site (percent of the screen).
const ROVER_SPOT = { x: 80, y: 53 };
const ROVER_REACH = { x: 12, y: 10 };

// Ore deposits per map (percent of the screen).
// Follows data/ores.js: ice @ Vastitas, iron/silica @ Alba Mons + Tempe Terra,
// sulfur/basalt @ Olympus Mons (mobs + Sulfur Filter required).
const ORE_NODES = {
  arcadia: [
    { id: "ar1", ore: "ice", x: 46, y: 74 },
    { id: "ar3", ore: "ice", x: 57, y: 86 },
    { id: "ar2", ore: "iron", x: 68, y: 78 },
  ],
  albaMons: [
    { id: "a1", ore: "iron", x: 35, y: 70 },
    { id: "a2", ore: "iron", x: 62, y: 82 },
    { id: "a3", ore: "silica", x: 75, y: 64 },
    { id: "a4", ore: "silica", x: 50, y: 70 },
  ],
  tempeTerra: [
    { id: "t1", ore: "iron", x: 30, y: 78 },
    { id: "t2", ore: "silica", x: 66, y: 72 },
  ],
  olympus: [
    { id: "o1", ore: "sulfur", x: 24, y: 80 },
    { id: "o2", ore: "sulfur", x: 48, y: 70 },
    { id: "o3", ore: "basalt", x: 72, y: 82 },
  ],
  // Kept below/beside the trader stalls so [E] doesn't clash with trading.
  vastitas: [
    { id: "v1", ore: "ice", x: 14, y: 82 },
    { id: "v2", ore: "ice", x: 52, y: 88 },
    { id: "v3", ore: "ice", x: 84, y: 82 },
  ],
  caldera: [], // boss arena: no ore, just Alpha Zeno
};
const ORE_REACH = { x: 8, y: 10 };
const ORE_RESPAWN_MS = 10000;

// Trader stalls at the Vastitas Borealis market (percent of the screen).
const TRADER_SPOTS = {
  martian: { x: 26, y: 70 },
  human: { x: 44, y: 68 },
  robot: { x: 62, y: 70 },
};
const TRADER_REACH = { x: 7, y: 9 };
const MARKET_LOCATION = "vastitas";

const TOOL_KEYS = { 1: "Drill", 2: "Blaster" };
const HELD_TOOLS = ["Drill", "Blaster"];
// Old saves can hold "Repair Tool" (the old slot 3), which left Hugh empty-handed.
const normalizeTool = (tool) => (HELD_TOOLS.includes(tool) ? tool : "Drill");
// Always a valid tier 1-4, even if a save is missing/garbled.
const drillTier = (gear) => clamp(Math.round(Number(gear?.drill)) || 1, 1, 4);

const DEFAULT_WALLET = {
  tintinas: 0,
  inventory: { ice: 0, iron: 0, silica: 0, sulfur: 0, basalt: 0 },
  gear: { drill: 1, hasFilter: false, blasters: [] },
  upgrades: {},
};

const LOCATION_TITLE_DURATION = 5000; // how long the location title card stays up (ms)
const TITLE_SKIP_AFTER = 800; // after this, any key or click skips the rest of the card
const INTRO_DURATION = 1200;
const FADE_DURATION = 1000;

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

const locations = [
  { id: "arcadia", name: "ARCADIA PLANITIA", asset: arcadia },
  { id: "albaMons", name: "ALBA MONS", asset: albaMons },
  { id: "tempeTerra", name: "TEMPE TERRA", asset: tempeTerra },
  { id: "vastitas", name: "VASTITAS BOREALIS", asset: vastitasBorealis },
  // Mobs live here, and the sulfur air means Hugh needs Captain McMars's Filter to enter.
  { id: "olympus", name: "OLYMPUS MONS", asset: olympusMons, needsFilter: true },
  // Final boss arena: Alpha Zeno. Needs the Filter AND a blaster.
  { id: "caldera", name: "OLYMPUS CALDERA", asset: olympusBoss, needsFilter: true, needsBlaster: true },
];

const LOCATION_SUBTITLES = {
  arcadia: "CRASH SITE // SECTOR 01",
  vastitas: "FRONTIER MARKET // SECTOR 04",
  olympus: "DANGER // ZENOS DETECTED",
  caldera: "FINAL BOSS // ALPHA ZENO",
};

// Health regenerates once Hugh has been out of combat for a few seconds.
const REGEN_DELAY_MS = 5000;
const REGEN_PER_SECOND = 3;

// Why a destination is closed to Hugh right now (null = open).
function travelLock(destination, wallet) {
  if (destination?.needsFilter && !wallet.gear.hasFilter) return "filter";
  if (destination?.needsBlaster && !wallet.gear.blasters?.length) return "blaster";
  return null;
}

// ============================================
// HELPERS
// ============================================

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function isTyping(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

function getLocation(id) {
  return locations.find((location) => location.id === id) ?? locations[0];
}

const isNear = (pos, spot, reach) =>
  Math.abs(pos.x - spot.x) <= reach.x && Math.abs(pos.y - spot.y) <= reach.y;

const bestBlaster = (owned = []) =>
  shop
    .filter((item) => item.type === "blaster" && owned.includes(item.id))
    .sort((a, b) => b.damage - a.damage)[0] ?? null;

const blasterDamage = (owned = []) => bestBlaster(owned)?.damage ?? 1;

const drillDamage = (tier) =>
  shop.find((item) => item.type === "drill" && item.tier === tier)?.oreDamage ?? 5;

// Older saves stored the drill tier as gear.pickaxe.
function loadWallet(saved = {}) {
  const gear = { ...DEFAULT_WALLET.gear, ...(saved.gear || {}) };
  if (gear.pickaxe && !saved.gear?.drill) gear.drill = gear.pickaxe;
  delete gear.pickaxe;
  return {
    ...DEFAULT_WALLET,
    ...saved,
    inventory: { ...DEFAULT_WALLET.inventory, ...(saved.inventory || {}) },
    gear,
    upgrades: { ...(saved.upgrades || {}) },
  };
}

// ============================================
// BASE GAME
// ============================================

export default function Base({ onMainMenu, onSave, saveError, savedGame = {} }) {
  // ------------------------------------------
  // GAME STATE
  // ------------------------------------------

  const [locationId, setLocationId] = useState(() => getLocation(savedGame.location).id);
  const [selectedTool, setSelectedTool] = useState(() => normalizeTool(savedGame.selectedTool));
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseNotice, setPauseNotice] = useState("");
  const [travelTarget, setTravelTarget] = useState(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  // R.O.V.E.R. dialogue
  const [roverOpen, setRoverOpen] = useState(false);
  const [roverLine, setRoverLine] = useState(ROVER_ASK_NAME);
  const [hughReply, setHughReply] = useState(false);
  const [roverIntroComplete, setRoverIntroComplete] = useState(
    savedGame.roverIntroComplete === true,
  );

  // Traders: talk = dialogue state, tradingWith = open shop tab.
  const [traderTalk, setTraderTalk] = useState(null); // { id, mode, index, topic }
  const [tradingWith, setTradingWith] = useState(null);
  const [metTraders, setMetTraders] = useState(() =>
    Array.isArray(savedGame.metTraders) ? savedGame.metTraders : [],
  );

  // Economy / mining / combat
  const [wallet, setWallet] = useState(() => loadWallet(savedGame.wallet));
  const [nodeHealth, setNodeHealth] = useState({});
  const [miningNotice, setMiningNotice] = useState(null);
  const [drilling, setDrilling] = useState(false);
  const [drillFrame, setDrillFrame] = useState(0);
  const [health, setHealth] = useState(100);
  const [hurtFlash, setHurtFlash] = useState(0);
  const [storm, setStorm] = useState(null);
  const [bossDefeated, setBossDefeated] = useState(Boolean(savedGame.bossDefeated));
  const [showVictory, setShowVictory] = useState(false);

  // Recorded voice scenes (data/voiceScenes.js). `scene` = what's playing now.
  const [scene, setScene] = useState(null); // { id, interactive, endActions, onDone }
  const [playedScenes, setPlayedScenes] = useState(() =>
    Array.isArray(savedGame.playedScenes) ? savedGame.playedScenes : [],
  );
  const [roverEnding, setRoverEnding] = useState(false); // R.O.V.E.R. is offering the ending choice
  const [ending, setEnding] = useState(savedGame.ending ?? null); // "A" (took R.O.V.E.R.) | "B" (left him)
  const [showEnding, setShowEnding] = useState(false);
  const playedScenesRef = useRef(playedScenes);
  const soldThisVisitRef = useRef(new Set());

  // Proximity prompts
  const [nearRover, setNearRover] = useState(false);
  const [nearNodeId, setNearNodeId] = useState(null);
  const [nearTraderId, setNearTraderId] = useState(null);

  // Cutscenes and transitions
  const [fadeIn, setFadeIn] = useState(true);
  const [fadeToBlack, setFadeToBlack] = useState(false);
  const [showLocationTitle, setShowLocationTitle] = useState(true);
  const [charactersVisible, setCharactersVisible] = useState(false);
  const [showIntroDialogue, setShowIntroDialogue] = useState(!savedGame.roverIntroComplete);
  const [showMoveTutorial, setShowMoveTutorial] = useState(!savedGame.roverIntroComplete);
  // Ride: null -> "jump" (Hugh hops on) -> "ride" (both drive off) -> fade -> new map.
  const [rideStage, setRideStage] = useState(null);

  // ------------------------------------------
  // REFS
  // ------------------------------------------

  const hughRef = useRef(null);
  const hughSpriteRef = useRef(null);
  const walkRef = useRef({ facing: "right", frame: 0, timer: 0, src: "", flip: false });
  const positionRef = useRef({
    x: clamp(savedGame.playerX ?? START_POSITION.x, MOVE_LIMITS.minX, MOVE_LIMITS.maxX),
    y: clamp(savedGame.playerY ?? START_POSITION.y, MOVE_LIMITS.minY, MOVE_LIMITS.maxY),
  });
  const heldKeys = useRef(new Set());
  const nearRoverRef = useRef(false);
  const nearNodeRef = useRef(null);
  const nearTraderRef = useRef(null);
  const timersRef = useRef([]);
  const healthRef = useRef(100);
  const lastHurtRef = useRef(0);
  const speedMultRef = useRef(1);
  const stormTriggerRef = useRef(null);

  // ------------------------------------------
  // DERIVED STATE
  // ------------------------------------------

  const currentLocation = getLocation(locationId);
  const locationIndex = locations.findIndex((location) => location.id === locationId);
  const previousLocation = locations[(locationIndex - 1 + locations.length) % locations.length];
  const nextLocation = locations[(locationIndex + 1) % locations.length];
  const isCrashSite = locationId === "arcadia";
  const isMarket = locationId === MARKET_LOCATION;
  const oreNodes = ORE_NODES[locationId] || [];
  const travelLock_ = travelLock(travelTarget, wallet);
  const travelLocked = Boolean(travelLock_);
  const nextUpgrade = upgrades.find((up) => !wallet.upgrades[up.id]);
  const currentObjective = !roverIntroComplete
    ? "Find out where you are. Talk to R.O.V.E.R."
    : nextUpgrade
      ? nextUpgrade.id === "propulsion" && wallet.propulsionPaid
        ? bossDefeated
          ? "You beat Alpha Zeno! Go back to DJ-C Money at Vastitas Borealis for your engine."
          : "DJ-C Money has your materials. Defeat Alpha Zeno in the Olympus Caldera."
        : `Repair the ship: get the ${nextUpgrade.name} from DJ-C Money (Vastitas Borealis).`
      : ending
        ? "Mission complete. Thanks for playing!"
        : "Your ship is ready! Head back to R.O.V.E.R. at the crash site.";
  const objectiveList = upgrades.map((up) => ({
    name: up.name,
    progress: wallet.upgrades[up.id] ? 100 : 0,
  }));

  const movementBlocked =
    paused ||
    objectivesOpen ||
    roverOpen ||
    Boolean(travelTarget) ||
    Boolean(rideStage) ||
    Boolean(traderTalk) ||
    Boolean(tradingWith) ||
    inventoryOpen ||
    Boolean(scene?.interactive) ||
    showEnding ||
    showLocationTitle ||
    !charactersVisible ||
    fadeIn ||
    fadeToBlack;
  const roverIntroRef = useRef(roverIntroComplete);
  roverIntroRef.current = roverIntroComplete;
  const inventoryOpenRef = useRef(inventoryOpen);
  inventoryOpenRef.current = inventoryOpen;
  const blockedRef = useRef(movementBlocked);
  blockedRef.current = movementBlocked;

  // Read by the animation loop, which is bound once.
  const locationRef = useRef(locationId);
  locationRef.current = locationId;

  // ------------------------------------------
  // TIMERS / SAVE HELPERS
  // ------------------------------------------

  const later = useCallback((fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => () => timersRef.current.forEach((id) => window.clearTimeout(id)), []);

  // Latest values for saves fired from timers / the animation loop.
  const saveStateRef = useRef({});
  saveStateRef.current = {
    selectedTool,
    location: locationId,
    wallet,
    roverIntroComplete,
    metTraders,
    bossDefeated,
    playedScenes,
    ending,
  };

  const saveProgress = useCallback(
    (updates = {}) => {
      onSave?.({
        ...saveStateRef.current,
        playerX: positionRef.current.x,
        playerY: positionRef.current.y,
        ...updates,
      });
    },
    [onSave],
  );

  function updateWallet(next) {
    // Update the refs right away so any save/scene fired in the same tick sees the new wallet
    // (otherwise a second save could overwrite this one with the old wallet).
    saveStateRef.current = { ...saveStateRef.current, wallet: next };
    walletRef.current = next;
    setWallet(next);
    saveProgress({ wallet: next });
  }

  function flashNotice(text) {
    setMiningNotice({ text, id: Date.now() });
  }

  // ------------------------------------------
  // OPENING FADE + LOCATION TITLE CARD
  // ------------------------------------------

  useEffect(() => {
    const timer = window.setTimeout(() => setFadeIn(false), INTRO_DURATION);
    return () => window.clearTimeout(timer);
  }, []);

  // Each location gets a brief title card before Hugh and the NPCs appear.
  useEffect(() => {
    setShowLocationTitle(true);
    setCharactersVisible(false);
    setNodeHealth({}); // Fresh deposits each time Hugh arrives on a map.
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setShowLocationTitle(false);
      setCharactersVisible(true);
    };
    const timer = window.setTimeout(finish, LOCATION_TITLE_DURATION);
    // Let impatient players skip the card (but not by accident the instant it appears).
    const shownAt = performance.now();
    const skip = (event) => {
      if (event.repeat || performance.now() - shownAt < TITLE_SKIP_AFTER) return;
      finish();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [locationId]);

  // ------------------------------------------
  // DRILL ANIMATION
  // ------------------------------------------

  useEffect(() => {
    if (!drilling) {
      setDrillFrame(0);
      return undefined;
    }
    const id = window.setInterval(() => setDrillFrame((f) => (f + 1) % 3), 70);
    return () => window.clearInterval(id);
  }, [drilling]);

  // ------------------------------------------
  // POSITION + SPRITE RENDERING
  // ------------------------------------------

  function resetHughTo(position) {
    Object.assign(positionRef.current, position);
    const el = hughRef.current;
    if (el) {
      el.style.left = `${position.x}%`;
      el.style.top = `${position.y}%`;
    }
  }

  function setFacing(facing) {
    walkRef.current.facing = facing;
    if (hughRef.current) hughRef.current.dataset.facing = facing;
  }

  // Idle: Hugh.png (right) / HughL.png (left).
  // Walking: alternate the two sway frames; they face left, so mirror them when walking right.
  // Only touches the DOM when the frame actually changes.
  function renderHughSprite(moving, dx, dt) {
    const walk = walkRef.current;
    const sprite = hughSpriteRef.current;
    if (dx > 0) setFacing("right");
    else if (dx < 0) setFacing("left");

    let src;
    let flip = false;
    if (!moving) {
      walk.timer = 0;
      walk.frame = 0;
      src = walk.facing === "right" ? HUGH_SPRITES.idleRight : HUGH_SPRITES.idleLeft;
    } else {
      walk.timer += dt;
      if (walk.timer >= WALK_FRAME_SECONDS) {
        walk.timer %= WALK_FRAME_SECONDS;
        walk.frame = (walk.frame + 1) % HUGH_SPRITES.walk.length;
      }
      src = HUGH_SPRITES.walk[walk.frame];
      flip = walk.facing === "right";
    }

    if (sprite && (src !== walk.src || flip !== walk.flip)) {
      walk.src = src;
      walk.flip = flip;
      sprite.src = src;
      sprite.style.transform = flip ? "scaleX(-1)" : "";
    }
  }

  // ------------------------------------------
  // MINING
  // ------------------------------------------

  function findNearbyNode() {
    return oreNodes.find((node) => isNear(positionRef.current, node, ORE_REACH));
  }

  function findNearbyTrader() {
    if (locationRef.current !== MARKET_LOCATION) return null;
    return (
      Object.keys(TRADER_SPOTS).find((id) =>
        isNear(positionRef.current, TRADER_SPOTS[id], TRADER_REACH),
      ) ?? null
    );
  }

  function drillNode(node) {
    if (!node) return;
    if (selectedTool !== "Drill") return flashNotice("EQUIP THE DRILL [1]");
    const type = oreTypes[node.ore];
    if (type.needsFilter && !wallet.gear.hasFilter)
      return flashNotice("NEED A SULFUR FILTER (CAPTAIN McMARS)");
    const current = nodeHealth[node.id] ?? type.health;
    if (current <= 0) return flashNotice("DEPOSIT DEPLETED");

    setDrilling(true);
    later(() => setDrilling(false), 280);
    const remaining = Math.max(0, current - drillDamage(drillTier(wallet.gear)));
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
      later(() => setNodeHealth((h) => ({ ...h, [node.id]: type.health })), ORE_RESPAWN_MS);
    } else {
      flashNotice(`${node.ore.toUpperCase()}: ${remaining} HP LEFT`);
    }
  }

  // ------------------------------------------
  // COMBAT
  // ------------------------------------------

  function hurtHugh(damage) {
    lastHurtRef.current = Date.now();
    setHurtFlash((n) => n + 1);
    healthRef.current = Math.max(0, healthRef.current - damage);
    if (healthRef.current === 0) {
      // Blacked out: R.O.V.E.R. drags Hugh back to the crash site.
      healthRef.current = 100;
      flashNotice("YOU BLACKED OUT... R.O.V.E.R. HAULED YOU HOME");
      changeLocation(getLocation("arcadia"));
    }
    setHealth(healthRef.current);
  }

  // Regenerating health: +REGEN_PER_SECOND each second while out of combat.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (blockedRef.current || healthRef.current >= 100) return;
      if (Date.now() - lastHurtRef.current < REGEN_DELAY_MS) return;
      healthRef.current = Math.min(100, healthRef.current + REGEN_PER_SECOND);
      setHealth(healthRef.current);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Random world events (dust storms), driven by an async loop in systems/events.js.
  useEffect(() => {
    const events = startRandomEvents({
      canTrigger: () => !blockedRef.current && roverIntroRef.current,
      onStart: (event) => {
        speedMultRef.current = event.speedMultiplier;
        setStorm(event);
        flashNotice(event.warning);
      },
      onEnd: (event) => {
        speedMultRef.current = 1;
        setStorm(null);
        flashNotice(event.clear);
      },
    });
    stormTriggerRef.current = events.trigger;
    if (import.meta.env.DEV) window.__triggerEvent = events.trigger;
    return () => {
      events.stop();
      speedMultRef.current = 1;
    };
  }, []);

  function defeatBoss() {
    setBossDefeated(true);
    setShowVictory(true);
    saveProgress({ bossDefeated: true });
    later(() => setShowVictory(false), 5000);
  }

  const walletRef = useRef(wallet);
  walletRef.current = wallet;
  function rewardKill(reward, name) {
    const w = walletRef.current;
    updateWallet({ ...w, tintinas: w.tintinas + reward });
    flashNotice(`${name.toUpperCase()} DOWN! +${reward} T`);
  }

  // ------------------------------------------
  // LOCATION CHANGES
  // ------------------------------------------

  function changeLocation(destination) {
    const spawn = destination.id === "arcadia" ? START_POSITION : ARRIVAL_POSITION;
    heldKeys.current.clear();
    resetHughTo(spawn);
    setLocationId(destination.id);
    setNearRover(false);
    nearRoverRef.current = false;
    setShowIntroDialogue(false);
    setShowMoveTutorial(false);
    saveProgress({ location: destination.id, playerX: spawn.x, playerY: spawn.y });
  }

  // Hugh hops on R.O.V.E.R., they drive off, fade, and arrive at `destination`.
  function rideRover(destination) {
    closeRover();
    heldKeys.current.clear();
    setShowIntroDialogue(false);
    setShowMoveTutorial(false);
    setRoverIntroComplete(true);
    setFacing(positionRef.current.x < ROVER_SPOT.x ? "right" : "left");
    setRideStage("jump");
    // Wait a frame so the --jumping transition class is applied before Hugh moves.
    later(() => resetHughTo({ x: ROVER_SPOT.x - 1, y: ROVER_SPOT.y - 6 }), 30); // land on his deck
    later(() => setRideStage("ride"), 800);
    later(() => setFadeToBlack(true), 2600);
    later(() => {
      setRideStage(null);
      changeLocation(destination);
      saveProgress({ location: destination.id, roverIntroComplete: true });
      setFadeToBlack(false);
    }, 2600 + FADE_DURATION);
  }

  function confirmTravel() {
    if (!travelTarget || travelLocked || fadeToBlack) return;
    const destination = travelTarget;
    heldKeys.current.clear();
    setTravelTarget(null);
    setFadeToBlack(true);
    later(() => {
      changeLocation(destination);
      setFadeToBlack(false);
    }, FADE_DURATION);
  }


  // ------------------------------------------
  // VOICED SCENES (recorded audio + synced captions)
  // ------------------------------------------

  // interactive = story scene (blocks movement, E = next line, Esc = skip).
  // Non-interactive = short trade bark that plays over the trading post.
  function playScene(id, { interactive = true, endActions, onDone } = {}) {
    if (!SCENES[id]) {
      onDone?.();
      return;
    }
    heldKeys.current.clear();
    setScene({ id, key: Date.now(), interactive, endActions, onDone });
    if (!playedScenesRef.current.includes(id)) {
      const next = [...playedScenesRef.current, id];
      playedScenesRef.current = next;
      setPlayedScenes(next);
      saveProgress({ playedScenes: next });
    }
  }

  function endScene(current) {
    setScene((active) => (active === current ? null : active));
    current.onDone?.();
  }

  const allInstalled = upgrades.every((up) => wallet.upgrades[up.id]);
  const engineReady = Boolean(wallet.propulsionPaid && bossDefeated && !wallet.upgrades.propulsion);

  function openRover() {
    setShowIntroDialogue(false);
    heldKeys.current.clear();
    if (!roverIntroComplete && !playedScenes.includes("roverMeet")) {
      // First meeting is the fully voiced scene; it ends on the HOP ON choice.
      playScene("roverMeet", {
        endActions: [
          { label: "HOP ON R.O.V.E.R.", onClick: () => { setScene(null); rideRover(getLocation(MARKET_LOCATION)); } },
          { label: "NOT YET", onClick: () => setScene(null) },
        ],
      });
      return;
    }
    if (!roverIntroComplete) {
      // Already heard the intro: jump straight to "let's go?".
      setRoverLine(ROVER_LAST_LINE);
      setRoverOpen(true);
      return;
    }
    if (allInstalled && !ending) {
      setRoverEnding(true);
      setRoverOpen(true);
      return;
    }
    setRoverOpen(true);
  }

  function finishGame(choice) {
    setEnding(choice);
    setShowEnding(true);
    saveProgress({ ending: choice });
  }

  function chooseEnding(choice) {
    closeRover();
    if (choice === "A") {
      playScene("endingTakeRover", { onDone: () => finishGame("A") });
    } else {
      playScene("endingLeaveRover", {
        onDone: () => playScene("endingRoverFinal", { onDone: () => finishGame("B") }),
      });
    }
  }

  // DJ-C keeps his word: after Alpha Zeno, he hands over the Propulsion Engine.
  function collectEngine() {
    setTradingWith(null);
    setTraderTalk(null);
    playScene("djReunion", {
      onDone: () => {
        const w = walletRef.current;
        updateWallet({ ...w, upgrades: { ...w.upgrades, propulsion: 1 } });
        flashNotice("PROPULSION ENGINE INSTALLED! RETURN TO R.O.V.E.R.");
      },
    });
  }

  // Called by the trading post after a buy / sell / install.
  function onTradeEvent(event) {
    if (event.type === "buy") {
      playScene(`buy_${event.id}`, { interactive: false });
    } else if (event.type === "sell") {
      // Doc only says his line once per ore per visit, so SELL 1 spam stays quiet.
      if (soldThisVisitRef.current.has(event.ore)) return;
      soldThisVisitRef.current.add(event.ore);
      playScene(`sell_${event.ore}`, { interactive: false });
    } else if (event.type === "install") {
      playScene(`install_${event.id}`, { interactive: false });
    } else if (event.type === "propulsionPaid") {
      if (bossDefeated) collectEngine();
      else playScene("finalTrade");
    } else if (event.type === "collectEngine") {
      collectEngine();
    }
  }

  // Each trading-post visit starts fresh for Doc's lines.
  useEffect(() => {
    if (tradingWith) soldThisVisitRef.current = new Set();
  }, [tradingWith]);

  // First arrival at the market: R.O.V.E.R. introduces the three merchants.
  useEffect(() => {
    if (
      locationId === MARKET_LOCATION &&
      charactersVisible &&
      roverIntroComplete &&
      !playedScenes.includes("merchants")
    ) {
      playScene("merchants", { onDone: () => flashNotice("WALK UP TO A TRADER AND PRESS [E]") });
    }
  }, [locationId, charactersVisible]);

  // Hugh's reaction every time he enters the boss arena (until Alpha Zeno is beaten).
  useEffect(() => {
    if (locationId === "caldera" && charactersVisible && !bossDefeated) {
      playScene("bigAlpha", { interactive: false });
    }
  }, [locationId, charactersVisible]);

  // Leaving a map stops whatever bark was playing there.
  useEffect(() => {
    setScene((active) => (active && !active.interactive ? null : active));
  }, [locationId]);

  // ------------------------------------------
  // TRADER DIALOGUE
  // ------------------------------------------

  function openTrader(id) {
    heldKeys.current.clear();
    if (id === "robot" && engineReady) {
      collectEngine();
      return;
    }
    if (id === "human" && !metTraders.includes(id)) {
      const nextMet = [...metTraders, id];
      setMetTraders(nextMet);
      saveProgress({ metTraders: nextMet });
      playScene("firstWeapon", { onDone: () => setTraderTalk({ id, mode: "menu" }) });
      return;
    }
    if (metTraders.includes(id)) {
      setTraderTalk({ id, mode: "menu", firstMenu: true });
    } else {
      setTraderTalk({ id, mode: "intro", index: 0 });
      const nextMet = [...metTraders, id];
      setMetTraders(nextMet);
      saveProgress({ metTraders: nextMet });
    }
  }

  function closeTrader() {
    setTraderTalk(null);
  }

  function traderView(talk) {
    const data = TRADER_DIALOGUE[talk.id];
    const menuActions = [
      {
        label: "LET'S TRADE",
        onClick: () => {
          setTraderTalk(null);
          setTradingWith(talk.id);
        },
      },
      ...data.topics.map((topic, index) => ({
        label: topic.label,
        onClick: () => setTraderTalk({ id: talk.id, mode: "reply", topic: index }),
      })),
      { label: "GOODBYE", onClick: () => setTraderTalk({ id: talk.id, mode: "bye" }) },
    ];

    if (talk.mode === "intro") {
      // The last intro line goes straight into the menu.
      const last = talk.index >= data.intro.length - 1;
      return {
        message: data.intro[talk.index],
        actions: last
          ? menuActions
          : [{ label: "CONTINUE", onClick: () => setTraderTalk({ ...talk, index: talk.index + 1 }) }],
      };
    }
    if (talk.mode === "reply") {
      return {
        message: data.topics[talk.topic].reply,
        actions: [{ label: "BACK", onClick: () => setTraderTalk({ id: talk.id, mode: "menu" }) }],
      };
    }
    if (talk.mode === "bye") {
      return { message: data.farewell, actions: [{ label: "LEAVE", onClick: closeTrader }] };
    }
    // Menu: "welcome back" on a repeat visit, otherwise the follow-up prompt.
    return { message: talk.firstMenu ? data.repeat : data.prompt, actions: menuActions };
  }

  // ------------------------------------------
  // KEYBOARD + ANIMATION LOOP
  // ------------------------------------------

  // Latest handlers for the loop (which is bound once).
  const actionRef = useRef({});
  actionRef.current = { drillNode, findNearbyNode, findNearbyTrader, openTrader, openRover, setSelectedTool: selectTool };

  useEffect(() => {
    const held = heldKeys.current;

    function onKeyDown(event) {
      if (isTyping(event.target)) return;
      const key = event.key.toLowerCase();

      if (key === "e" && !event.repeat && !blockedRef.current) {
        if (nearRoverRef.current) {
          event.preventDefault();
          held.clear();
          actionRef.current.openRover();
          return;
        }
        if (nearTraderRef.current) {
          event.preventDefault();
          actionRef.current.openTrader(nearTraderRef.current);
          return;
        }
        const node = actionRef.current.findNearbyNode();
        if (node) {
          event.preventDefault();
          actionRef.current.drillNode(node);
          return;
        }
      }

      if (event.key === "3" && !event.repeat) {
        // 3 toggles the inventory (also closes it while it's the only thing open).
        if (inventoryOpenRef.current) {
          setInventoryOpen(false);
          return;
        }
        if (!blockedRef.current) {
          held.clear();
          setInventoryOpen(true);
          return;
        }
      }

      if (!blockedRef.current && TOOL_KEYS[event.key]) {
        actionRef.current.setSelectedTool(TOOL_KEYS[event.key]);
        return;
      }

      const direction = MOVE_KEYS[key];
      if (!direction || event.ctrlKey || event.metaKey || event.altKey) return;
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

    const releaseAll = () => held.clear();

    let frame;
    let last = performance.now();

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      let dx = 0;
      let dy = 0;
      if (blockedRef.current) {
        held.clear();
      } else {
        dx = Number(held.has("right")) - Number(held.has("left"));
        dy = Number(held.has("down")) - Number(held.has("up"));
      }
      const moving = dx !== 0 || dy !== 0;

      if (moving) {
        const length = Math.hypot(dx, dy); // keep diagonals the same speed
        const position = positionRef.current;
        position.x = clamp(position.x + (dx / length) * MOVE_SPEED_X * speedMultRef.current * dt, MOVE_LIMITS.minX, MOVE_LIMITS.maxX);
        position.y = clamp(position.y + (dy / length) * MOVE_SPEED_Y * speedMultRef.current * dt, MOVE_LIMITS.minY, MOVE_LIMITS.maxY);
        const element = hughRef.current;
        if (element) {
          element.style.left = `${position.x}%`;
          element.style.top = `${position.y}%`;
        }
      }
      if (hughRef.current) {
        if (moving) hughRef.current.dataset.walking = "true";
        else delete hughRef.current.dataset.walking;
      }
      renderHughSprite(moving, dx, dt);

      // Proximity prompts
      const near =
        locationRef.current === "arcadia" && isNear(positionRef.current, ROVER_SPOT, ROVER_REACH);
      if (near !== nearRoverRef.current) {
        nearRoverRef.current = near;
        setNearRover(near);
      }
      const nodeId = actionRef.current.findNearbyNode()?.id ?? null;
      if (nodeId !== nearNodeRef.current) {
        nearNodeRef.current = nodeId;
        setNearNodeId(nodeId);
      }
      const traderId = actionRef.current.findNearbyTrader();
      if (traderId !== nearTraderRef.current) {
        nearTraderRef.current = traderId;
        setNearTraderId(traderId);
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
      held.clear();
    };
    // renderHughSprite only touches refs, so binding once is safe.
  }, []);

  // ------------------------------------------
  // PAUSE / OBJECTIVES / ESCAPE
  // ------------------------------------------

  useEffect(() => {
    function handleKeyDown(event) {
      if (isTyping(event.target)) return;
      const key = event.key.toLowerCase();

      if (key === "escape" || key === "p") {
        event.preventDefault();
        if (travelTarget) return setTravelTarget(null);
        if (roverOpen) return closeRover();
        if (traderTalk) return closeTrader();
        if (scene?.interactive) return; // VoicedScene handles Esc (skip)
        if (tradingWith) return setTradingWith(null);
        if (inventoryOpen) return setInventoryOpen(false);
        if (key === "escape" && objectivesOpen && !paused) return setObjectivesOpen(false);
        if (fadeToBlack || fadeIn || rideStage) return;
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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [objectivesOpen, paused, roverOpen, travelTarget, traderTalk, tradingWith, inventoryOpen, fadeToBlack, fadeIn, rideStage, scene]);

  // ------------------------------------------
  // R.O.V.E.R. DIALOGUE
  // ------------------------------------------

  function closeRover() {
    setRoverOpen(false);
    setRoverEnding(false);
    setRoverLine(ROVER_ASK_NAME);
    setHughReply(false);
  }

  const roverActions = roverEnding
    ? [
        { label: "TAKE R.O.V.E.R. WITH YOU", onClick: () => chooseEnding("A") },
        { label: "SAY GOODBYE", onClick: () => chooseEnding("B") },
      ]
    : roverIntroComplete
    ? [
        ...locations
          .filter((location) => location.id !== locationId)
          .map((destination) => ({
            label: `${destination.name}${travelLock(destination, wallet) ? ` (NEED ${travelLock(destination, wallet).toUpperCase()})` : ""}`,
            onClick: () =>
              travelLock(destination, wallet)
                ? (closeRover(), flashNotice(`BUY A ${travelLock(destination, wallet).toUpperCase()} FROM CAPTAIN McMARS FIRST`))
                : rideRover(destination),
          })),
        { label: "NOT NOW", onClick: closeRover },
      ]
    : hughReply
      ? [{ label: "CONTINUE", onClick: () => { setHughReply(false); setRoverLine(1); } }]
      : roverLine === ROVER_ASK_NAME
        ? user_dialogue.map((label, index) => ({
            label,
            onClick: index === 0 ? () => setHughReply(true) : closeRover,
          }))
        : roverLine < ROVER_LAST_LINE
          ? [{ label: "CONTINUE", onClick: () => setRoverLine((line) => line + 1) }]
          : [
              { label: "HOP ON R.O.V.E.R.", onClick: () => rideRover(getLocation(MARKET_LOCATION)) },
              { label: "NOT YET", onClick: closeRover },
            ];

  const roverMessage = roverEnding
    ? "Your ship is repaired, Hugh Mann. All systems online. I suppose... this is goodbye?"
    : roverIntroComplete
    ? rover_travel_line
    : hughReply
      ? user_dialogue[0]
      : rover_dialogue[roverLine];

  // ------------------------------------------
  // TOOL SELECTION
  // ------------------------------------------

  function selectTool(tool) {
    const next = normalizeTool(tool);
    setSelectedTool(next);
    saveProgress({ selectedTool: next });
  }

  // ============================================
  // RENDER
  // ============================================

  const blaster = bestBlaster(wallet.gear.blasters);
  // Before buying one, Hugh still holds (and fires) a basic T1-looking blaster at 1 damage.
  const blasterArt = BLASTER_ART[blaster?.id ?? "t1b"];
  const toolIcons = {
    Drill: DRILL_FRAMES[drillTier(wallet.gear)]?.[0],
    Blaster: blasterArt,
  };
  const talkingTrader = traderTalk && TRADERS.find((t) => t.id === traderTalk.id);
  const traderLine = traderTalk && traderView(traderTalk);

  return (
    <main className="mission-screen">
      <div
        aria-hidden="true"
        className="mission-landscape mission-landscape--image"
        style={{ backgroundImage: `url("${currentLocation.asset}")` }}
      >
        {/* The crashed ship only exists at the crash site (Arcadia). */}
        {isCrashSite && charactersVisible && (
          <div className="mission-crash-site">
            <img className="mission-ship" src={spaceship} alt="" draggable="false" />
            <img className="mission-ship-smoke" src={smoke} alt="" draggable="false" />
          </div>
        )}
      </div>

      {/* ORE DEPOSITS */}
      {charactersVisible &&
        oreNodes.map((node) => {
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

      {/* TRADERS (Vastitas Borealis market) */}
      {isMarket &&
        charactersVisible &&
        TRADERS.map((trader) => (
          <TraderNpc
            key={trader.id}
            trader={trader}
            spot={TRADER_SPOTS[trader.id]}
            near={nearTraderId === trader.id && !movementBlocked}
            onClick={() => !movementBlocked && openTrader(trader.id)}
          />
        ))}

      {/* PLAYER */}
      <div
        aria-label="Hugh Mann"
        className={`hugh-mann${rideStage === "jump" ? " hugh-mann--jumping" : ""}${
          rideStage === "ride" ? " hugh-mann--hidden" : ""
        }${drilling ? " hugh-mann--drilling" : ""}`}
        data-facing="right"
        ref={hughRef}
        role="img"
        style={{
          left: `${positionRef.current.x}%`,
          top: `${positionRef.current.y}%`,
          opacity: charactersVisible ? 1 : 0,
        }}
      >
        {isCrashSite && showIntroDialogue && !roverIntroComplete && charactersVisible && (
          <div className="speech-bubble speech-bubble--hugh" role="status">
            Whoa! Where am I?
          </div>
        )}
        <img
          alt=""
          className="hugh-mann__img"
          draggable="false"
          ref={hughSpriteRef}
          src={HUGH_SPRITES.idleRight}
        />
        {selectedTool === "Drill" && (
          <img
            alt=""
            aria-hidden="true"
            className="hugh-drill"
            draggable="false"
            src={DRILL_FRAMES[drillTier(wallet.gear)]?.[drillFrame]}
          />
        )}
        {selectedTool === "Blaster" && blasterArt && (
          <img
            alt=""
            aria-hidden="true"
            className="hugh-blaster"
            draggable="false"
            src={blasterArt}
          />
        )}
      </div>

      {(locationId === "olympus" || locationId === "caldera") && charactersVisible && (
        <OlympusCombat
          boss={locationId === "caldera"}
          bossCleared={bossDefeated}
          onBossDefeated={defeatBoss}
          armed={selectedTool === "Blaster"}
          blasterDamage={blasterDamage(wallet.gear.blasters)}
          hughPosition={positionRef}
          hughRef={hughRef}
          onHurt={hurtHugh}
          onKill={rewardKill}
          paused={movementBlocked}
        />
      )}
      {storm && <WindStorm />}
      {showVictory && (
        <div className="boss-victory" role="status">
          <div>ALPHA ZENO DEFEATED!<br />MARS IS YOURS, HUGH MANN.<br />NOW GEAUX HOME!</div>
        </div>
      )}
      {hurtFlash > 0 && <div className="hurt-flash" key={hurtFlash} aria-hidden="true" />}

      {miningNotice && (
        <p className="mining-notice" key={miningNotice.id}>{miningNotice.text}</p>
      )}

      {/* R.O.V.E.R. NPC */}
      {isCrashSite && charactersVisible && rideStage !== "ride" && (
        <button
          aria-label="Talk to R.O.V.E.R."
          className="rover-npc"
          onClick={() => !movementBlocked && openRover()}
          style={{ left: `${ROVER_SPOT.x}%`, top: `${ROVER_SPOT.y}%` }}
          type="button"
        >
          {showIntroDialogue && !roverIntroComplete && !nearRover && (
            <span className="speech-bubble speech-bubble--npc">
              <span className="speech-bubble__alert" aria-hidden="true">!</span>
              Hey, over here!
            </span>
          )}
          <span className="rover-npc__art">
            <img alt="" draggable="false" src={roverSprite} />
          </span>
          {nearRover && !movementBlocked && <span className="rover-npc__prompt">[E] TALK</span>}
        </button>
      )}

      {/* MOVEMENT TUTORIAL */}
      {showMoveTutorial && charactersVisible && !roverOpen && (
        <div className="speech-bubble speech-bubble--toast" role="status">
          USE ARROW KEYS OR [W][A][S][D] TO MOVE
          <button
            className="speech-bubble__dismiss"
            onClick={() => setShowMoveTutorial(false)}
            type="button"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* LOCATION TITLE CARD */}
      {showLocationTitle && (
        <header className="mission-location location-title-splash">
          <p className="game-eyebrow">PROJECT GEAUX HOME // MISSION 01</p>
          <h1>{currentLocation.name}</h1>
          <p>{LOCATION_SUBTITLES[locationId] ?? "TRAVEL ROUTE // SECTOR 02"}</p>
          <small className="location-title-splash__skip">PRESS ANY KEY</small>
        </header>
      )}

      {/* EDGE TRAVEL (unlocked after meeting R.O.V.E.R.) */}
      {roverIntroComplete && charactersVisible && (
        <>
          <button
            aria-label={`Travel toward ${previousLocation.name}`}
            className="edge-travel edge-travel--left"
            disabled={movementBlocked}
            onClick={() => setTravelTarget(previousLocation)}
            type="button"
          >
            <span aria-hidden="true">‹</span>
            <small>{previousLocation.name}</small>
          </button>
          <button
            aria-label={`Travel toward ${nextLocation.name}`}
            className="edge-travel edge-travel--right"
            disabled={movementBlocked}
            onClick={() => setTravelTarget(nextLocation)}
            type="button"
          >
            <small>{nextLocation.name}</small>
            <span aria-hidden="true">›</span>
          </button>
        </>
      )}

      {saveError && (
        <p aria-live="assertive" className="mission-save-error" role="alert">
          SAVE ERROR: {saveError}
        </p>
      )}

      {charactersVisible && (
        <>
          <HUD
            health={health}
            currentObjective={currentObjective}
            selectedTool={selectedTool}
            onSelectTool={selectTool}
            onOpenInventory={() => setInventoryOpen(true)}
            toolIcons={toolIcons}
          />

          {inventoryOpen && (
            <InventoryPanel
              inventory={wallet.inventory}
              gear={{ ...wallet.gear, drill: drillTier(wallet.gear) }}
              tintinas={wallet.tintinas}
              onClose={() => setInventoryOpen(false)}
            />
          )}
        </>
      )}

      {/* R.O.V.E.R. DIALOGUE */}
      {roverOpen && (
        <aside className="rover-tab rover-tab--open">
          <RoverDialogue
            actions={roverActions}
            key={`${roverIntroComplete}-${roverLine}-${hughReply ? "hugh" : "rover"}`}
            message={roverMessage}
            speaker={hughReply ? "HUGH MANN" : "R.O.V.E.R."}
          />
        </aside>
      )}

      {/* TRADER DIALOGUE */}
      {traderTalk && talkingTrader && (
        <aside className="rover-tab rover-tab--open">
          <RoverDialogue
            actions={traderLine.actions}
            key={JSON.stringify(traderTalk)}
            message={traderLine.message}
            portrait={talkingTrader.frames?.[0]}
            portraitText={talkingTrader.portrait}
            speaker={TRADER_DIALOGUE[traderTalk.id].speaker}
          />
        </aside>
      )}

      {rideStage === "ride" && (
        <div
          aria-hidden="true"
          className="rover-ride"
          style={{ left: `${ROVER_SPOT.x}%`, top: `${ROVER_SPOT.y}%` }}
        >
          <span
            className="hugh-mann__sprite rover-ride__hugh"
            style={{ backgroundImage: `url("${hughRight}")` }}
          />
          <span className="rover-npc__art">
            <img alt="" draggable="false" src={roverSprite} />
          </span>
        </div>
      )}

      {tradingWith && (
        <TradingPost
          bossDefeated={bossDefeated}
          initialTraderId={tradingWith}
          onChange={updateWallet}
          onEvent={onTradeEvent}
          onLeave={() => setTradingWith(null)}
          wallet={wallet}
        />
      )}

      {scene && (
        <VoicedScene
          className={tradingWith ? "voiced-scene--over-market" : ""}
          endActions={scene.endActions}
          interactive={scene.interactive}
          key={scene.key}
          onDone={() => endScene(scene)}
          scene={SCENES[scene.id]}
        />
      )}

      {showEnding && (
        <div className="game-ending" role="dialog" aria-modal="true" aria-labelledby="game-ending-title">
          <section className="game-panel game-ending__panel">
            <p className="game-eyebrow">PROJECT GEAUX HOME // MISSION COMPLETE</p>
            <h2 id="game-ending-title">THE END</h2>
            <p>
              {ending === "A"
                ? "Hugh Mann and R.O.V.E.R. blast off for Earth together. Somewhere, a hat-maker is about to get a very strange order."
                : "Hugh Mann blasts off alone. Down on the red sand, R.O.V.E.R. watches the sky... and remembers."}
            </p>
            <div className="travel-prompt__actions">
              <button className="game-button" onClick={() => { saveProgress(); onMainMenu(); }} type="button">
                MAIN MENU
              </button>
              <button className="game-button" onClick={() => setShowEnding(false)} type="button">
                KEEP EXPLORING
              </button>
            </div>
          </section>
        </div>
      )}

      <div className={`black-fade${fadeIn || fadeToBlack ? " black-fade--active" : ""}`} />

      {charactersVisible && (
        <div className="mission-actions">
          <button
            className="game-button"
            onClick={() => !paused && !movementBlocked && setObjectivesOpen(true)}
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

      <ObjectivesMenu
        isOpen={objectivesOpen && !paused}
        objective={currentObjective}
        objectives={objectiveList}
        onClose={() => setObjectivesOpen(false)}
      />

      {paused && (
        <PauseMenu
          onControls={() =>
            setPauseNotice("WASD MOVE // E INTERACT // 1-3 TOOLS // SPACE FIRE // TAB OBJECTIVES")
          }
          onMainMenu={() => {
            saveProgress();
            onMainMenu();
          }}
          onQuit={() => setPauseNotice("CLOSE THIS BROWSER TAB TO QUIT THE GAME.")}
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
            <p>
              {travelLock_ === "filter"
                ? "The sulfur air will choke you. Buy a FILTER from Captain McMars at the Vastitas market first."
                : travelLock_ === "blaster"
                  ? "Alpha Zeno waits in the caldera. Buy a BLASTER from Captain McMars before you go."
                  : travelTarget.id === "caldera"
                    ? "Final boss ahead: Alpha Zeno. Dodge its lunge, keep firing with SPACE or click. You regenerate health when out of combat."
                : travelTarget.needsFilter
                  ? "Filter equipped. Zenos roam here: equip the BLASTER [2] and fire with SPACE or click."
                  : "The route ahead will move you away from the crash site."}
            </p>
            <div className="travel-prompt__actions">
              <button
                className="game-button"
                disabled={travelLocked}
                onClick={confirmTravel}
                type="button"
              >
                {travelLocked ? `NEED ${travelLock_.toUpperCase()}` : "TRAVEL"}
              </button>
              <button className="game-button" onClick={() => setTravelTarget(null)} type="button">
                STAY HERE
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

// A trader standing at their stall. Oxy animates through his 3 frames.
function TraderNpc({ trader, spot, near, onClick }) {
  const [frame, setFrame] = useState(0);
  const frames = trader.frames?.filter(Boolean) ?? [];
  useEffect(() => {
    if (frames.length < 2) return undefined;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % frames.length), 400);
    return () => window.clearInterval(id);
  }, [frames.length]);

  return (
    <button
      aria-label={`Talk to ${trader.name}`}
      className="trader-npc"
      onClick={onClick}
      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
      type="button"
    >
      {near && <span className="rover-npc__prompt">[E] TALK</span>}
      {frames.length ? (
        <img alt="" className="trader-npc__art" draggable="false" src={frames[frame % frames.length]} />
      ) : (
        <span className="trader-npc__art trader-npc__art--emoji" aria-hidden="true">{trader.portrait}</span>
      )}
      <span className="trader-npc__name">{trader.name}</span>
    </button>
  );
}
