// Central sprite lookup. New sprites live in assets/<category>; older sprites may live in characters/.
const assetFiles = import.meta.glob("../components/assets/**/*.png", { eager: true, query: "?url", import: "default" });
const legacyFiles = import.meta.glob("../components/characters/*.png", { eager: true, query: "?url", import: "default" });

function findIn(files, prefix, folder) {
  const key = Object.keys(files).find((path) => {
    const parts = path.split("/");
    const name = parts.pop().toLowerCase();
    if (folder && parts.pop() !== folder) return false;
    return name.startsWith(prefix.toLowerCase());
  });
  return key ? files[key] : null;
}
function find(prefix, folder) {
  return findIn(assetFiles, prefix, folder) ?? findIn(legacyFiles, prefix);
}

// If a frame is missing, reuse another frame of the same tier so the drill never vanishes from Hugh's hand.
export const DRILL_FRAMES = Object.fromEntries([1, 2, 3, 4].map((tier) => {
  const frames = [1, 2, 3].map((frame) => find(`DrillT${tier}_${frame}`, "drills"));
  const fallback = frames.find(Boolean) ?? null;
  return [tier, frames.map((frame) => frame ?? fallback)];
}));

// Trader art
const MARTY_FRAMES = [1, 2, 3].map((frame) => find(`MartyMcMars_${frame}`, "characters"));
// Kept as an alias in case an older component still imports OXY_FRAMES.
export const OXY_FRAMES = MARTY_FRAMES;
// The source asset is currently spelled "CaptianMcMarsHuman.png" (sic).
export const CAPTAIN_HUMAN = find("CaptianMcMarsHuman", "characters");
export const CLAW_BIT = find("DJ_CLAW_MONEY", "characters");
export const T_BIT = find("T-Bit", "icons");

export const MOB_ART = {
  bZeno: find("B-Zero", "mobs"),
  aZeno: find("A_Xeno", "mobs"),
  alphaZeno: find("Alpha1", "mobs"),
};
export const ALPHA_FRAMES = [find("Alpha1", "mobs"), find("Alpha2", "mobs")];
export const BLASTER_ART = {
  t1b: find("T1Blaster", "weapons"),
  t2b: find("T2Blaster", "weapons"),
  t3b: find("T3Blaster", "weapons"),
};
export const UPGRADE_ART = {
  comm: find("Comm_Array_Sys", "upgrades"),
  life: find("LifeSupport", "upgrades"),
  fusion: find("FusionPower", "upgrades"),
  propulsion: find("Propulsion Engine", "upgrades"),
};

if (import.meta.env.DEV) {
  const missing = [];
  const check = (label, value) => { if (!value) missing.push(label); };
  Object.entries(DRILL_FRAMES).forEach(([tier, frames]) => frames.forEach((frame, i) => check(`DrillT${tier}_${i + 1}`, frame)));
  MARTY_FRAMES.forEach((frame, i) => check(`MartyMcMars_${i + 1}`, frame));
  [["CAPTAIN_HUMAN", CAPTAIN_HUMAN], ["CLAW_BIT", CLAW_BIT], ["T_BIT", T_BIT]].forEach(([label, value]) => check(label, value));
  [MOB_ART, BLASTER_ART, UPGRADE_ART].forEach((map) => Object.entries(map).forEach(([key, value]) => check(key, value)));
  ALPHA_FRAMES.forEach((frame, i) => check(`Alpha${i + 1}`, frame));
  if (missing.length) console.error("[art.js] Missing sprites:", missing.join(", "));
}