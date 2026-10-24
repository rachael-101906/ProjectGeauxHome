const storageKey = "project-geaux-home:saves";
const slotCount = 3;

export function readSaveSlots() {
  const storedSaves = window.localStorage.getItem(storageKey);

  if (storedSaves === null) {
    return Array(slotCount).fill(null);
  }

  let saves;
  try {
    saves = JSON.parse(storedSaves);
  } catch {
    throw new Error("Saved missions could not be read because the save data is invalid.");
  }

  if (!Array.isArray(saves) || saves.length !== slotCount) {
    throw new Error("Saved missions could not be read because the save data has an invalid format.");
  }

  return saves.map((save, index) => {
    if (save === null) {
      return null;
    }

    if (
      typeof save !== "object" ||
      save.slot !== index ||
      typeof save.createdAt !== "string" ||
      typeof save.updatedAt !== "string" ||
      !["briefing", "in-progress"].includes(save.status) ||
      typeof save.currentObjective !== "string" ||
      (save.currentLocation !== undefined &&
        typeof save.currentLocation !== "string") ||
      typeof save.selectedTool !== "string" ||
      !Array.isArray(save.objectives) ||
      !save.objectives.every(
        (objective) =>
          objective !== null &&
          typeof objective === "object" &&
          typeof objective.name === "string" &&
          Number.isFinite(objective.progress) &&
          objective.progress >= 0 &&
          objective.progress <= 100,
      )
    ) {
      throw new Error(`Mission ${index + 1} could not be read because its save data is invalid.`);
    }

    return {
      ...save,
      currentLocation: save.currentLocation || "Arcadia Planitia",
      objectiveStage: Number.isInteger(save.objectiveStage)
        ? save.objectiveStage
        : 0,
      iceCollected: Number.isFinite(save.iceCollected)
        ? Math.max(0, save.iceCollected)
        : 0,
      habitatPowered: Boolean(save.habitatPowered),
      travelUnlocked: Boolean(save.travelUnlocked),
      currentObjective: save.objectiveStage === undefined
        ? "Find R.O.V.E.R."
        : save.currentObjective,
    };
  });
}

function writeSaveSlots(saves) {
  window.localStorage.setItem(storageKey, JSON.stringify(saves));
  return saves;
}

export function createSaveSlot(slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= slotCount) {
    throw new RangeError("Choose a valid mission slot.");
  }

  const saves = readSaveSlots();
  if (saves[slot] !== null) {
    throw new Error(`Mission ${slot + 1} already contains a saved game.`);
  }

  const timestamp = new Date().toISOString();
  saves[slot] = {
    slot,
    createdAt: timestamp,
    updatedAt: timestamp,
    status: "briefing",
    currentLocation: "Arcadia Planitia",
    selectedTool: "Pickaxe",
    currentObjective: "Find R.O.V.E.R.",
    objectiveStage: 0,
    iceCollected: 0,
    habitatPowered: false,
    travelUnlocked: false,
    objectives: [],
  };

  return writeSaveSlots(saves);
}

export function updateSaveSlot(slot, updates) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= slotCount) {
    throw new RangeError("Choose a valid mission slot.");
  }

  const saves = readSaveSlots();
  if (saves[slot] === null) {
    throw new Error(`Mission ${slot + 1} has no saved game to update.`);
  }

  saves[slot] = {
    ...saves[slot],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return writeSaveSlots(saves);
}
