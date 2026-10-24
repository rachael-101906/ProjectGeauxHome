import ores from '../data/ores';
import shop from '../data/shop';

const pickaxes = shop.filter((item) => item.type === 'pickaxe');

function getPlayerState(state) {
    return state.player ?? state;
}

function getOre(ore) {
    if (typeof ore === 'string') {
        return ores[ore] ? { id: ore, ...ores[ore] } : null;
    }

    if (ore && typeof ore === 'object') {
        const id = ore.id ?? Object.keys(ores).find((oreId) => ores[oreId] === ore);
        return { id, ...ore };
    }

    return null;
}

function getPickaxe(pickaxe) {
    if (pickaxe && typeof pickaxe === 'object') {
        return pickaxe;
    }

    if (typeof pickaxe === 'number') {
        return pickaxes.find((item) => item.tier === pickaxe) ?? null;
    }

    if (typeof pickaxe === 'string') {
        return pickaxes.find((item) => item.id === pickaxe) ?? null;
    }

    return null;
}

export function mine(state, ore) {
    const player = getPlayerState(state);
    const targetOre = getOre(ore);
    const pickaxe = getPickaxe(player.gear?.pickaxe);

    if (!targetOre || !pickaxe || targetOre.tier > pickaxe.tier) {
        return state;
    }

    if (targetOre.needsFilter && !player.gear?.hasFilter) {
        return state;
    }

    const oreHealth = player.mining?.oreHealth ?? {};
    const currentHealth = oreHealth[targetOre.id] ?? targetOre.health;
    const remainingHealth = Math.max(0, currentHealth - Number(pickaxe.oreDamage));
    const minedOre = remainingHealth === 0 ? 1 : 0;
    const nextPlayer = {
        ...player,
        inventory: {
            ...player.inventory,
            [targetOre.id]: (player.inventory?.[targetOre.id] ?? 0) + minedOre
        },
        mining: {
            ...player.mining,
            oreHealth: {
                ...oreHealth,
                [targetOre.id]: remainingHealth === 0 ? targetOre.health : remainingHealth
            }
        }
    };

    return state.player
        ? { ...state, player: nextPlayer }
        : nextPlayer;
}
