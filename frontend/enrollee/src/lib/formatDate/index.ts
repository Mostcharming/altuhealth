export function formatDate(
  dateString: string,
  locale: string = "en-US"
): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrice(price: number, currency: string = "NGN"): string {
  // Locale mapping for currencies
  const localeMap: Record<string, string> = {
    NGN: "en-NG",
    USD: "en-US",
    EUR: "en-IE",
    GBP: "en-GB",
    JPY: "ja-JP",
    AUD: "en-AU",
    CAD: "en-CA",
    CHF: "de-CH",
    CNY: "zh-CN",
    SEK: "sv-SE",
    NZD: "en-NZ",
    MXN: "es-MX",
    SGD: "en-SG",
    HKD: "zh-HK",
    NOK: "no-NO",
    KRW: "ko-KR",
    TRY: "tr-TR",
    RUB: "ru-RU",
    INR: "en-IN",
    BRL: "pt-BR",
    ZAR: "en-ZA",
    AED: "ar-AE",
    SAR: "ar-SA",
    KES: "en-KE",
    GHS: "en-GH",
    EGP: "ar-EG",
    PKR: "en-PK",
    THB: "th-TH",
    MYR: "ms-MY",
    PHP: "fil-PH",
    IDR: "id-ID",
    VND: "vi-VN",
    TWD: "zh-TW",
    PLN: "pl-PL",
    CZK: "cs-CZ",
    HUF: "hu-HU",
    RON: "ro-RO",
    BGN: "bg-BG",
    HRK: "hr-HR",
    ISK: "is-IS",
    DKK: "da-DK",
  };

  const locale = localeMap[currency] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(price);
}
