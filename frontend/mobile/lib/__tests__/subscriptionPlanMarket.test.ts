import {
  buildSubscriptionPlanGroups,
  getSubscriptionPurchaseTotal,
  getSubscriptionVariantLabel,
  inferSubscriptionPlanCategory,
  isIndividualSubscriptionPlan,
  isInternationalVitalPlan,
  isVisibleSubscriptionGroup,
} from "../subscriptionPlanMarket";
import type { SubscriptionPlan } from "../enrolleeApi";

const plans: SubscriptionPlan[] = [
  {
    id: "vital-basic-individual",
    name: "Vital Basic Individual",
    code: "VITAL_BASIC_INDIVIDUAL",
    amount: 100_000,
    currency: "NGN",
  },
  {
    id: "vital-basic-family",
    name: "Vital Basic Family",
    code: "VITAL_BASIC_FAMILY",
    amount: 350_000,
    currency: "NGN",
    allowDependentEnrolee: true,
    maxNumberOfDependents: 3,
  },
  {
    id: "vital-plus-international",
    name: "Vital Plus International Individual",
    code: "VITAL_PLUS_INTERNATIONAL_INDIVIDUAL",
    amount: 900,
    currency: "GBP",
  },
];

describe("mobile subscription plan market", () => {
  it("groups plan variants using the landing-page plan families", () => {
    const groups = buildSubscriptionPlanGroups(plans);
    const vitalBasic = groups.find((group) => group.name === "Vital Basic");

    expect(vitalBasic?.rows.map((row) => row.label)).toEqual(["Individual", "Family"]);
    expect(vitalBasic?.sources).toHaveLength(2);
  });

  it("recognises individual plans that support the people counter", () => {
    expect(getSubscriptionVariantLabel(plans[0])).toBe("Individual");
    expect(isIndividualSubscriptionPlan(plans[0])).toBe(true);
    expect(isIndividualSubscriptionPlan(plans[1])).toBe(false);
    expect(getSubscriptionPurchaseTotal(plans[0], 3)).toBe(300_000);
    expect(getSubscriptionPurchaseTotal(plans[1], 3)).toBe(350_000);
  });

  it("keeps international Vital plans in the diaspora retail market", () => {
    const internationalPlan = plans[2];
    expect(isInternationalVitalPlan(internationalPlan)).toBe(true);
    expect(inferSubscriptionPlanCategory(internationalPlan)).toBe("diaspora");

    const group = buildSubscriptionPlanGroups([internationalPlan])[0];
    expect(isVisibleSubscriptionGroup(group, "diaspora")).toBe(true);
    expect(isVisibleSubscriptionGroup(group, "retail")).toBe(false);
  });
});
