export const DEPENDENT_RELATIONSHIPS = [
  { key: "spouse", label: "Spouse" },
  { key: "child", label: "Child" },
  { key: "parent", label: "Parent" },
  { key: "sibling", label: "Sibling" },
  { key: "other", label: "Other" },
] as const;

export type DependentRelationship =
  (typeof DEPENDENT_RELATIONSHIPS)[number]["key"];

export type DependentAgeLimits = Partial<
  Record<DependentRelationship, number | null>
>;

export const MIN_DEPENDENT_AGE_LIMIT = 0;
export const MAX_DEPENDENT_AGE_LIMIT = 150;

const normalizeAgeLimit = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;

  const age = Number(value);
  return Number.isInteger(age) &&
    age >= MIN_DEPENDENT_AGE_LIMIT &&
    age <= MAX_DEPENDENT_AGE_LIMIT
    ? age
    : undefined;
};

export function hydrateDependentAgeLimits(
  limits?: DependentAgeLimits | null,
  legacyLimit?: number | null
): DependentAgeLimits {
  const fallback = normalizeAgeLimit(legacyLimit);

  return DEPENDENT_RELATIONSHIPS.reduce<DependentAgeLimits>(
    (hydrated, { key }) => {
      const hasRelationshipValue = Boolean(
        limits && Object.prototype.hasOwnProperty.call(limits, key)
      );

      if (hasRelationshipValue) {
        const value = limits?.[key];
        if (value === null) {
          hydrated[key] = null;
          return hydrated;
        }

        const normalized = normalizeAgeLimit(value);
        if (normalized !== undefined) hydrated[key] = normalized;
        return hydrated;
      }

      if (fallback !== undefined) hydrated[key] = fallback;
      return hydrated;
    },
    {}
  );
}
