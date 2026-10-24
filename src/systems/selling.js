import { SELL_PRICES } from "../data/prices";
import { RESOURCES } from "../data/resources";
import { fail, ok } from "./helpers";

export function sell(game, oreId, quantity = 1) {
  const resource = RESOURCES[oreId];
  const available = game.inventory?.[oreId] ?? 0;
  const amount = Math.max(0, Math.min(Number(quantity) || 0, available));

  if (!resource || amount === 0) {
    return fail(game, resource ? `You have no ${resource.name} to sell.` : "Unknown resource.");
  }

  const earned = SELL_PRICES[oreId] * amount;
  return ok(
    {
      ...game,
      tintinas: game.tintinas + earned,
      inventory: { ...game.inventory, [oreId]: available - amount },
    },
    `Sold ${amount} ${resource.name} for ${earned} T.`,
  );
}
