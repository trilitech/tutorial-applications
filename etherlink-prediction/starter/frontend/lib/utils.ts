import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// generate an array of market IDs based on the no of markets
export const marketIds = (noOfMarkets:[]) => {
return noOfMarkets
  ? Array.from({ length: Number(noOfMarkets) }, (_, i) => i + 1)
  : [];
};