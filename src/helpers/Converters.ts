export function iriToUrl(iri: string) {
  return iri.replace(/\//gi, "%2F").replace(/#/gi, "%23");
}

export function urlToIri(url: string) {
  return url.replace(/%2F/gi, "/").replace(/%23/, "#").replace(/%3A/, ":");
}

export function enumToArray(enumToTransform: any): string[] {
  const result = Object.values(enumToTransform).filter(item => isNaN(Number(item)));
  return result.map(item => item as string);
}

export default {
  iriToUrl,
  urlToIri,
  enumToArray
};
