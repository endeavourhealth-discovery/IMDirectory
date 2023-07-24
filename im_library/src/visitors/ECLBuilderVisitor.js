import ECLVisitor from "../antlr4/ecl/ECLVisitor";
import { isObjectHasKeys } from "../helpers/DataTypeCheckers";
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
    let build = { type: "BoolGroup", conjunction: "AND" };
    if (ctx.children) {
      build.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["expressionConstraint"])) {
            const expressionConstraint = result.expressionConstraint;
            if (expressionConstraint && isObjectHasKeys(expressionConstraint, ["type"]) && expressionConstraint.type === "BoolGroup")
              build = expressionConstraint;
            else if (isObjectHasKeys(expressionConstraint)) build.items.push(expressionConstraint);
          }
        }
      }
    }
    return build;
  }

  visitExpressionconstraint(ctx) {
    logItem("found expression constraint", ctx.getText());
    let build = { expressionConstraint: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["refinedExpressionConstraint"])) {
            const refinedExpressionConstraint = result.refinedExpressionConstraint;
            if (!isObjectHasKeys(refinedExpressionConstraint, ["items"])) refinedExpressionConstraint.items = [];
            if (!isObjectHasKeys(refinedExpressionConstraint, ["conjunction"])) refinedExpressionConstraint.conjunction = "AND";
            if (!isObjectHasKeys(refinedExpressionConstraint, ["descendants"])) refinedExpressionConstraint.descendants = "";
            build.expressionConstraint = refinedExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["compoundExpressionConstraint"])) {
            const compoundExpressionConstraint = result.compoundExpressionConstraint;
            build.expressionConstraint = compoundExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["dottedExpressionConstraint"])) {
            const dottedExpressionConstraint = result.dottedExpressionConstraint;
            build.expressionConstraint = dottedExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            const subExpressionConstraint = result.subExpressionConstraint;
            if (!isObjectHasKeys(subExpressionConstraint, ["items"])) subExpressionConstraint.items = [];
            if (!isObjectHasKeys(subExpressionConstraint, ["conjunction"])) subExpressionConstraint.conjunction = "AND";
            if (!isObjectHasKeys(subExpressionConstraint, ["descendants"])) subExpressionConstraint.descendants = "";
            build.expressionConstraint = subExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"])) {
            const bracketCompoundExpressionConstraint = result.bracketCompoundExpressionConstraint;
            build.expressionConstraint = bracketCompoundExpressionConstraint;
          }
        }
      }
    }
    return build;
  }

  visitRefinedexpressionconstraint(ctx) {
    logItem("found refined expression constraint", ctx.getText());
    let build = { refinedExpressionConstraint: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      for (const result of results) {
        if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
          const subExpressionConstraint = result.subExpressionConstraint;
          build.refinedExpressionConstraint = subExpressionConstraint;
        }
        if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"])) {
          const bracketCompoundExpressionConstraint = result.bracketCompoundExpressionConstraint;
          build.refinedExpressionConstraint.concept = bracketCompoundExpressionConstraint;
          build.refinedExpressionConstraint.descendants = "";
          build.refinedExpressionConstraint.conjunction = "AND";
          build.refinedExpressionConstraint.type = "Concept";
        }
        if (isObjectHasKeys(result, ["eclRefinement"])) {
          const eclRefinement = result.eclRefinement;
          if (eclRefinement.type === "BoolGroup") {
            build.refinedExpressionConstraint.items = [eclRefinement];
          }
          if (eclRefinement.type === "Refinement") build.refinedExpressionConstraint.items = [eclRefinement];
          if (!eclRefinement.type) {
            build.refinedExpressionConstraint.conjunction = eclRefinement.conjunction;
            build.refinedExpressionConstraint.items = eclRefinement.items;
          }
        }
      }
    }
    return build;
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
    let build = { conjunctionExpressionConstraint: { type: "BoolGroup" } };
    if (ctx.children) {
      build.conjunctionExpressionConstraint.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) build.conjunctionExpressionConstraint.conjunction = result.conjunction;
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) build.conjunctionExpressionConstraint.items.push(result.subExpressionConstraint);
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"]))
            build.conjunctionExpressionConstraint.items.push(result.bracketCompoundExpressionConstraint);
        }
      }
    }
    return build;
  }

  visitDisjunctionexpressionconstraint(ctx) {
    logItem("found disjunction expression constraint", ctx.getText());
    let build = { disjunctionExpressionConstraint: { type: "BoolGroup" } };
    if (ctx.children) {
      build.disjunctionExpressionConstraint.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["disjunction"])) build.disjunctionExpressionConstraint.conjunction = result.disjunction;
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) build.disjunctionExpressionConstraint.items.push(result.subExpressionConstraint);
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"]))
            build.disjunctionExpressionConstraint.items.push(result.bracketCompoundExpressionConstraint);
        }
      }
    }
    return build;
  }

  visitExclusionexpressionconstraint(ctx) {
    logItem("found exclusion expression constraint", ctx.getText());
    let build = { exclusionExpressionConstraint: { type: "BoolGroup", conjunction: "AND" } };
    if (ctx.children) {
      build.exclusionExpressionConstraint.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        let first = true;
        for (const result of results) {
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            if (first) {
              build.exclusionExpressionConstraint.items.push(result.subExpressionConstraint);
              first = false;
            } else {
              result.subExpressionConstraint.exclude = true;
              build.exclusionExpressionConstraint.items.push(result.subExpressionConstraint);
            }
          }
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"]))
            if (first) {
              build.exclusionExpressionConstraint.items.push(result.bracketCompoundExpressionConstraint);
              first = false;
            } else {
              result.bracketCompoundExpressionConstraint.exclude = true;
              build.exclusionExpressionConstraint.items.push(result.bracketCompoundExpressionConstraint);
            }
        }
      }
    }
    return build;
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
    let build = { subExpressionConstraint: { type: "Concept" } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["constraintOperator"]))
            build.subExpressionConstraint.descendants = result.constraintOperator ? result.constraintOperator : "";
          if (isObjectHasKeys(result, ["eclFocusConcept"])) {
            build.subExpressionConstraint.concept = {};
            build.subExpressionConstraint.concept.iri = result.eclFocusConcept;
          }
        }
      }
    }
    return build;
  }

  visitBracketcompoundexpressionconstraint(ctx) {
    logItem("found bracket compound expression constraint", ctx.getText());
    let build = { bracketCompoundExpressionConstraint: { type: "BoolGroup", items: [], conjunction: "AND" } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["refinedExpressionConstraint"])) {
            const refinedExpressionConstraint = result.refinedExpressionConstraint;
            build.bracketCompoundExpressionConstraint.items.push(refinedExpressionConstraint);
          }
          if (isObjectHasKeys(result, ["compoundExpressionConstraint"])) {
            const compoundExpressionConstraint = result.compoundExpressionConstraint;
            build.bracketCompoundExpressionConstraint = compoundExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            const subExpressionConstraint = result.subExpressionConstraint;
            build.bracketCompoundExpressionConstraint.items.push(subExpressionConstraint);
          }
        }
      }
    }
    return build;
  }

  visitConstraintoperator(ctx) {
    logItem("found constraintOperator", ctx.getText());
    if (ctx.children) return { constraintOperator: this.visitChildren(ctx)[0] };
  }

  visitDescendantof(ctx) {
    logItem("found descendantOf", ctx.getText());
    return "<";
  }

  visitDescendantorselfof(ctx) {
    logItem("found descendantOrSelfOf", ctx.getText());
    return "<<";
  }

  visitAncestorof(ctx) {
    logItem("found ancestorOf", ctx.getText());
    return ">";
  }

  visitAncestororselfof(ctx) {
    logItem("found ancestorOrSelfOf", ctx.getText());
    return ">>";
  }

  visitChildof(ctx) {
    logItem("found childOf", ctx.getText());
    return "<!";
  }

  visitParentof(ctx) {
    logItem("found parentOf", ctx.getText());
    return ">!";
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
    let build = { conjunctionRefinementSet: { items: [] } };
    const results = this.visitChildren(ctx);
    if (results) {
      for (const result of results) {
        if (isObjectHasKeys(result, ["subRefinement"])) {
          const subRefinement = result.subRefinement;
          build.conjunctionRefinementSet.items.push(subRefinement);
        }
        if (isObjectHasKeys(result, ["bracketCompoundRefinementSet"])) {
          const bracketCompoundRefinementSet = result.bracketCompoundRefinementSet;
          build.conjunctionRefinementSet.items.push(bracketCompoundRefinementSet);
          build.conjunctionRefinementSet.type = "BoolGroup";
        }
        if (isObjectHasKeys(result, ["conjunction"])) {
          const conjunction = result.conjunction;
          build.conjunctionRefinementSet.conjunction = conjunction;
        }
      }
    }
    return build;
  }

  visitDisjunctionrefinementset(ctx) {
    logItem("found disjunction refinement set", ctx.getText());
    let build = { disjunctionRefinementSet: { items: [] } };
    const results = this.visitChildren(ctx);
    if (results) {
      for (const result of results) {
        if (isObjectHasKeys(result, ["subRefinement"])) {
          const subRefinement = result.subRefinement;
          build.disjunctionRefinementSet.items.push(subRefinement);
        }
        if (isObjectHasKeys(result, ["bracketCompoundRefinementSet"])) {
          const bracketCompoundRefinementSet = result.bracketCompoundRefinementSet;
          build.disjunctionRefinementSet.items.push(bracketCompoundRefinementSet);
          build.disjunctionRefinementSet.type = "BoolGroup";
        }
        if (isObjectHasKeys(result, ["disjunction"])) {
          const disjunction = result.disjunction;
          build.disjunctionRefinementSet.conjunction = disjunction;
        }
      }
    }
    return build;
  }

  visitConjunction(ctx) {
    logItem("found conjunction", ctx.getText());
    return { conjunction: "AND" };
  }

  visitDisjunction(ctx) {
    logItem("found disjunction", ctx.getText());
    return { disjunction: "OR" };
  }

  visitExclusion(ctx) {
    logItem("found exclusion", ctx.getText());
    return { exclusion: "MINUS" };
  }

  visitSubrefinement(ctx) {
    logItem("found sub refinement", ctx.getText());
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["compoundAttributeSet"])) return { subRefinement: result.compoundAttributeSet };
      if (isObjectHasKeys(result, ["eclAttributeGroup"])) return { subRefinement: result.eclAttributeGroup };
      if (isObjectHasKeys(result, ["bracketSubRefinement"])) return { subRefinement: result.bracketSubRefinement };
      if (isObjectHasKeys(result, ["eclAttribute"])) return { subRefinement: result.eclAttribute };
    }
  }

  visitDot(ctx) {
    logItem("found dot", ctx.getText());
    throw new Error("Dot '.' is not currently supported.");
  }

  visitMemberof(ctx) {
    logItem("found memberOf", ctx.getText());
    throw new Error("'^/memberOf' is not currently supported");
  }

  visitCardinality(ctx) {
    logItem("found cardinality", ctx.getText());
    throw new Error("Cardinality is not currently supported");
  }

  visitEclattributegroup(ctx) {
    logItem("found ecl attribute group", ctx.getText());
    let build = { eclAttributeGroup: { type: "BoolGroup" } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["compoundAttributeSet"]))
            build.eclAttributeGroup = { type: "BoolGroup", items: result.compoundAttributeSet.items, conjunction: result.compoundAttributeSet.conjunction };
          if (isObjectHasKeys(result, ["eclAttribute"])) build.eclAttributeGroup = { type: "BoolGroup", items: [result.eclAttribute], conjunction: "AND" };
        }
      }
    }
    return build;
  }

  visitCompoundattributeset(ctx) {
    logItem("found compound attribute set", ctx.getText());
    const result = this.visitChildren(ctx)[0];
    if (isObjectHasKeys(result, ["conjunctionAttributeSet"])) return { compoundAttributeSet: result.conjunctionAttributeSet };
    if (isObjectHasKeys(result, ["disjunctionAttributeSet"])) return { compoundAttributeSet: result.disjunctionAttributeSet };
  }

  visitConjunctionattributeset(ctx) {
    logItem("found conjunction attribute set", ctx.getText());
    let build = { conjunctionAttributeSet: { items: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["subAttributeSet"])) {
            const subAttributeSet = result.subAttributeSet;
            build.conjunctionAttributeSet.items.push(subAttributeSet);
          }
          if (isObjectHasKeys(result, ["bracketAttributeSet"])) {
            const bracketAttributeSet = result.bracketAttributeSet;
            build.conjunctionAttributeSet.items.push(bracketAttributeSet.bracketAttributeSet);
            build.conjunctionAttributeSet.type = "BoolGroup";
          }
          if (isObjectHasKeys(result, ["conjunction"])) {
            const conjunction = result.conjunction;
            build.conjunctionAttributeSet.conjunction = conjunction;
          }
        }
      }
    }
    return build;
  }

  visitDisjunctionattributeset(ctx) {
    logItem("found disjunction attribute set", ctx.getText());
    let build = { disjunctionAttributeSet: { items: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["subAttributeSet"])) {
            const subAttributeSet = result.subAttributeSet;
            build.disjunctionAttributeSet.items.push(subAttributeSet);
          }
          if (isObjectHasKeys(result, ["bracketAttributeSet"])) {
            const bracketAttributeSet = result.bracketAttributeSet;
            build.disjunctionAttributeSet.items.push(bracketAttributeSet.bracketAttributeSet);
            build.disjunctionAttributeSet.type = "BoolGroup";
          }
          if (isObjectHasKeys(result, ["disjunction"])) {
            const disjunction = result.disjunction;
            build.disjunctionAttributeSet.conjunction = disjunction;
          }
        }
      }
    }
    return build;
  }

  visitBracketattributeset(ctx) {
    logItem("found bracket attribute set", ctx.getText());
    let build = { bracketAttributeSet: { type: "BoolGroup", items: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["compoundAttributeSet"])) {
            build.bracketAttributeSet.items = result.compoundAttributeSet.items;
            build.bracketAttributeSet.conjunction = result.compoundAttributeSet.conjunction;
          }
        }
      }
    }
    return build;
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
    let build = { eclAttribute: { type: "Refinement" } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            const subExpressionConstraint = result.subExpressionConstraint;
            if (isObjectHasKeys(subExpressionConstraint, ["type"]) && subExpressionConstraint.type === "Concept")
              build.eclAttribute.property = {
                descendants: subExpressionConstraint.descendants ? subExpressionConstraint.descendants : "",
                concept: subExpressionConstraint.concept
              };
          }
          if (isObjectHasKeys(result, ["eclAttributeExpressionValue"])) {
            const eclAttributeExpressionValue = result.eclAttributeExpressionValue;
            build.eclAttribute.value = eclAttributeExpressionValue.value;
            build.eclAttribute.operator = eclAttributeExpressionValue.operator;
          }
          if (isObjectHasKeys(result, ["eclAttributeNumberValue"])) {
            const eclAttributeNumberValue = result.eclAttributeNumberValue;
            build.eclAttribute.value = eclAttributeNumberValue.value;
            build.eclAttribute.operator = eclAttributeNumberValue.operator;
          }
          if (isObjectHasKeys(result, ["eclattributestringvalue"])) {
            const eclattributestringvalue = result.eclattributestringvalue;
            build.eclAttribute.value = eclattributestringvalue.value;
            build.eclAttribute.operator = eclattributestringvalue.operator;
          }
        }
      }
    }
    return build;
  }

  visitEclattributeexpressionvalue(ctx) {
    logItem("found ecl attribute expression value", ctx.getText());
    let build = { eclAttributeExpressionValue: { value: {} } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["expressionComparisonOperator"])) build.eclAttributeExpressionValue.operator = result.expressionComparisonOperator;
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            const subExpressionConstraint = result.subExpressionConstraint;
            build.eclAttributeExpressionValue.value.descendants = subExpressionConstraint.descendants ? subExpressionConstraint.descendants : "";
            build.eclAttributeExpressionValue.value.concept = subExpressionConstraint.concept;
          }
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"])) {
            const bracketCompoundExpressionConstraint = result.bracketCompoundExpressionConstraint;
            build.eclAttributeExpressionValue.value.descendants = bracketCompoundExpressionConstraint.descendants
              ? bracketCompoundExpressionConstraint.descendants
              : "";
            build.eclAttributeExpressionValue.value.concept = bracketCompoundExpressionConstraint.concept;
          }
        }
      }
    }
    return build;
  }

  visitEclattributestringvalue(ctx) {
    logItem("found ecl attribute string value", ctx.getText());
    let build = { eclAttributeStringValue: { value: {} } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["stringComparisonOperator"])) build.eclAttributeStringValue.operator = result.stringComparisonOperator;
          if (isObjectHasKeys(result, ["stringValue"])) {
            build.eclAttributeStringValue.value.concept = { iri: result.stringValue };
          }
        }
      }
    }
    return build;
  }

  visitEclattributenumbervalue(ctx) {
    logItem("found ecl attribute number value", ctx.getText());
    let build = { eclAttributeNumberValue: { value: {} } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["numericComparisonOperator"])) build.eclAttributeNumberValue.operator = result.numericComparisonOperator;
          if (isObjectHasKeys(result, ["numericValue"])) {
            build.eclAttributeNumberValue.value.concept = { iri: result.numericValue };
          }
        }
      }
    }
    return build;
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
    const build = { bracketSubRefinement: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      for (const result of results) {
        if (isObjectHasKeys(result, ["eclRefinement"])) build.bracketSubRefinement = result.eclRefinement;
      }
    }
    return build;
  }
  process;
}
