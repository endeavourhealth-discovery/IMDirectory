export function timeNow12Hr() {
  let newDate = new Date();
  return (
    (newDate.getHours() < 10 ? "0" : "") +
    (newDate.getHours() > 12 ? (newDate.getHours() - 12 > 9 ? newDate.getHours() - 12 : "0" + (newDate.getHours() - 12)) : newDate.getHours()) +
    ":" +
    (newDate.getMinutes() < 10 ? "0" : "") +
    newDate.getMinutes() +
    ":" +
    (newDate.getSeconds() < 10 ? "0" : "") +
    newDate.getSeconds() +
    (newDate.getHours() > 12 ? "PM" : "AM")
  );
}
