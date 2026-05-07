export interface SentencePart {
  type: "text" | "field" | "parameter" | "nodeRef";
  value?: string;
}
