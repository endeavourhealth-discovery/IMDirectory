export function toTitleCase(string: string) {
  return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

export default { toTitleCase };
