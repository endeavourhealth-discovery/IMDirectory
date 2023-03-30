import ECLVisitor from "./ECLVisitor";
import { isObjectHasKeys } from "../../helpers/DataTypeCheckers";
import _ from "lodash";
import { SNOMED } from "../../vocabulary";

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
    let query = {};
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["expressionConstraint"])) {
            if (isObjectHasKeys(result.expressionConstraint.from)) query = result.expressionConstraint;
            else query.from = result.expressionConstraint;
          }
        }
      }
    }
    return query;
  }

  visitExpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found expression constraint");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found refined expression constraint");
      console.log(ctx.getText());
    }
    let query = { refinedExpressionConstraint: { from: {} } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      for (const result of results) {
        if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
          const subExpressionConstraint = result.subExpressionConstraint;
          query.refinedExpressionConstraint.from = subExpressionConstraint;
        }
        if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"])) {
          const bracketCompoundExpressionConstraint = result.bracketCompoundExpressionConstraint;
          query.refinedExpressionConstraint.from = bracketCompoundExpressionConstraint;
        }
        if (isObjectHasKeys(result, ["eclRefinement"])) {
          const eclRefinement = result.eclRefinement;
          if (isObjectHasKeys(eclRefinement, ["bool"])) query.refinedExpressionConstraint.from.where = [eclRefinement];
          else query.refinedExpressionConstraint.from.where = eclRefinement.where;
        }
      }
    }
    return query;
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
    let query = { conjunctionExpressionConstraint: { from: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) query.conjunctionExpressionConstraint.boolFrom = result.conjunction;
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) query.conjunctionExpressionConstraint.from.push(result.subExpressionConstraint);
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"]))
            query.conjunctionExpressionConstraint.from.push(result.bracketCompoundExpressionConstraint.from);
        }
      }
    }
    return query;
  }

  visitDisjunctionexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found disjunction expression constraint");
      console.log(ctx.getText());
    }
    let query = { disjunctionExpressionConstraint: { from: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["disjunction"])) query.disjunctionExpressionConstraint.boolFrom = result.disjunction;
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) query.disjunctionExpressionConstraint.from.push(result.subExpressionConstraint);
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"]))
            query.disjunctionExpressionConstraint.from.push(result.bracketCompoundExpressionConstraint.from);
        }
      }
    }
    return query;
  }

  visitExclusionexpressionconstraint(ctx) {
    if (showLogs) {
      console.log("found exclusion expression constraint");
      console.log(ctx.getText());
    }
    let query = { exclusionExpressionConstraint: { boolFrom: "and", from: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        let first = true;
        let conjunction;
        for (const result of results) {
          if (isObjectHasKeys(result, ["exclusion"])) conjunction = result.exclusion;
          if (isObjectHasKeys(result, ["subExpressionConstraint"])) {
            if (first) {
              query.exclusionExpressionConstraint.from.push(result.subExpressionConstraint);
              first = false;
            } else {
              query.exclusionExpressionConstraint.from.push({ exclude: true, from: [result.subExpressionConstraint] });
            }
          }
          if (isObjectHasKeys(result, ["bracketCompoundExpressionConstraint"])) {
            if (first) {
              if (isObjectHasKeys(result.bracketCompoundExpressionConstraint.from)) {
                query.exclusionExpressionConstraint.from.push(result.bracketCompoundExpressionConstraint.from);
              } else if (_.isArray(result.bracketCompoundExpressionConstraint.from)) {
                query.exclusionExpressionConstraint.from.push(result.bracketCompoundExpressionConstraint);
              }
              first = false;
            } else {
              if (isObjectHasKeys(result.bracketCompoundExpressionConstraint.from)) {
                if (result.bracketCompoundExpressionConstraint.boolFrom) {
                  query.exclusionExpressionConstraint.from.push({
                    exclude: true,
                    boolFrom: result.bracketCompoundExpressionConstraint.boolFrom,
                    from: [result.bracketCompoundExpressionConstraint.from]
                  });
                } else {
                  query.exclusionExpressionConstraint.from.push({
                    exclude: true,
                    from: [result.bracketCompoundExpressionConstraint.from]
                  });
                }
              } else if (_.isArray(result.bracketCompoundExpressionConstraint.from)) {
                if (result.bracketCompoundExpressionConstraint.boolFrom) {
                  query.exclusionExpressionConstraint.from.push({
                    exclude: true,
                    boolFrom: result.bracketCompoundExpressionConstraint.boolFrom,
                    from: result.bracketCompoundExpressionConstraint.from
                  });
                } else {
                  query.exclusionExpressionConstraint.from.push({ exclude: true, from: result.bracketCompoundExpressionConstraint.from });
                }
              }
            }
          }
        }
      }
    }
    return query;
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
    if (showLogs) {
      console.log("found bracket compound expression constraint");
      console.log(ctx.getText());
    }
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
    return "descendantsOf";
  }

  visitDescendantorselfof(ctx) {
    if (showLogs) {
      console.log("found descendantOrSelfOf");
      console.log(ctx.getText());
    }
    return "descendantsOrSelfOf";
  }

  visitAncestorof(ctx) {
    if (showLogs) {
      console.log("found ancestorOf");
      console.log(ctx.getText());
    }
    return "ancestorsOf";
  }

  visitAncestororselfof(ctx) {
    if (showLogs) {
      console.log("found ancestorOrSelfOf");
      console.log(ctx.getText());
    }
    throw new Error("AncestorOrSelfOf '>>' is not currently supported");
  }

  visitChildof(ctx) {
    if (showLogs) {
      console.log("found childOf");
      console.log(ctx.getText());
    }
    throw new Error("ChildOf '<!' is not currently supported");
  }

  visitParentof(ctx) {
    if (showLogs) {
      console.log("found parentOf");
      console.log(ctx.getText());
    }
    throw new Error("ParentOf '>!' is not currently supported");
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
      if (isObjectHasKeys(result, ["subRefinement"])) return { eclRefinement: { where: [result.subRefinement] } };
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
    if (showLogs) {
      console.log("found disjunction refinement set");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found conjunction");
      console.log(ctx.getText());
    }
    return { conjunction: "and" };
  }

  visitDisjunction(ctx) {
    if (showLogs) {
      console.log("found disjunction");
      console.log(ctx.getText());
    }
    return { disjunction: "or" };
  }

  visitExclusion(ctx) {
    if (showLogs) {
      console.log("found exclusion");
      console.log(ctx.getText());
    }
    return { exclusion: "not" };
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
      if (isObjectHasKeys(result, ["eclAttribute"])) {
        if (!result.eclAttribute.bool) result.eclAttribute.anyRoleGroup = true;
        return { subRefinement: result.eclAttribute };
      }
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
    throw new Error("member of '^' is not currently supported.");
  }

  visitCardinality(ctx) {
    throw new Error("Cardinality is not currently supported");
  }

  visitEclattributegroup(ctx) {
    if (showLogs) {
      console.log("found ecl attribute group");
      console.log(ctx.getText());
    }
    let query = { eclAttributeGroup: { where: [] } };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["compoundAttributeSet"])) {
            result.compoundAttributeSet.where.forEach(item => delete item.anyRoleGroup);
            query.eclAttributeGroup = result.compoundAttributeSet;
            query.eclAttributeGroup["@id"] = "http://endhealth.info/im#roleGroup";
          }
          if (isObjectHasKeys(result, ["eclAttribute"]))
            query.eclAttributeGroup = { "@id": "http://endhealth.info/im#roleGroup", where: [result.eclAttribute] };
        }
      }
    }
    return query;
  }

  visitCompoundattributeset(ctx) {
    if (showLogs) {
      console.log("found compound attribute set");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found conjunction attribute set");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found disjunction attribute set");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found bracket attribute set");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found ecl attribute expression value");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found ecl attribute string value");
      console.log(ctx.getText());
    }
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
    if (showLogs) {
      console.log("found ecl attribute number value");
      console.log(ctx.getText());
    }
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
    return { stringComparisonOperator: ctx.getText() };
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
