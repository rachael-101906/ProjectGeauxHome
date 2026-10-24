import arcadiaBackground from "../components/assets/backgrounds/6.png";
import albaBackground from "../components/assets/backgrounds/9.png";
import tempeBackground from "../components/assets/backgrounds/11.png";
import vastitasBackground from "../components/assets/backgrounds/7.png";
import olympusBackground from "../components/assets/backgrounds/10.png";
import roverDecoration from "../components/assets/decorations/12.png";
import shipDecoration from "../components/assets/decorations/13.png";
import habitatDecoration from "../components/assets/decorations/14.png";
import crashFireDecoration from "../components/assets/decorations/19.png";

const locations = [
  {
    id: "arcadia-planitia",
    name: "Arcadia Planitia",
    background: arcadiaBackground,
    tint: "arcadia",
    description: "Crash-site refuge and the crew's first foothold on Mars.",
    resources: ["Ice", "Iron"],
    difficulty: "LOW",
    activity: "HOME BASE",
    spawn: { x: 1200, y: 900 },
    decorations: [
      { id: "crashed-ship", image: shipDecoration, x: 720, y: 1090, width: 850 },
      { id: "crash-fire", image: crashFireDecoration, x: 970, y: 950, width: 350 },
      { id: "habitat", image: habitatDecoration, x: 1650, y: 1150, width: 750 },
      { id: "rover", image: roverDecoration, x: 1430, y: 950, width: 620 },
    ],
    resourceNodes: [
      { id: "ice-1", resource: "Ice", x: 700, y: 710 },
      { id: "iron-1", resource: "Iron", x: 1710, y: 1120 },
    ],
    npcs: [
      { id: "rover", name: "R.O.V.E.R.", x: 1300, y: 900 },
      { id: "dr-oxy", name: "Dr. Oxy Genn", x: 920, y: 1110 },
    ],
    interactables: [
      { id: "habitat-power", name: "Habitat Power", type: "habitat", x: 1000, y: 900 },
    ],
    enemySpawnPoints: [{ id: "beta-1", enemy: "Beta-Zero", x: 1950, y: 700 }],
  },
  {
    id: "alba-mons",
    name: "Alba Mons",
    background: albaBackground,
    tint: "alba",
    description: "Volcanic tunnels conceal rich veins and stronger tools.",
    resources: ["Iron", "Silica"],
    difficulty: "MODERATE",
    activity: "MINING",
    spawn: { x: 1200, y: 900 },
    resourceNodes: [
      { id: "iron-1", resource: "Iron", x: 740, y: 780 },
      { id: "silica-1", resource: "Silica", x: 1770, y: 1050 },
    ],
    npcs: [
      { id: "marty", name: "Marty McMars", x: 1480, y: 760 },
      { id: "rover", name: "R.O.V.E.R.", x: 1300, y: 900 },
    ],
    interactables: [],
    enemySpawnPoints: [
      { id: "beta-1", enemy: "Beta-Zero", x: 1950, y: 700 },
      { id: "alpha-1", enemy: "Alpha-Zero", x: 600, y: 1170 },
    ],
  },
  {
    id: "tempe-terra",
    name: "Tempe Terra",
    background: tempeBackground,
    tint: "tempe",
    description: "A fractured highland where a silent relay awaits repair.",
    resources: ["Silica", "Iron"],
    difficulty: "MODERATE",
    activity: "COMMUNICATIONS",
    spawn: { x: 1200, y: 900 },
    resourceNodes: [
      { id: "silica-1", resource: "Silica", x: 720, y: 830 },
      { id: "iron-1", resource: "Iron", x: 1730, y: 1080 },
    ],
    npcs: [{ id: "rover", name: "R.O.V.E.R.", x: 1300, y: 900 }],
    interactables: [],
    enemySpawnPoints: [{ id: "alpha-1", enemy: "Alpha-Zero", x: 1950, y: 700 }],
  },
  {
    id: "vastitas-borealis",
    name: "Vastitas Borealis",
    background: vastitasBackground,
    tint: "vastitas",
    description: "A frozen trade outpost built from a stranded cargo lander.",
    resources: ["Ice", "Sulfur"],
    difficulty: "LOW",
    activity: "TRADING",
    spawn: { x: 1200, y: 900 },
    resourceNodes: [
      { id: "ice-1", resource: "Ice", x: 720, y: 830 },
      { id: "sulfur-1", resource: "Sulfur", x: 1730, y: 1080 },
    ],
    npcs: [
      { id: "marty", name: "Marty McMars", x: 1480, y: 760 },
      { id: "dj-tmoney", name: "DJ-TMoney", x: 910, y: 1110 },
      { id: "rover", name: "R.O.V.E.R.", x: 1300, y: 900 },
    ],
    interactables: [],
    enemySpawnPoints: [{ id: "beta-1", enemy: "Beta-Zero", x: 1950, y: 700 }],
  },
  {
    id: "olympus-mons",
    name: "Olympus Mons",
    background: olympusBackground,
    tint: "olympus",
    description: "A dangerous caldera holds the final materials for your rocket.",
    resources: ["Sulfur", "Basalt"],
    difficulty: "HIGH",
    activity: "COMBAT / ENDGAME",
    spawn: { x: 1200, y: 900 },
    resourceNodes: [
      { id: "sulfur-1", resource: "Sulfur", x: 720, y: 830 },
      { id: "basalt-1", resource: "Basalt", x: 1730, y: 1080 },
    ],
    npcs: [{ id: "rover", name: "R.O.V.E.R.", x: 1300, y: 900 }],
    interactables: [],
    enemySpawnPoints: [
      { id: "alpha-1", enemy: "Alpha-Zero", x: 1950, y: 700 },
      { id: "alpha-plus-1", enemy: "Alpha+ Zero", x: 600, y: 1170 },
    ],
  },
];

export const GAME_LOCATIONS = locations;

export function getGameLocation(location) {
  const key = String(location ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

  return (
    locations.find(
      (entry) =>
        entry.id === key || entry.name.toLowerCase().replace(/\s+/g, "-") === key,
    ) ?? locations[0]
  );
}
