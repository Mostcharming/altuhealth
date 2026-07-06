import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges Tailwind CSS class names with conditional logic.
 * @example
 * cn("bg-white", isActive && "text-black", "px-4") → "bg-white text-black px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

/**
 * Capitalizes each word in a string
 * @example
 * capitalizeWords("hello world") → "Hello World"
 */
export function capitalizeWords(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
