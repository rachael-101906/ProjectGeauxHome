// Central lookup for sprite art.
// New art lives in src/components/assets/<category>/. A few older frames only exist in
// src/components/characters/ (DrillT1_1, MartyMcMars_1, T-Bit), so that folder is the fallback.
// Filenames have spaces/parentheses, so we glob instead of hand-importing.
const assetFiles = import.meta.glob("../components/assets/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const legacyFiles = import.meta.glob("../components/characters/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

function findIn(files, prefix, folder) {
  const key = Object.keys(files).find((path) => {
    const parts = path.split("/");
    const name = parts.pop().toLowerCase();
    if (folder && parts.pop() !== folder) return false;
    return name.startsWith(prefix.toLowerCase());
  });
  return key ? files[key] : null;
}

// Prefer the new assets/<folder>, fall back to the legacy characters/ folder.
function find(prefix, folder) {
  return findIn(assetFiles, prefix, folder) ?? findIn(legacyFiles, prefix);
}

// DRILL_FRAMES[tier] -> [frame1, frame2, frame3]
export const DRILL_FRAMES = Object.fromEntries(
  [1, 2, 3, 4].map((tier) => [
    tier,
    [1, 2, 3].map((frame) => find(`DrillT${tier}_${frame}`, "drills")),
  ]),
);

export const MARTY_FRAMES = [1, 2, 3].map((frame) => find(`MartyMcMars_${frame}`, "characters"));
export const CAPTAIN_HUMAN = find("CaptianMcMarsHuman", "characters");
export const T_BIT = find("T-Bit");

// Keys match src/data/mobs.js.
export const MOB_ART = {
  bZeno: find("B-Zero", "mobs"),
  aZeno: find("A_Xeno", "mobs"),
  alphaZeno: find("Alpha1", "mobs"),
};
export const ALPHA_FRAMES = [find("Alpha1", "mobs"), find("Alpha2", "mobs")];

// Keys match shop ids in src/data/shop.js.
export const BLASTER_ART = {
  t1b: find("T1Blaster", "weapons"),
  t2b: find("T2Blaster", "weapons"),
  t3b: find("T3Blaster", "weapons"),
};

// Keys match upgrade ids in src/data/upgrades.js.
export const UPGRADE_ART = {
  comm: find("Comm_Array_Sys", "upgrades"),
  life: find("LifeSupport", "upgrades"),
  fusion: find("FusionPower", "upgrades"),
  propulsion: find("Propulsion Engine", "upgrades"),
};

// Fail loudly in dev if a file gets renamed/moved and a sprite goes missing.
if (import.meta.env.DEV) {
  const missing = [];
  const check = (label, value) => !value && missing.push(label);
  Object.entries(DRILL_FRAMES).forEach(([t, fr]) => fr.forEach((f, i) => check(`DrillT${t}_${i + 1}`, f)));
  MARTY_FRAMES.forEach((f, i) => check(`MartyMcMars_${i + 1}`, f));
  [["CAPTAIN_HUMAN", CAPTAIN_HUMAN], ["T_BIT", T_BIT]].forEach(([l, v]) => check(l, v));
  [MOB_ART, BLASTER_ART, UPGRADE_ART].forEach((map) => Object.entries(map).forEach(([k, v]) => check(k, v)));
  ALPHA_FRAMES.forEach((f, i) => check(`Alpha${i + 1}`, f));
  if (missing.length) console.error("[art.js] Missing sprites:", missing.join(", "));
}
