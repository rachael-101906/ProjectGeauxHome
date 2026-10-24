import { sellOres } from './data/sellOres';

export function sellOres(state, ore, qty) {
    if (state.inventory[ore] < qty) {
        return state;
    }
    return {
        ...state,
        tintinas: state.tintinas + sellOres[ore] * qty,
        inventory: {
            ...state.inventory,
            [ore]: state.inventory[ore] - qty
        }
    }
}

