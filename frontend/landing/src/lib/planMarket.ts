export type PlanCategory = "retail" | "diaspora" | "geriatric" | "corporate";

export type PlanCategoryOption = {
  key: PlanCategory;
  label: string;
};

const planCategoryLabels: Record<PlanCategory, string> = {
  retail: "Retail",
  diaspora: "Retail",
  geriatric: "Geriatric",
  corporate: "Corporate",
};

const nigeriaPlanCategories: PlanCategory[] = ["retail", "geriatric"];

const internationalPlanCategories: PlanCategory[] = ["diaspora", "geriatric"];

let visitorCountryPromise: Promise<string | null> | null = null;

export function getPlanCategoryLabel(category: PlanCategory) {
  return planCategoryLabels[category];
}

export function getPublicPlanCategoryKey(category: PlanCategory) {
  return category === "diaspora" ? "retail" : category;
}

export function getPlanCategoriesForCountry(
  countryCode?: string | null,
): PlanCategoryOption[] {
  const normalizedCountryCode = String(countryCode || "")
    .trim()
    .toUpperCase();
  const categoryKeys =
    normalizedCountryCode && normalizedCountryCode !== "NG"
      ? internationalPlanCategories
      : nigeriaPlanCategories;

  return categoryKeys.map((key) => ({
    key,
    label: planCategoryLabels[key],
  }));
}

export function detectVisitorCountryCode() {
  if (!visitorCountryPromise) {
    visitorCountryPromise = fetch("https://ipapi.co/json/")
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const location = (await response.json()) as {
          country_code?: string;
        };

        return location.country_code?.trim().toUpperCase() || null;
      })
      .catch(() => null);
  }

  return visitorCountryPromise;
}
