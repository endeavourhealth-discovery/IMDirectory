import ECLVisitor from "./ECLVisitor";
import { isObjectHasKeys } from "../../helpers/DataTypeCheckers";
import _ from "lodash";
import { IM, SNOMED } from "@im-library/vocabulary";

const showLogs = false;

export default class ECLBuilderVisitor extends ECLVisitor {
  constructor() {
    super();
  }

  visitEcl(ctx) {
    if (showLogs) {
      console.log("found ecl");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found expression constraint");
      console.log(ctx.getText());
    }
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
            // if (!isObjectHasKeys(compoundExpressionConstraint, ["items"])) compoundExpressionConstraint.items = [];
            // if (!isObjectHasKeys(compoundExpressionConstraint, ["conjunction"])) compoundExpressionConstraint.conjunction = "AND";
            // if (!isObjectHasKeys(compoundExpressionConstraint, ["descendants"])) compoundExpressionConstraint.descendants = "";
            build.expressionConstraint = compoundExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["dottedExpressionConstraint"])) {
            const dottedExpressionConstraint = result.dottedExpressionConstraint;
            // if (!isObjectHasKeys(dottedExpressionConstraint, ["items"])) dottedExpressionConstraint.items = [];
            // if (!isObjectHasKeys(dottedExpressionConstraint, ["conjunction"])) dottedExpressionConstraint.conjunction = "AND";
            // if (!isObjectHasKeys(dottedExpressionConstraint, ["descendants"])) dottedExpressionConstraint.descendants = "";
            build.expressionConstraint = dottedExpressionConstraint;
          }
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            const subExpressionConstraint = result.subExpressionConstraint;
            if (!isObjectHasKeys(subExpressionConstraint, ["items"])) subExpressionConstraint.items = [];
            if (!isObjectHasKeys(subExpressionConstraint, ["conjunction"])) subExpressionConstraint.conjunction = "AND";
            if (!isObjectHasKeys(subExpressionConstraint, ["descendants"])) subExpressionConstraint.descendants = "";
            build.expressionConstraint = subExpressionConstraint;
          }
        }
      }
    }
    return build;
  }

  visitRefinedexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found refined expression constraint");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found compound expression constraint");
      console.log(ctx.getText());
    }
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["conjunctionExpressionConstraint"])) return { compoundExpressionConstraint: result.conjunctionExpressionConstraint };
      if (isObjectHasKeys(result, ["disjunctionExpressionConstraint"])) return { compoundExpressionConstraint: result.disjunctionExpressionConstraint };
      if (isObjectHasKeys(result, ["exclusionExpressionConstraint"])) return { compoundExpressionConstraint: result.exclusionExpressionConstraint };
    }
  }

  visitConjunctionexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found conjunction expression constraint");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found disjunction expression constraint");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found exclusion expression constraint");
      console.log(ctx.getText());
    }
    let build = { exclusionExpressionConstraint: { type: "BoolGroup" } };
    if (ctx.children) {
      build.exclusionExpressionConstraint.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["exclusion"])) build.exclusionExpressionConstraint.conjunction = result.exclusion;
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) build.exclusionExpressionConstraint.items.push(result.subExpressionConstraint);
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"]))
            build.exclusionExpressionConstraint.items.push(result.bracketCompoundExpressionConstraint);
        }
      }
    }
    return build;
  }

  visitDottedexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found dotted expression constraint");
      console.log(ctx.getText());
    }
    this.visitChildren(ctx);
  }

  visitDottedexpressionattribute(ctx) {
    if (showLogs) {
      console.log("found dotted expression attribute");
      console.log(ctx.getText());
    }
    this.visitChildren(ctx);
  }

  visitSubexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found sub expression constraint");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found bracket compound expression constraint");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found constraintOperator");
      console.log(ctx.getText());
    }
    if (ctx.children) return { constraintOperator: this.visitChildren(ctx)[0] };
  }

  visitDescendantof(ctx) {
    if (showLogs) {
      console.log("found descendantOf");
      console.log(ctx.getText());
    }
    return "<";
  }

  visitDescendantorselfof(ctx) {
    if (showLogs) {
      console.log("found descendantOrSelfOf");
      console.log(ctx.getText());
    }
    return "<<";
  }

  visitAncestorof(ctx) {
    if (showLogs) {
      console.log("found ancestorOf");
      console.log(ctx.getText());
    }
    return ">";
  }

  visitAncestororselfof(ctx) {
    if (showLogs) {
      console.log("found ancestorOrSelfOf");
      console.log(ctx.getText());
    }
    return ">>";
  }

  visitChildof(ctx) {
    if (showLogs) {
      console.log("found childOf");
      console.log(ctx.getText());
    }
    return "<!";
  }

  visitParentof(ctx) {
    if (showLogs) {
      console.log("found parentOf");
      console.log(ctx.getText());
    }
    return ">!";
  }

  visitEclfocusconcept(ctx) {
    if (showLogs) {
      console.log("found ecl focus concept");
      console.log(ctx.getText());
    }
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["eclConceptReference"])) return { eclFocusConcept: result.eclConceptReference };
      if (isObjectHasKeys(result, ["wildcard"])) return { eclFocusConcept: result.wildcard };
    }
  }

  visitEclconceptreference(ctx) {
    if (showLogs) {
      console.log("found ecl concept reference");
      console.log(ctx.getText());
    }
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      return { eclConceptReference: result };
    }
  }

  visitConceptid(ctx) {
    if (showLogs) {
      console.log("found concept id");
      console.log(ctx.getText());
    }
    const code = ctx.getText();
    let iri = code;
    if (code.match(/^[0-9]+$/)) {
      if (code.match(/1000252/g)) iri = IM.NAMESPACE + code;
      else iri = SNOMED.NAMESPACE + code;
    }
    return iri;
  }

  visitWildcard(ctx) {
    if (showLogs) {
      console.log("found wildcard");
      console.log(ctx.getText());
    }
    return { wildcard: ctx.getText() };
  }

  visitEclrefinement(ctx) {
    if (showLogs) {
      console.log("found ecl refinement");
      console.log(ctx.getText());
    }
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["subRefinement"])) return { eclRefinement: result.subRefinement };
      if (isObjectHasKeys(result, ["compoundRefinementSet"])) return { eclRefinement: result.compoundRefinementSet };
    }
  }

  visitCompoundrefinementset(ctx) {
    if (showLogs) {
      console.log("found compound refinement set");
      console.log(ctx.getText());
    }
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["conjunctionRefinementSet"])) return { compoundRefinementSet: result.conjunctionRefinementSet };
      if (isObjectHasKeys(result, ["disjunctionRefinementSet"])) return { disjunctionRefinementSet: result.disjunctionRefinementSet };
    }
  }

  visitConjunctionrefinementset(ctx) {
    if (showLogs) {
      console.log("found conjunction refinement set");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found disjunction refinement set");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found conjunction");
      console.log(ctx.getText());
    }
    return { conjunction: "AND" };
  }

  visitDisjunction(ctx) {
    if (showLogs) {
      console.log("found disjunction");
      console.log(ctx.getText());
    }
    return { disjunction: "OR" };
  }

  visitExclusion(ctx) {
    if (showLogs) {
      console.log("found exclusion");
      console.log(ctx.getText());
    }
    return { exclusion: "MINUS" };
  }

  visitSubrefinement(ctx) {
    if (showLogs) {
      console.log("found sub refinement");
      console.log(ctx.getText());
    }
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["compoundAttributeSet"])) return { subRefinement: result.compoundAttributeSet };
      if (isObjectHasKeys(result, ["eclAttributeGroup"])) return { subRefinement: result.eclAttributeGroup };
      if (isObjectHasKeys(result, ["bracketSubRefinement"])) return { subRefinement: result.bracketSubRefinement };
      if (isObjectHasKeys(result, ["eclAttribute"])) return { subRefinement: result.eclAttribute };
    }
  }

  visitDot(ctx) {
    if (showLogs) {
      console.log("dot found");
      console.log(ctx.getText());
    }
    throw new Error("Dot '.' is not currently supported.");
  }

  visitMemberof(ctx) {
    throw new Error("'^/memberOf' is not currently supported");
  }

  visitCardinality(ctx) {
    throw new Error("Cardinality is not currently supported");
  }

  visitEclattributegroup(ctx) {
    if (showLogs) {
      console.log("found ecl attribute group");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found compound attribute set");
      console.log(ctx.getText());
    }
    const result = this.visitChildren(ctx)[0];
    if (isObjectHasKeys(result, ["conjunctionAttributeSet"])) return { compoundAttributeSet: result.conjunctionAttributeSet };
    if (isObjectHasKeys(result, ["disjunctionAttributeSet"])) return { compoundAttributeSet: result.disjunctionAttributeSet };
  }

  visitConjunctionattributeset(ctx) {
    if (showLogs) {
      console.log("found conjunction attribute set");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found disjunction attribute set");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found bracket attribute set");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found sub attribute set");
      console.log(ctx.getText());
    }
    if (ctx.children) {
      const result = this.visitChildren(ctx)[0];
      if (isObjectHasKeys(result, ["eclAttribute"])) return { subAttributeSet: result.eclAttribute };
      if (isObjectHasKeys(result, ["bracketAttributeSet"])) return { subAttributeSet: result.bracketAttributeSet };
    }
  }

  visitEclattribute(ctx) {
    if (showLogs) {
      console.log("found ecl attribute");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found ecl attribute expression value");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found ecl attribute string value");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found ecl attribute number value");
      console.log(ctx.getText());
    }
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

  visitExpressioncomparisonoperator(ctx) {
    if (showLogs) {
      console.log("found expression comparison operator");
      console.log(ctx.getText());
    }
    return { expressionComparisonOperator: ctx.getText() };
  }

  visitStringcomparisonoperator(ctx) {
    if (showLogs) {
      console.log("found string comparison operator");
      console.log(ctx.getText());
    }
    return { StringComparisonOperator: ctx.getText() };
  }

  visitStringvalue(ctx) {
    if (showLogs) {
      console.log("found string value");
      console.log(ctx.getText());
    }
    return { stringValue: ctx.getText() };
  }

  visitNumericcomparisonoperator(ctx) {
    if (showLogs) {
      console.log("found numeric comparison operator");
      console.log(ctx.getText());
    }
    return { numericComparisonOperator: ctx.getText() };
  }

  visitNumericvalue(ctx) {
    if (showLogs) {
      console.log("found numeric value");
      console.log(ctx.getText());
    }
    return { numericValue: ctx.getText() };
  }

  visitBracketsubrefinement(ctx) {
    if (showLogs) {
      console.log("found bracket sub refinement");
      console.log(ctx.getText());
    }
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
