"use client";

import {
  createCurrencyRate,
  CurrencyRate,
  deleteCurrencyRate,
  fetchLatestCurrencyRates,
  listCurrencyRates,
  updateCurrencyRate,
} from "@/lib/apis/currencyRate";
import Checkbox from "@/components/form/input/Checkbox";
import { CURRENCY_CODES, getCurrencyByCode } from "@/lib/currencies";
import { formatDate } from "@/lib/formatDate";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type FormState = {
  id?: string;
  currencyCode: string;
  currencyName: string;
  rateToNgn: string;
  notes: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  currencyCode: "USD",
  currencyName: "US Dollar",
  rateToNgn: "",
  notes: "",
  isActive: true,
};

const formatNumber = (value?: number | string | null, maximumFractionDigits = 8) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(numeric);
};

const currencyDisplayNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "currency" })
    : null;

const getDisplayCurrencyName = (rate: CurrencyRate) => {
  const code = rate.currencyCode?.toUpperCase();
  const localCurrency = getCurrencyByCode(code);
  if (localCurrency?.code === code && localCurrency.name) return localCurrency.name;
  if (rate.currencyName && rate.currencyName !== code) return rate.currencyName;
  return currencyDisplayNames?.of(code) || rate.currencyName || code;
};

export default function CurrencyRatesPage() {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const activeCount = useMemo(
    () => rates.filter((rate) => rate.isActive).length,
    [rates]
  );
  const currencyOptions = useMemo(
    () =>
      CURRENCY_CODES.map((currency) => ({
        value: currency.code,
        label: `${currency.code} - ${currency.name}`,
      })),
    []
  );

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listCurrencyRates({
        q: search,
        limit: 100,
      });
      const list = response?.data?.list;
      setRates(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rates.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleCodeChange = (currencyCode: string) => {
    const currency = getCurrencyByCode(currencyCode);
    setForm((current) => ({
      ...current,
      currencyCode,
      currencyName: currency.name,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setError("");
  };

  const handleEdit = (rate: CurrencyRate) => {
    setForm({
      id: rate.id,
      currencyCode: rate.currencyCode,
      currencyName: rate.currencyName,
      rateToNgn: String(rate.rateToNgn ?? ""),
      notes: rate.notes || "",
      isActive: rate.isActive,
    });
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const payload = {
        currencyCode: form.currencyCode,
        currencyName: form.currencyName,
        rateToNgn: form.rateToNgn,
        source: "manual",
        notes: form.notes,
        isActive: form.isActive,
      };

      if (form.id) {
        await updateCurrencyRate(form.id, payload);
        setMessage("Rate updated successfully.");
      } else {
        await createCurrencyRate(payload);
        setMessage("Rate created successfully.");
      }

      resetForm();
      fetchRates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rate.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this currency rate?")) return;
    try {
      setError("");
      setMessage("");
      await deleteCurrencyRate(id);
      setMessage("Rate deleted successfully.");
      fetchRates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete rate.");
    }
  };

  const handleFetchLatest = async () => {
    try {
      setSyncing(true);
      setError("");
      setMessage("");
      const response = await fetchLatestCurrencyRates();
      const count = response?.data?.count ?? 0;
      setMessage(`Fetched and saved ${count} rates from open.er-api.com.`);
      fetchRates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch latest rates.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Stored rates</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {rates.length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active rates</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {activeCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Base currency</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            NGN
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Currency Rates
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Set how much NGN equals one unit of each currency.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFetchLatest}
            disabled={syncing}
            className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {syncing ? "Fetching..." : "Fetch latest rates"}
          </button>
        </div>

        {(error || message) && (
          <div
            className={`mb-4 rounded-md border px-4 py-3 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300"
                : "border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-900/20 dark:text-green-300"
            }`}
          >
            {error || message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:grid-cols-6"
        >
          <div className="md:col-span-2">
            <Label>Currency</Label>
            <Select
              options={currencyOptions}
              placeholder="Select currency"
              onChange={handleCodeChange}
              defaultValue={form.currencyCode}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Rate to NGN</Label>
            <Input
              type="number"
              min="0"
              step={0.00000001}
              value={form.rateToNgn}
              onChange={(event) =>
                setForm((current) => ({ ...current, rateToNgn: event.target.value }))
              }
              placeholder="e.g. 1500"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Status</Label>
            <div className="flex h-11 items-center rounded-lg border border-gray-300 bg-transparent px-4 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900">
              <Checkbox
                label="Active"
                checked={form.isActive}
                onChange={(checked) =>
                  setForm((current) => ({ ...current, isActive: checked }))
                }
              />
            </div>
          </div>
          <div className="md:col-span-4">
            <Label>Notes</Label>
            <Input
              type="text"
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </div>
          <div className="flex items-end gap-2 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="flex h-11 flex-1 items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : form.id ? "Update rate" : "Save rate"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search currency code or name"
            className="sm:max-w-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Source requires attribution when using open.er-api.com data.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Currency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  1 currency = NGN
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  1 NGN = currency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Last fetched
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading rates...
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No currency rates found.
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {rate.currencyCode}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {getDisplayCurrencyName(rate)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatNumber(rate.rateToNgn, 4)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatNumber(rate.ngnToCurrencyRate, 8)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {rate.source}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {rate.lastFetchedAt ? formatDate(rate.lastFetchedAt) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          rate.isActive
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {rate.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(rate)}
                          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rate.id)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-900/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
