// Capitalize words utility
// Handles: null/undefined, numbers, booleans, arrays, and strings (including camelCase, hyphenated, underscored, punctuation)
export function capitalizeWords(value: unknown, locale = "en-US"): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((v) => capitalizeWords(v, locale)).join(" ");
  }

  if (typeof value !== "string") {
    // For objects or other types, fallback to empty string
    try {
      return String(value);
    } catch {
      return "";
    }
  }

  let str = value.trim();
  if (!str) return "";

  // Split camelCase words (e.g., helloWorld -> hello World)
  str = str.replace(/([a-z0-9])([A-Z])/g, "$1 $2");

  // Capitalize any sequence of letters/digits (preserves punctuation and separators)
  const wordRegex = /[A-Za-zÀ-ÖØ-öø-ÿ0-9']+/g;

  return str.replace(wordRegex, (word) => {
    const first = word.charAt(0).toLocaleUpperCase(locale);
    const rest = word.slice(1).toLocaleLowerCase(locale);
    return first + rest;
  });
}

export default capitalizeWords;
