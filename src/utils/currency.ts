export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return '₹0';
  const intPart = Math.round(value);
  const sign = intPart < 0 ? '-' : '';
  const abs = Math.abs(intPart).toString();
  let lastThree = abs.slice(-3);
  const rest = abs.slice(0, -3);
  let formatted = lastThree;
  if (rest.length > 0) {
    formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return `${sign}₹${formatted}`;
}

export function formatTenureMonths(months: number): string {
  if (months % 12 === 0) {
    const years = months / 12;
    return `${months} months (${years} year${years > 1 ? 's' : ''})`;
  }
  return `${months} months`;
}