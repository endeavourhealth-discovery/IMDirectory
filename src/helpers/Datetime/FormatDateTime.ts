export function formatDateTime(date: string | Date) {
  const dateObject = new Date(date);
  return formatDate(dateObject) + " " + formatTime(dateObject);
}

export function formatDate(date: Date) {
  return (date.getDate() < 10 ? "0" : "") + date.getDate() + "/" + (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1) + "/" + date.getFullYear();
}

export function formatTime(date: Date) {
  return (
    (date.getHours() < 10 ? "0" : "") +
    date.getHours() +
    ":" +
    (date.getMinutes() < 10 ? "0" : "") +
    date.getMinutes() +
    ":" +
    (date.getSeconds() < 10 ? "0" : "") +
    date.getSeconds()
  );
}
