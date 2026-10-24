export const OBJECTIVE_STAGES = [
  { id: "find-rover", title: "Find R.O.V.E.R." },
  { id: "collect-ice", title: "Collect 10 Ice" },
  { id: "restore-habitat", title: "Restore Habitat Power" },
  { id: "unlock-travel", title: "Unlock Travel" },
  { id: "travel-to-alba", title: "Travel to Alba Mons" },
];

export function createObjectiveState(save = {}) {
  const stage = Number.isInteger(save.objectiveStage)
    ? Math.min(OBJECTIVE_STAGES.length, Math.max(0, save.objectiveStage))
    : 0;

  return {
    stage,
    iceCollected: Number.isFinite(save.iceCollected)
      ? Math.min(10, Math.max(0, save.iceCollected))
      : 0,
    habitatPowered: Boolean(save.habitatPowered) || stage >= 3,
    travelUnlocked: Boolean(save.travelUnlocked) || stage >= 4,
  };
}

export function getCurrentObjective(objectiveState) {
  return OBJECTIVE_STAGES[objectiveState.stage]?.title ?? "Mission milestone complete";
}

export function advanceObjective(objectiveState) {
  return {
    ...objectiveState,
    stage: Math.min(OBJECTIVE_STAGES.length, objectiveState.stage + 1),
  };
}

export function collectIce(objectiveState, amount = 1) {
  if (
    objectiveState.stage !== 1 ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return objectiveState;
  }

  const iceCollected = Math.min(10, objectiveState.iceCollected + amount);
  return {
    ...objectiveState,
    iceCollected,
    stage: iceCollected >= 10 ? 2 : objectiveState.stage,
  };
}

export function restoreHabitatPower(objectiveState) {
  if (objectiveState.stage !== 2) return objectiveState;

  return {
    ...objectiveState,
    habitatPowered: true,
    stage: 3,
  };
}

export function unlockTravel(objectiveState) {
  if (objectiveState.stage !== 3) return objectiveState;

  return {
    ...objectiveState,
    travelUnlocked: true,
    stage: 4,
  };
}

export function completeTravelObjective(objectiveState, locationId) {
  if (objectiveState.stage !== 4 || locationId !== "alba-mons") {
    return objectiveState;
  }

  return advanceObjective(objectiveState);
}

export class ObjectiveManager {
  constructor(initialState = {}) {
    this.state = createObjectiveState(initialState);
  }

  get current() {
    return getCurrentObjective(this.state);
  }

  advance() {
    this.state = advanceObjective(this.state);
    return this.state;
  }

  collectIce(amount = 1) {
    this.state = collectIce(this.state, amount);
    return this.state;
  }

  restoreHabitatPower() {
    this.state = restoreHabitatPower(this.state);
    return this.state;
  }

  unlockTravel() {
    this.state = unlockTravel(this.state);
    return this.state;
  }

  completeTravel(locationId) {
    this.state = completeTravelObjective(this.state, locationId);
    return this.state;
  }
}
