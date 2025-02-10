export function dateNowReverse(deliminator: string = "/") {
  let newDate = new Date();
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
