export function deferred() {
  let resolve: any, reject: any;
  const promise = new Promise((res, rej) => {
    [resolve, reject] = [res, rej];
  });
  return { promise, reject, resolve };
}

export default { deferred };
