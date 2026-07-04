import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const QUOTE_CHARS = ["\"", "'", "“", "”", "‘", "’"];

export function stripSurroundingQuotes(text: string) {
  let result = text.trim();
  while (
    result.length >= 2 &&
    QUOTE_CHARS.includes(result[0]) &&
    QUOTE_CHARS.includes(result[result.length - 1])
  ) {
    result = result.slice(1, -1).trim();
  }
  return result;
}
