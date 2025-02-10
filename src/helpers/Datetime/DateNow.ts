export function dateNow() {
  let newDate = new Date();
  return (
    (newDate.getDate() < 10 ? "0" : "") +
    newDate.getDate() +
    "/" +
    (newDate.getMonth() + 1 < 10 ? "0" : "") +
    (newDate.getMonth() + 1) +
    "/" +
    newDate.getFullYear()
  );
}
