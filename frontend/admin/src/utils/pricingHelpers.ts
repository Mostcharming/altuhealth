/**
 * Pricing Helper Utilities for Frontend
 */

export const RATE_TYPES = [
  { value: "per_session", label: "Per Session" },
  { value: "per_visit", label: "Per Visit" },
  { value: "per_hour", label: "Per Hour" },
  { value: "per_day", label: "Per Day" },
  { value: "per_week", label: "Per Week" },
  { value: "per_month", label: "Per Month" },
  { value: "per_consultation", label: "Per Consultation" },
  { value: "per_procedure", label: "Per Procedure" },
  { value: "per_unit", label: "Per Unit" },
  { value: "per_mile", label: "Per Mile" },
];

export const PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "rate", label: "Rate-based Pricing" },
];

/**
 * Format price display based on pricing type
 */
export function formatPriceDisplay(
  priceType?: string,
  fixedPrice?: number | null,
  rateType?: string | null,
  rateAmount?: number | null,
  price?: number | null
): string {
  if (!priceType || priceType === "fixed") {
    const amount = fixedPrice ?? price;
    if (amount === undefined || amount === null) return "N/A";
    return `₦${amount.toLocaleString()}`;
  }

  if (priceType === "rate") {
    if (!rateAmount || !rateType) return "N/A";
    const rateLabel =
      RATE_TYPES.find((r) => r.value === rateType)?.label || rateType;
    return `₦${rateAmount.toLocaleString()} ${rateLabel}`;
  }

  return "N/A";
}

/**
 * Get pricing type label
 */
export function getPriceTypeLabel(priceType?: string): string {
  const type = PRICE_TYPES.find((t) => t.value === priceType);
  return type?.label || "Fixed Price";
}

/**
 * Get rate type label
 */
export function getRateTypeLabel(rateType?: string | null): string {
  if (!rateType) return "-";
  const rate = RATE_TYPES.find((r) => r.value === rateType);
  return rate?.label || rateType;
}

/**
 * Validate pricing data
 */
export interface PricingValidation {
  isValid: boolean;
  errors: string[];
}

export function validatePricing(
  priceType: string,
  fixedPrice?: number | null,
  rateType?: string | null,
  rateAmount?: number | null
): PricingValidation {
  const errors: string[] = [];

  if (priceType === "fixed") {
    if (!fixedPrice || fixedPrice <= 0) {
      errors.push("Fixed price must be greater than 0");
    }
  } else if (priceType === "rate") {
    if (!rateType) {
      errors.push("Rate type is required for rate-based pricing");
    }
    if (!rateAmount || rateAmount <= 0) {
      errors.push("Rate amount must be greater than 0");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
