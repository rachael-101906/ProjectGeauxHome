const RESOURCE_LIST = [
  { id: "ice", name: "Ice", tier: 1, location: "vastitas", needsFilter: false },
  { id: "iron", name: "Iron", tier: 2, location: "albaMons", needsFilter: false },
  { id: "silica", name: "Silica", tier: 3, location: "albaMons", needsFilter: false },
  { id: "sulfur", name: "Sulfur", tier: 3, location: "olympus", needsFilter: true },
  { id: "basalt", name: "Basalt", tier: 4, location: "olympus", needsFilter: true },
];

export const RESOURCES = Object.fromEntries(
  RESOURCE_LIST.map((resource) => [resource.id, resource]),
);
export const RESOURCE_IDS = RESOURCE_LIST.map((resource) => resource.id);
