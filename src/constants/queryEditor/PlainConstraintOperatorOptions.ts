export const PlainConstraintOperatorOptions: { label: string; value: string; tooltip: string }[] = [
  {
    label: "concept only",
    value: "conceptOnly",
    tooltip: "This concept only, not including descendants"
  },
  {
    label: "+children",
    value: "descendantsOrSelfOf",
    tooltip: "This concept and all descendants"
  },
  {
    label: "children only",
    value: "descendantsOf",
    tooltip: "Descendants of this concept but not this concept"
  }
];
