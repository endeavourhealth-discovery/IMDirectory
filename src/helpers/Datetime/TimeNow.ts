export function timeNow() {
  const newDate = new Date();
  return (
    (newDate.getHours() < 10 ? "0" : "") +
    newDate.getHours() +
    ":" +
    (newDate.getMinutes() < 10 ? "0" : "") +
    newDate.getMinutes() +
    ":" +
    (newDate.getSeconds() < 10 ? "0" : "") +
    newDate.getSeconds()
  );
}
