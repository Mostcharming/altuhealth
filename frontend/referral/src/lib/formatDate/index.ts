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
  try {
    return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}
