export function deferred(timeout?: number) {
  let resolve: any, reject: any;
  const promise = new Promise((res, rej) => {
    [resolve, reject] = [res, rej];
  });
  if (timeout) {
    setTimeout(() => {
      reject("Timedout");
    }, timeout);
  }
  return { promise, reject, resolve };
}

export default { deferred };
