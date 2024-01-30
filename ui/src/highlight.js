import { styleTags, tags } from "@lezer/highlight";

export const highlighting = styleTags({
  Entailment: tags.name,
  Code: tags.number,
  Term: tags.string
});
