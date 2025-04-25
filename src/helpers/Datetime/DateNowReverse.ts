export function dateNowReverse(deliminator: string = "/") {
  const newDate = new Date();
  return (
    newDate.getFullYear() +
    deliminator +
    (newDate.getMonth() + 1 < 10 ? "0" : "") +
    (newDate.getMonth() + 1) +
    deliminator +
    (newDate.getDate() < 10 ? "0" : "") +
    newDate.getDate()
  );
}
