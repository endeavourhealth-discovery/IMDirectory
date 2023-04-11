import ECLVisitor from "../antlr4/ecl/ECLVisitor";
import { isObjectHasKeys } from "../helpers/DataTypeCheckers";
import _ from "lodash";
import { IM, SNOMED } from "../vocabulary";

const showLogs = false;
function logItem(found, ctx) {
  if (showLogs) {
    console.log(found);
    console.log(ctx);
  }
}

export default class ECLBuilderVisitor extends ECLVisitor {
  constructor() {
    super();
  }

  visitEcl(ctx) {
    logItem("found ecl", ctx.getText());
    let query = { match: [] };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["expressionConstraint"])) {
            query.match.push(result.expressionConstraint);
          }
        }
      }
    }
    return query;
  }

  visitExpressionconstraint(ctx) {
    logItem("found expression constraint", ctx.getText());
    let query = { expressionConstraint: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["refinedExpressionConstraint"])) {
            const refinedExpressionConstraint = result.refinedExpressionConstraint;
            query.expressionConstraint = refinedExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["compoundExpressionConstraint"])) {
            const compoundExpressionConstraint = result.compoundExpressionConstraint;
            query.expressionConstraint = compoundExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["dottedExpressionConstraint"])) {
            const dottedExpressionConstraint = result.dottedExpressionConstraint;
            query.expressionConstraint = dottedExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            const subExpressionConstraint = result.subExpressionConstraint;
            query.expressionConstraint = subExpressionConstraint;
          }
        }
      }
    }
    return query;
  }

  visitRefinedexpressionconstraint(ctx) {
    logItem("found refined expression constraint", ctx.getText());
    let query = { refinedExpressionConstraint: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      for (const result of results) {
        if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
          const subExpressionConstraint = result.subExpressionConstraint;
          query.refinedExpressionConstraint = subExpressionConstraint;
        }
        if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"])) {
          const bracketCompoundExpressionConstraint = result.bracketCompoundExpressionConstraint;
          query.refinedExpressionConstraint = bracketCompoundExpressionConstraint;
        }
        if (isObjectHasKeys(result, ["eclRefinement"])) {
          const eclRefinement = result.eclRefinement;
          query.refinedExpressionConstraint.where = [];
          query.refinedExpressionConstraint.where.push(eclRefinement);
        }
      }
    }
    return query;
  }

  visitCompoundexpressionconstraint(ctx) {
    logItem("found compound expression constraint", ctx.getText());
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["conjunctionExpressionConstraint"])) return { compoundExpressionConstraint: result.conjunctionExpressionConstraint };
      if (isObjectHasKeys(result, ["disjunctionExpressionConstraint"])) return { compoundExpressionConstraint: result.disjunctionExpressionConstraint };
      if (isObjectHasKeys(result, ["exclusionExpressionConstraint"])) return { compoundExpressionConstraint: result.exclusionExpressionConstraint };
    }
  }

  visitConjunctionexpressionconstraint(ctx) {
    logItem("found conjunction expression constraint", ctx.getText());
    let query = { conjunctionExpressionConstraint: { match: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) query.conjunctionExpressionConstraint.boolMatch = result.conjunction;
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) query.conjunctionExpressionConstraint.match.push(result.subExpressionConstraint);
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"]))
            query.conjunctionExpressionConstraint.match.push(result.bracketCompoundExpressionConstraint);
        }
      }
    }
    return query;
  }

  visitDisjunctionexpressionconstraint(ctx) {
    logItem("found disjunction expression constraint", ctx.getText());
    let query = { disjunctionExpressionConstraint: { match: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["disjunction"])) query.disjunctionExpressionConstraint.boolMatch = result.disjunction;
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) query.disjunctionExpressionConstraint.match.push(result.subExpressionConstraint);
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"]))
            query.disjunctionExpressionConstraint.match.push(result.bracketCompoundExpressionConstraint.match);
        }
      }
    }
    return query;
  }

  visitExclusionexpressionconstraint(ctx) {
    logItem("found exclusion expression constraint", ctx.getText());
    let query = { exclusionExpressionConstraint: { boolMatch: "and", match: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        let first = true;
        for (const result of results) {
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            if (first) {
              query.exclusionExpressionConstraint.match.push(result.subExpressionConstraint);
              first = false;
            } else {
              query.exclusionExpressionConstraint.match.push({ exclude: true, match: [result.subExpressionConstraint] });
            }
          }
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"])) {
            if (first) {
              query.exclusionExpressionConstraint.match.push(result.bracketCompoundExpressionConstraint);
              first = false;
            } else {
              if (result.bracketCompoundExpressionConstraint.boolMatch) {
                query.exclusionExpressionConstraint.match.push({
                  exclude: true,
                  boolMatch: result.bracketCompoundExpressionConstraint.boolMatch,
                  match: result.bracketCompoundExpressionConstraint.match
                });
              } else {
                query.exclusionExpressionConstraint.match.push({ exclude: true, match: [result.bracketCompoundExpressionConstraint] });
              }
            }
          }
        }
      }
    }
    return query;
  }

  visitDottedexpressionconstraint(ctx) {
    logItem("found dotted expression constraint", ctx.getText());
    this.visitChildren(ctx);
  }

  visitDottedexpressionattribute(ctx) {
    logItem("found dotted expression attribute", ctx.getText());
    this.visitChildren(ctx);
  }

  visitSubexpressionconstraint(ctx) {
    logItem("found sub expression constraint", ctx.getText());
    let query = { subExpressionConstraint: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["constraintOperator"])) query.subExpressionConstraint[result.constraintOperator] = true;
          if (isObjectHasKeys(result, ["eclFocusConcept"])) {
            if (result.eclFocusConcept !== "*") query.subExpressionConstraint["@id"] = result.eclFocusConcept;
          }
        }
      }
    }
    return query;
  }

  visitBracketcompoundexpressionconstraint(ctx) {
    logItem("found bracket compound expression constraint", ctx.getText());
    let query = { bracketCompoundExpressionConstraint: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["refinedExpressionConstraint"])) {
            const refinedExpressionConstraint = result.refinedExpressionConstraint;
            query.bracketCompoundExpressionConstraint = refinedExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["compoundExpressionConstraint"])) {
            const compoundExpressionConstraint = result.compoundExpressionConstraint;
            query.bracketCompoundExpressionConstraint = compoundExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            const subExpressionConstraint = result.subExpressionConstraint;
            query.bracketCompoundExpressionConstraint = subExpressionConstraint;
          }
        }
      }
    }
    return query;
  }

  visitConstraintoperator(ctx) {
    logItem("found constraintOperator", ctx.getText());
    if (ctx.children) return { constraintOperator: this.visitChildren(ctx)[0] };
  }

  visitDescendantof(ctx) {
    logItem("found descendantOf", ctx.getText());
    return "descendantsOf";
  }

  visitDescendantorselfof(ctx) {
    logItem("found descendantOrSelfOf", ctx.getText());
    return "descendantsOrSelfOf";
  }

  visitAncestorof(ctx) {
    logItem("found ancestorOf", ctx.getText());
    return "ancestorsOf";
  }

  visitAncestororselfof(ctx) {
    logItem("found ancestorOrSelfOf", ctx.getText());
    throw new Error("AncestorOrSelfOf '>>' is not currently supported");
  }

  visitChildof(ctx) {
    logItem("found childOf", ctx.getText());
    throw new Error("ChildOf '<!' is not currently supported");
  }

  visitParentof(ctx) {
    logItem("found parentOf", ctx.getText());
    throw new Error("ParentOf '>!' is not currently supported");
  }

  visitEclfocusconcept(ctx) {
    logItem("found ecl focus concept", ctx.getText());
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["eclConceptReference"])) return { eclFocusConcept: result.eclConceptReference };
      if (isObjectHasKeys(result, ["wildcard"])) return { eclFocusConcept: result.wildcard };
    }
  }

  visitEclconceptreference(ctx) {
    logItem("found ecl concept reference", ctx.getText());
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      return { eclConceptReference: result };
    }
  }

  visitConceptid(ctx) {
    logItem("found concept id", ctx.getText());
    const code = ctx.getText();
    let iri = code;
    if (code.match(/^\d+$/)) {
      if (code.match(/1000252/g)) iri = IM.NAMESPACE + code;
      else iri = SNOMED.NAMESPACE + code;
    }
    return iri;
  }

  visitWildcard(ctx) {
    logItem("found wildcard", ctx.getText());
    return { wildcard: ctx.getText() };
  }

  visitEclrefinement(ctx) {
    logItem("found ecl refinement", ctx.getText());
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["subRefinement"])) return { eclRefinement: result.subRefinement };
      if (isObjectHasKeys(result, ["compoundRefinementSet"])) return { eclRefinement: result.compoundRefinementSet };
    }
  }

  visitCompoundrefinementset(ctx) {
    logItem("found compound refinement set", ctx.getText());
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["conjunctionRefinementSet"])) return { compoundRefinementSet: result.conjunctionRefinementSet };
      if (isObjectHasKeys(result, ["disjunctionRefinementSet"])) return { disjunctionRefinementSet: result.disjunctionRefinementSet };
    }
  }

  visitConjunctionrefinementset(ctx) {
    logItem("found conjunction refinement set", ctx.getText());
    let query = { conjunctionRefinementSet: { where: [] } };
    const results = this.visitChildren(ctx);
    if (results) {
      for (const result of results) {
        if (isObjectHasKeys(result, ["subRefinement"])) {
          const subRefinement = result.subRefinement;
          query.conjunctionRefinementSet.where.push(subRefinement);
        }
        if (isObjectHasKeys(result, ["bracketCompoundRefinementSet"])) {
          const bracketCompoundRefinementSet = result.bracketCompoundRefinementSet;
          query.conjunctionRefinementSet.where.push(bracketCompoundRefinementSet.where);
        }
        if (isObjectHasKeys(result, ["conjunction"])) {
          const conjunction = result.conjunction;
          query.conjunctionRefinementSet.bool = conjunction;
        }
      }
    }
    return query;
  }

  visitDisjunctionrefinementset(ctx) {
    logItem("found disjunction refinement set", ctx.getText());
    let query = { disjunctionRefinementSet: { where: [] } };
    const results = this.visitChildren(ctx);
    if (results) {
      for (const result of results) {
        if (isObjectHasKeys(result, ["subRefinement"])) {
          const subRefinement = result.subRefinement;
          query.disjunctionRefinementSet.where.push(subRefinement);
        }
        if (isObjectHasKeys(result, ["bracketCompoundRefinementSet"])) {
          const bracketCompoundRefinementSet = result.bracketCompoundRefinementSet;
          query.disjunctionRefinementSet.where.push(bracketCompoundRefinementSet.where);
        }
        if (isObjectHasKeys(result, ["disjunction"])) {
          const disjunction = result.disjunction;
          query.disjunctionRefinementSet.bool = disjunction;
        }
      }
    }
    return query;
  }

  visitConjunction(ctx) {
    logItem("found conjunction", ctx.getText());
    return { conjunction: "and" };
  }

  visitDisjunction(ctx) {
    logItem("found disjunction", ctx.getText());
    return { disjunction: "or" };
  }

  visitExclusion(ctx) {
    logItem("found exclusion", ctx.getText());
    return { exclusion: "not" };
  }

  visitSubrefinement(ctx) {
    logItem("found sub refinement", ctx.getText());
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["compoundAttributeSet"])) return { subRefinement: result.compoundAttributeSet };
      if (isObjectHasKeys(result, ["eclAttributeGroup"])) return { subRefinement: result.eclAttributeGroup };
      if (isObjectHasKeys(result, ["bracketSubRefinement"])) return { subRefinement: result.bracketSubRefinement };
      if (isObjectHasKeys(result, ["eclAttribute"])) {
        if (!result.eclAttribute.bool) result.eclAttribute.anyRoleGroup = true;
        return { subRefinement: result.eclAttribute };
      }
    }
  }

  visitDot(ctx) {
    logItem("found dot", ctx.getText());
    throw new Error("Dot '.' is not currently supported.");
  }

  visitMemberof(ctx) {
    logItem("found memberOf", ctx.getText());
    throw new Error("member of '^' is not currently supported.");
  }

  visitCardinality(ctx) {
    logItem("found cardinality", ctx.getText());
    throw new Error("Cardinality is not currently supported");
  }

  visitEclattributegroup(ctx) {
    logItem("found ecl attribute group", ctx.getText());
    let query = { eclAttributeGroup: { where: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["compoundAttributeSet"])) {
            result.compoundAttributeSet.where.forEach(item => delete item.anyRoleGroup);
            query.eclAttributeGroup = result.compoundAttributeSet;
            query.eclAttributeGroup["@id"] = IM.ROLE_GROUP;
          }
          if (isObjectHasKeys(result, ["eclAttribute"])) query.eclAttributeGroup = { "@id": IM.ROLE_GROUP, where: [result.eclAttribute] };
        }
      }
    }
    return query;
  }

  visitCompoundattributeset(ctx) {
    logItem("found compound attribute set", ctx.getText());
    const result = this.visitChildren(ctx)[0];
    if (isObjectHasKeys(result, ["conjunctionAttributeSet"])) {
      if (result.conjunctionAttributeSet.where)
        result.conjunctionAttributeSet.where.forEach(item => {
          if (!item.bool) item.anyRoleGroup = true;
        });
      return { compoundAttributeSet: result.conjunctionAttributeSet };
    }
    if (isObjectHasKeys(result, ["disjunctionAttributeSet"])) {
      if (result.disjunctionAttributeSet.where)
        result.disjunctionAttributeSet.where.forEach(item => {
          if (!item.bool) item.anyRoleGroup = true;
        });
      return { compoundAttributeSet: result.disjunctionAttributeSet };
    }
  }

  visitConjunctionattributeset(ctx) {
    logItem("found conjunction attribute set", ctx.getText());
    let query = { conjunctionAttributeSet: { where: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["subAttributeSet"])) {
            const subAttributeSet = result.subAttributeSet;
            query.conjunctionAttributeSet.where.push(subAttributeSet);
          }
          if (isObjectHasKeys(result, ["bracketAttributeSet"])) {
            const bracketAttributeSet = result.bracketAttributeSet;
            query.conjunctionAttributeSet.where.push(bracketAttributeSet.where);
          }
          if (isObjectHasKeys(result, ["conjunction"])) {
            const conjunction = result.conjunction;
            query.conjunctionAttributeSet.bool = conjunction;
          }
        }
      }
    }
    return query;
  }

  visitDisjunctionattributeset(ctx) {
    logItem("found disjunction attribute set", ctx.getText());
    let query = { disjunctionAttributeSet: { where: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["subAttributeSet"])) {
            const subAttributeSet = result.subAttributeSet;
            query.disjunctionAttributeSet.where.push(subAttributeSet);
          }
          if (isObjectHasKeys(result, ["bracketAttributeSet"])) {
            const bracketAttributeSet = result.bracketAttributeSet;
            query.disjunctionAttributeSet.where.push(bracketAttributeSet.where);
          }
          if (isObjectHasKeys(result, ["disjunction"])) {
            const disjunction = result.disjunction;
            query.disjunctionAttributeSet.bool = disjunction;
          }
        }
      }
    }
    return query;
  }

  visitBracketattributeset(ctx) {
    logItem("found bracket attribute set", ctx.getText());
    let query = { bracketAttributeSet: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["compoundAttributeSet"])) {
            query.bracketAttributeSet = result.compoundAttributeSet;
          }
        }
      }
    }
    return query;
  }

  visitSubattributeset(ctx) {
    logItem("found sub attribute set", ctx.getText());
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["eclAttribute"])) return { subAttributeSet: result.eclAttribute };
      if (isObjectHasKeys(result, ["bracketAttributeSet"])) return { subAttributeSet: result.bracketAttributeSet };
    }
  }

  visitEclattribute(ctx) {
    logItem("found ecl attribute", ctx.getText());
    let query = { eclAttribute: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            const subExpressionConstraint = result.subExpressionConstraint;
            query.eclAttribute["@id"] = subExpressionConstraint["@id"];
            if (isObjectHasKeys(subExpressionConstraint, ["descendantOf"])) query.eclAttribute.descendantsOf = subExpressionConstraint.descendantsOf;
            if (isObjectHasKeys(subExpressionConstraint, ["descendantsOrSelfOf"]))
              query.eclAttribute.descendantsOrSelfOf = subExpressionConstraint.descendantsOrSelfOf;
          }
          if (isObjectHasKeys(result, ["eclAttributeExpressionValue"])) {
            const eclAttributeExpressionValue = result.eclAttributeExpressionValue;
            if (eclAttributeExpressionValue.in) query.eclAttribute.in = eclAttributeExpressionValue.in;
            if (eclAttributeExpressionValue.notIn) query.eclAttribute.notIn = eclAttributeExpressionValue.notIn;
          }
          if (isObjectHasKeys(result, ["eclAttributeNumberValue"])) {
            const eclAttributeNumberValue = result.eclAttributeNumberValue;
            if (eclAttributeNumberValue.in) query.eclAttribute.in = eclAttributeNumberValue.in;
            if (eclAttributeNumberValue.notIn) query.eclAttribute.notIn = eclAttributeNumberValue.notIn;
          }
          if (isObjectHasKeys(result, ["eclattributestringvalue"])) {
            const eclattributestringvalue = result.eclattributestringvalue;
            if (eclattributestringvalue.in) query.eclAttribute.in = eclattributestringvalue.value.in;
            if (eclattributestringvalue.notIn) query.eclAttribute.notIn = eclattributestringvalue.notIn;
          }
        }
      }
    }
    return query;
  }

  visitEclattributeexpressionvalue(ctx) {
    logItem("found ecl attribute expression value", ctx.getText());
    let query = { eclAttributeExpressionValue: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["expressionComparisonOperator"])) {
            const expressionComparisonOperator = result.expressionComparisonOperator;
            if (expressionComparisonOperator === "=") query.eclAttributeExpressionValue.in = [];
            else if (expressionComparisonOperator === "!=") query.eclAttributeExpressionValue.notIn = [];
            else throw new Error(`attribute value operator: '${expressionComparisonOperator}' is not currently supported`);
          }
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            const subExpressionConstraint = result.subExpressionConstraint;
            if (query.eclAttributeExpressionValue.in && _.isArray(query.eclAttributeExpressionValue.in))
              query.eclAttributeExpressionValue.in.push(subExpressionConstraint);
            if (query.eclAttributeExpressionValue.notIn && _.isArray(query.eclAttributeExpressionValue.notIn))
              query.eclAttributeExpressionValue.notIn.push(subExpressionConstraint);
          }
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"])) {
            const bracketCompoundExpressionConstraint = result.bracketCompoundExpressionConstraint;
            if (query.eclAttributeExpressionValue.in && _.isArray(query.eclAttributeExpressionValue.in))
              query.eclAttributeExpressionValue.in.push(bracketCompoundExpressionConstraint);
            if (query.eclAttributeExpressionValue.notIn && _.isArray(query.eclAttributeExpressionValue.notIn))
              query.eclAttributeExpressionValue.notIn.push(bracketCompoundExpressionConstraint);
          }
        }
      }
    }
    return query;
  }

  visitEclattributestringvalue(ctx) {
    logItem("found ecl attribute string value", ctx.getText());
    let query = { eclAttributeStringValue: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["stringComparisonOperator"])) {
            const stringComparisonOperator = result.stringComparisonOperator;
            if (stringComparisonOperator === "=") query.eclAttributeStringValue.in = [];
            else if (stringComparisonOperator === "!=") query.eclAttributeStringValue.notIn = [];
            else throw new Error(`attribute value operator: '${stringComparisonOperator}' is not currently supported`);
          }
          if (isObjectHasKeys(result, ["stringValue"])) {
            const stringValue = result.stringValue;
            if (query.eclAttributeStringValue.in && _.isArray(query.eclAttributeStringValue.in))
              query.eclAttributeStringValue.in.push({ variable: stringValue });
            if (query.eclAttributeStringValue.notIn && _.isArray(query.eclAttributeStringValue.notIn))
              query.eclAttributeStringValue.notIn.push({ variable: stringValue });
          }
        }
      }
    }
    return query;
  }

  visitEclattributenumbervalue(ctx) {
    logItem("found ecl attribute number value", ctx.getText());
    let query = { eclAttributeNumberValue: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["numericComparisonOperator"])) {
            const numericComparisonOperator = result.numericComparisonOperator;
            if (numericComparisonOperator === "=") query.eclAttributeNumberValue.in = [];
            else if (numericComparisonOperator === "!=") query.eclAttributeNumberValue.notIn = [];
            else throw new Error(`attribute value operator: '${numericComparisonOperator}' is not currently supported`);
          }
          if (isObjectHasKeys(result, ["numericValue"])) {
            const numericValue = result.numericValue;
            if (query.eclAttributeNumberValue.in && _.isArray(query.eclAttributeNumberValue.in)) query.eclAttributeNumberValue.in.push({ value: numericValue });
            if (query.eclAttributeNumberValue.notIn && _.isArray(query.eclAttributeNumberValue.notIn))
              query.eclAttributeNumberValue.notIn.push({ variable: numericValue });
          }
        }
      }
    }
    return query;
  }

  visitMany(ctx) {
    logItem("found many", ctx.getText());
    throw new Error("Many is not currently supported");
  }

  visitReverseflag(ctx) {
    logItem("found reverse", ctx.getText());
    throw new Error("Reverse is not currently supported");
  }

  visitExpressioncomparisonoperator(ctx) {
    logItem("found expression comparison operator", ctx.getText());
    if (ctx.getText().match(/^[nN][oO][tT]/)) return { expressionComparisonOperator: "!=" };
    return { expressionComparisonOperator: ctx.getText() };
  }

  visitStringcomparisonoperator(ctx) {
    logItem("found string comparison operator", ctx.getText());
    if (ctx.getText().match(/^[nN][oO][tT]/)) return { stringComparisonOperator: "!=" };
    return { stringComparisonOperator: ctx.getText() };
  }

  visitStringvalue(ctx) {
    logItem("found string value", ctx.getText());
    return { stringValue: ctx.getText() };
  }

  visitNumericcomparisonoperator(ctx) {
    logItem("found numeric comparison operator", ctx.getText());
    if (ctx.getText().match(/^[nN][oO][tT]/)) return { numericComparisonOperator: "!=" };
    return { numericComparisonOperator: ctx.getText() };
  }

  visitNumericvalue(ctx) {
    logItem("found numeric value", ctx.getText());
    return { numericValue: ctx.getText() };
  }

  visitBracketsubrefinement(ctx) {
    logItem("found bracket sub refinement", ctx.getText());
    const query = { bracketSubRefinement: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      for (const result of results) {
        if (isObjectHasKeys(result, ["eclRefinement"])) query.bracketSubRefinement = result.eclRefinement;
      }
    }
    return query;
  }
  process;
}
