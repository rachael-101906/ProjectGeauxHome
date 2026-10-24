// Central lookup for the sprite art in src/components/characters/.
// Filenames have spaces/parentheses, so we glob instead of hand-importing.
const files = import.meta.glob("../components/characters/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

function find(prefix) {
  const key = Object.keys(files).find((path) =>
    path.split("/").pop().toLowerCase().startsWith(prefix.toLowerCase()),
  );
  return key ? files[key] : null;
}

// DRILL_FRAMES[tier] -> [frame1, frame2, frame3]
export const DRILL_FRAMES = Object.fromEntries(
  [1, 2, 3, 4].map((tier) => [
    tier,
    [1, 2, 3].map((frame) => find(`DrillT${tier}_${frame}`)),
  ]),
);

export const MARTY_FRAMES = [1, 2, 3].map((frame) => find(`MartyMcMars_${frame}`));
export const T_BIT = find("T-Bit");
export const MOB_ART = { bZero: find("B-Zero"), aZero: find("A_Xeno") };
