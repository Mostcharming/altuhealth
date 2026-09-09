import type { SubscriptionPlan } from "@/lib/enrolleeApi";

export type SubscriptionPlanCategory = "retail" | "diaspora" | "geriatric" | "corporate" | "general";

export type SubscriptionPlanGroup = {
  id: string;
  name: string;
  description: string;
  category: SubscriptionPlanCategory;
  cycleLabel: string;
  rows: {
    label: string;
    plan: SubscriptionPlan;
  }[];
  sources: SubscriptionPlan[];
};

export const MAX_INDIVIDUAL_PLAN_DEPENDENTS = 100;

type PlanNameDefinition = {
  category: Exclude<SubscriptionPlanCategory, "corporate" | "general">;
  group: string;
  displayName: string;
  family: "senior" | "vital" | "altu";
  order: number;
};

const planNameDefinitions: PlanNameDefinition[] = [
  { category: "geriatric", group: "senior basic", displayName: "Senior Basic", family: "senior", order: 1 },
  { category: "geriatric", group: "senior standard", displayName: "Senior Standard", family: "senior", order: 2 },
  { category: "geriatric", group: "senior elite", displayName: "Senior Elite", family: "senior", order: 3 },
  { category: "retail", group: "vital basic", displayName: "Vital Basic", family: "vital", order: 1 },
  { category: "retail", group: "vital lite", displayName: "Vital Lite", family: "vital", order: 2 },
  { category: "retail", group: "vital groove", displayName: "Vital Groove", family: "vital", order: 3 },
  { category: "retail", group: "vital plus", displayName: "Vital Plus", family: "vital", order: 4 },
  { category: "retail", group: "vital max", displayName: "Vital Max", family: "vital", order: 5 },
  { category: "diaspora", group: "altu basic", displayName: "Altu Basic", family: "altu", order: 1 },
  { category: "diaspora", group: "altu standard", displayName: "Altu Standard", family: "altu", order: 2 },
  { category: "diaspora", group: "altu elite", displayName: "Altu Elite", family: "altu", order: 3 },
];

function normalizePlanName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPlanNameDefinition(plan: SubscriptionPlan) {
  const lowerCaseName = normalizePlanName(plan.name || "");
  return planNameDefinitions.find((definition) => lowerCaseName.includes(definition.group));
}

export function isInternationalVitalPlan(plan: SubscriptionPlan) {
  const definition = getPlanNameDefinition(plan);
  return Boolean(
    definition?.family === "vital" &&
      [plan.code, plan.name, plan.description]
        .map((value) => normalizePlanName(value || ""))
        .some((value) => /\b(int|international|diaspora|abroad|overseas)\b/.test(value))
  );
}

export function isAltuPlan(plan: SubscriptionPlan) {
  return [plan.code, plan.name, plan.description]
    .map((value) => normalizePlanName(value || ""))
    .some((value) => /\baltu\b/.test(value));
}

export function inferSubscriptionPlanCategory(plan: SubscriptionPlan): SubscriptionPlanCategory {
  const definition = getPlanNameDefinition(plan);

  if (isInternationalVitalPlan(plan)) return "diaspora";
  if (definition) return definition.category;

  const text = normalizePlanName(plan.name || "");
  if (/(corporate|company|business|employer|staff|group)/.test(text)) return "corporate";
  if (/(geriatric|senior|elder|aged|parent)/.test(text)) return "geriatric";
  if (/(diaspora|international|abroad|overseas|uk|usa|europe)/.test(text)) return "diaspora";
  if (/(retail|vital|individual|family)/.test(text)) return "retail";
  return "general";
}

export function getSubscriptionVariantLabel(plan: SubscriptionPlan) {
  const definition = getPlanNameDefinition(plan);
  const variantTexts = [plan.code, plan.name, plan.description]
    .map((value) => normalizePlanName(value || ""))
    .filter(Boolean);

  if (definition?.family === "senior") {
    for (const text of variantTexts) {
      if (text.includes("couple")) return "Couple";
      if (text.includes("single parent") || text.includes("single")) return "Single";
    }
    return "Plan";
  }

  if (definition?.family === "vital") {
    for (const text of variantTexts) {
      if (text.includes("family")) return "Family";
      if (text.includes("individual")) return "Individual";
    }
    return "Plan";
  }

  if (definition?.family === "altu") {
    const individualCountFromName = variantTexts
      .map((text) => text.match(/\b([1-4])\s+individuals?\b/))
      .find(Boolean);
    const dependentCount = Number(plan.maxNumberOfDependents);
    const individualCount = individualCountFromName
      ? Number(individualCountFromName[1])
      : Number.isInteger(dependentCount) && dependentCount >= 0
        ? dependentCount + 1
        : 1;
    return `${individualCount} ${individualCount === 1 ? "Individual" : "Individuals"}`;
  }

  for (const text of variantTexts) {
    if (text.includes("family")) return "Family";
    if (text.includes("couple")) return "Couple";
    if (text.includes("single")) return "Single";
    if (text.includes("individual")) return "Individual";
  }
  return "Plan";
}

export function isIndividualSubscriptionPlan(plan?: SubscriptionPlan | null) {
  return Boolean(plan && /^(?:1 )?individual$/i.test(getSubscriptionVariantLabel(plan)));
}

export function getSubscriptionPurchaseTotal(plan?: SubscriptionPlan | null, peopleCount = 1) {
  const quantity = isIndividualSubscriptionPlan(plan) ? Math.max(1, Math.floor(peopleCount)) : 1;
  return Math.round((Number(plan?.amount || 0) * quantity + Number.EPSILON) * 100) / 100;
}

function getPlanGroupKey(plan: SubscriptionPlan) {
  return getPlanNameDefinition(plan)?.group || normalizePlanName(plan.name || plan.id);
}

function getPlanOrder(plan: SubscriptionPlan) {
  return getPlanNameDefinition(plan)?.order ?? 999;
}

function getRowOrder(plan: SubscriptionPlan) {
  const definition = getPlanNameDefinition(plan);
  const label = getSubscriptionVariantLabel(plan);
  if (definition?.family === "altu") return Number.parseInt(label, 10) || 999;
  if (label === "Single" || label === "Individual") return 1;
  if (label === "Couple" || label === "Family") return 2;
  return 999;
}

function cycleToLabel(cycle?: string) {
  const normalized = String(cycle || "annual").toLowerCase();
  if (normalized.includes("month")) return "per month";
  if (normalized.includes("quarter")) return "per quarter";
  if (normalized.includes("week")) return "per week";
  return "per year";
}

export function buildSubscriptionPlanGroups(plans: SubscriptionPlan[]): SubscriptionPlanGroup[] {
  const grouped = new Map<string, { category: SubscriptionPlanCategory; group: string; plans: SubscriptionPlan[] }>();

  plans.forEach((plan) => {
    const category = inferSubscriptionPlanCategory(plan);
    const group = getPlanGroupKey(plan);
    const key = `${category}:${group}`;
    const existing = grouped.get(key);
    if (existing) existing.plans.push(plan);
    else grouped.set(key, { category, group, plans: [plan] });
  });

  return Array.from(grouped.values())
    .map((item) => {
      const orderedPlans = [...item.plans].sort(
        (a, b) => getRowOrder(a) - getRowOrder(b) || (a.name || "").localeCompare(b.name || "")
      );
      const firstPlan = orderedPlans[0];
      const cycles = new Set(orderedPlans.map((plan) => cycleToLabel(plan.planCycle)));
      return {
        id: `${item.category}-${item.group}`,
        name: getPlanNameDefinition(firstPlan)?.displayName || firstPlan?.name || titleCase(item.group),
        description: firstPlan?.description || "Healthcare coverage for everyday care and managed support.",
        category: item.category,
        cycleLabel: cycles.size === 1 ? Array.from(cycles)[0] : "billing cycle varies",
        rows: orderedPlans.map((plan) => ({ label: getSubscriptionVariantLabel(plan), plan })),
        sources: orderedPlans,
      };
    })
    .sort((a, b) => {
      const planA = a.sources[0];
      const planB = b.sources[0];
      return getPlanOrder(planA) - getPlanOrder(planB) || a.name.localeCompare(b.name);
    });
}

export function isInternationalSubscriptionMarket(country?: string | null, currentPlan?: SubscriptionPlan | null) {
  const normalizedCountry = String(country || "").trim().toLowerCase();
  if (["ng", "nga", "nigeria"].includes(normalizedCountry)) return false;
  if (normalizedCountry) return true;
  return currentPlan ? inferSubscriptionPlanCategory(currentPlan) === "diaspora" : false;
}

export function isVisibleSubscriptionGroup(group: SubscriptionPlanGroup, category: SubscriptionPlanCategory) {
  return (
    group.category === category &&
    (category !== "diaspora" ||
      (group.sources.length > 0 &&
        group.sources.every(isInternationalVitalPlan) &&
        !group.sources.some(isAltuPlan)))
  );
}
