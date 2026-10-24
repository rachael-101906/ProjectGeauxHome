// Ore nodes become tougher as their tier increases.
const ores = {
    ice: { tier: 1, health: 10, location: "Vastitas Borealis", needsFilter: false },
    iron: { tier: 2, health: 25, location: "Alba Mons", needsFilter: false },
    silica: { tier: 3, health: 40, location: "Alba Mons", needsFilter: false },
    sulfur: { tier: 3, health: 50, location: "Olympus Mons", needsFilter: true },
    basalt: { tier: 4, health: 75, location: "Olympus Mons", needsFilter: true }
};

export default ores;
