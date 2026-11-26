import type { Guesstimate } from "@/engine/types";
import { chai } from "./chai";
import { momoStall } from "./momoStall";
import { bengaluruOrders } from "./bengaluruOrders";
import { movieTickets } from "./movieTickets";
import { darkStore } from "./darkStore";

/** Learning path order: easiest first. */
export const GUESSTIMATES: Guesstimate[] = [chai, momoStall, bengaluruOrders, movieTickets, darkStore];

export function getGuesstimate(id: string): Guesstimate | undefined {
  return GUESSTIMATES.find((g) => g.id === id);
}
