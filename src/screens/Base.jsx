import { useEffect, useRef, useState } from "react";
import HUD from "../components/HUD.jsx";
import ObjectivesMenu from "../components/ObjectivesMenu.jsx";
import PauseMenu from "../components/PauseMenu.jsx";
import RoverDialogue from "../components/RoverDialogue.jsx";

import smoke from "../components/assets/icons/pixel-art-32x32-2f.gif";
import spaceship from "../components/assets/backgrounds/spaceship.png";
import arcadia from "../components/assets/backgrounds/arcadia.png";
import albaMons from "../components/assets/backgrounds/alba-mons.png";
import tempeTerra from "../components/assets/backgrounds/tempe-terra.png";
import vastitasBorealis from "../components/assets/backgrounds/vastitas-borealis.png";
import roverSprite from "../components/assets/backgrounds/rover.png";

import { rover_dialogue, user_dialogue } from "../data/dialogue.js";

// Movement tuning: percent of the screen crossed per second.
const MOVE_SPEED_X = 30;
const MOVE_SPEED_Y = 34;
// minX/maxX keep Hugh clear of the left and right travel buttons.
const MOVE_LIMITS = { minX: 10, maxX: 90, minY: 50, maxY: 88 };
const START_POSITION = { x: 50, y: 72 };

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
  const [roverSequence, setRoverSequence] = useState(false);
  const [fadeToBlack, setFadeToBlack] = useState(false);

  // Hugh's position lives in a ref and is written straight to the element each frame
  const hughRef = useRef(null);
  const positionRef = useRef({ ...START_POSITION });
  const heldKeys = useRef(new Set());
  const nearRoverRef = useRef(false);
  const [nearRover, setNearRover] = useState(false);

  const movementBlocked