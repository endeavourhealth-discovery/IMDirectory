export const ConstraintOperatorMap: { descendantsOrSelfOf: string; descendantsOf: string; memberOf: string; conceptOnly: string } = {
  descendantsOrSelfOf: "+ children",
  descendantsOf: "children only",
  memberOf: "member of",
  conceptOnly: "concept only"
};

export type ConstraintOperatorKey = keyof typeof ConstraintOperatorMap;
