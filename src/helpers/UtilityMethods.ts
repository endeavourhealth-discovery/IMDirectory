export function debounce(fn: (...params: unknown[]) => void, ms = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: unknown[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function getDisplayFromDate(now: Date, date: Date) {
  if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) return "today";
  const msInDay = 24 * 60 * 60 * 1000;
  const diff = Math.round(Math.abs(Number(now) - Number(date)) / msInDay);
  if (diff === 1) return "yesterday";
  if (diff < 7) return "this week";
  if (date.getMonth() === now.getMonth()) return "this month";
  if (date.getFullYear() === now.getFullYear()) return "this year";
  else return "";
}
export function flattenArray(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      result[key] = value[0];
    } else {
      result[key] = value;
    }
  }

  return result;
}
export default {
  flattenArray,
  debounce,
  getDisplayFromDate
};
