"use client";

import {
  DEPENDENT_RELATIONSHIPS,
  DependentAgeLimits,
  DependentRelationship,
  MAX_DEPENDENT_AGE_LIMIT,
  MIN_DEPENDENT_AGE_LIMIT,
} from "@/lib/dependentAgeLimits";
import Input from "./input/InputField";
import Label from "./Label";

type DependentAgeLimitFieldsProps = {
  value: DependentAgeLimits;
  onChange: (value: DependentAgeLimits) => void;
  disabled?: boolean;
  className?: string;
};

export default function DependentAgeLimitFields({
  value,
  onChange,
  disabled = false,
  className = "",
}: DependentAgeLimitFieldsProps) {
  const updateLimit = (relationship: DependentRelationship, raw: string) => {
    if (raw === "") {
      onChange({ ...value, [relationship]: null });
      return;
    }

    const age = Number(raw);
    if (
      !Number.isInteger(age) ||
      age < MIN_DEPENDENT_AGE_LIMIT ||
      age > MAX_DEPENDENT_AGE_LIMIT
    ) {
      return;
    }

    onChange({ ...value, [relationship]: age });
  };

  return (
    <fieldset className={className} disabled={disabled}>
      <legend className="text-sm font-medium text-gray-700 dark:text-gray-400">
        Dependent age limits
      </legend>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Set the maximum eligible age for each relationship. Leave a field blank
        when no limit is configured.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {DEPENDENT_RELATIONSHIPS.map(({ key, label }) => (
          <div key={key}>
            <Label htmlFor={`dependent-age-limit-${key}`}>{label}</Label>
            <Input
              id={`dependent-age-limit-${key}`}
              name={`dependentAgeLimits.${key}`}
              type="number"
              min={String(MIN_DEPENDENT_AGE_LIMIT)}
              max={String(MAX_DEPENDENT_AGE_LIMIT)}
              step={1}
              value={value[key] ?? ""}
              onChange={(event) => updateLimit(key, event.target.value)}
              placeholder={`${label} maximum age`}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}
