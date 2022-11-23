export function iriToUrl(iri: string) {
  return iri.replace(/\//gi, "%2F").replace(/#/gi, "%23");
}

export function urlToIri(url: string) {
  return url.replace(/%2F/gi, "/").replace(/%23/, "#").replace(/%3A/, ":");
}

export default {
  iriToUrl,
  urlToIri
};
