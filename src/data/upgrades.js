// the 4 robot upgrades + costs

const upgrades = [
  { id: 'comm', name: 'Comm Array Sys', description: 'Restore communications.', cost: { ice: 10, iron: 5 }, requires: [] },
  { id: 'life', name: 'Life Support Sys', description: 'Stabilize life support.', cost: { iron: 10, silica: 3 }, requires: ['comm'] },
  { id: 'fusion', name: 'Fusion Power Sys', description: 'Restore ship power.', cost: { silica: 8, sulfur: 5 }, requires: ['life'] },
  { id: 'propulsion', name: 'Propulsion Engine', description: 'Prepare the return flight.', cost: { sulfur: 15, basalt: 10 }, requires: ['fusion'] },
];

const UPGRADES = upgrades;
const UPGRADES_BY_ID = Object.fromEntries(UPGRADES.map((upgrade) => [upgrade.id, upgrade]));

export { UPGRADES, UPGRADES_BY_ID };
export default upgrades;