import ECLVisitor from "./ECLVisitor";
import { isObjectHasKeys } from "../../helpers/DataTypeCheckers";
import _ from "lodash";
import { SNOMED } from "../../vocabulary";

export default class ECLBuilderVisitor extends ECLVisitor {
  constructor() {
    super();
  }

  visitEcl(ctx) {
    console.log("found ecl");
    console.log(ctx.getText());
    let query = {};
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (result && isObjectHasKeys(result, ["from"])) query.from = result.from;
        }
      }
    }
    return query;
  }

  visitExpressionconstraint(ctx) {
    console.log("found expression constraint");
    console.log(ctx.getText());
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result)) return result;
        }
      }
    }
  }

  visitRefinedexpressionconstraint(ctx) {
    console.log("found refined expression constraint");
    console.log(ctx.getText());
    let build = { from: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      for (const result of results) {
        if (isObjectHasKeys(result, ["from"])) build.from = result.from;
        else if (isObjectHasKeys(result, ["where"])) build.from.where = result.where;
      }
    }
    return build;
  }

  visitCompoundexpressionconstraint(ctx) {
    console.log("found compound expression constraint");
    console.log(ctx.getText());
    return this.visitChildren(ctx)[0];
  }

  visitConjunctionexpressionconstraint(ctx) {
    console.log("found conjunction expression constraint");
    console.log(ctx.getText());
    let build = { from: {} };
    if (ctx.children) {
      build.from.from = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) build.from.bool = result.conjunction;
          else if (isObjectHasKeys(result, ["from"])) build.from.from.push(result.from);
        }
      }
    }
    return build;
  }

  visitDisjunctionexpressionconstraint(ctx) {
    console.log("found disjunction expression constraint");
    console.log(ctx.getText());
    let build = { from: {} };
    if (ctx.children) {
      build.from.from = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) build.from.bool = result.conjunction;
          else if (isObjectHasKeys(result, ["from"])) build.from.from.push(result.from);
        }
      }
    }
    return build;
  }

  visitExclusionexpressionconstraint(ctx) {
    console.log("found exclusion expression constraint");
    console.log(ctx.getText());
    let build = { from: {} };
    if (ctx.children) {
      build.from.from = [];
      const results = this.visitChildren(ctx);
      if (results) {
        let first = true;
        let conjunction;
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) conjunction = result.conjunction;
          else if (isObjectHasKeys(result, ["from"])) {
            if (first) {
              build.from.from.push(result.from);
              build.from.bool = "and";
              first = false;
            } else build.from.from.push({ bool: conjunction, from: [result.from] });
          }
        }
      }
    }
    return build;
  }

  visitDottedexpressionconstraint(ctx) {
    console.log("found dotted expression constraint");
    console.log(ctx.getText());
    this.visitChildren(ctx);
  }

  visitDottedexpressionattribute(ctx) {
    console.log("found dotted expression attribute");
    console.log(ctx.getText());
    this.visitChildren(ctx);
  }

  visitSubexpressionconstraint(ctx) {
    console.log("found sub expression constraint");
    console.log(ctx.getText());
    let build = { from: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["constraint"])) {
            if (isObjectHasKeys(result.constraint, ["includeSubtypes", "excludeSelf"])) {
              build.from.includeSubtypes = result.constraint.includeSubtypes;
              build.from.excludeSelf = result.constraint.excludeSelf;
            }
          }
          if (isObjectHasKeys(result, ["conceptReference"])) {
            build.from["@id"] = result.conceptReference;
          }
        }
      }
    }
    return build;
  }

  visitBracketcompoundexpressionconstraint(ctx) {
    console.log("found bracket compound expression constraint");
    console.log(ctx.getText());
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["from"])) {
            return result;
          }
        }
      }
    }
  }

  visitConstraintoperator(ctx) {
    console.log("found constraintOperator");
    console.log(ctx.getText());
    if (ctx.children) return { constraint: this.visitChildren(ctx)[0] };
  }

  visitDescendantof(ctx) {
    console.log("found descendantOf");
    console.log(ctx.getText());
    return { includeSubtypes: true, excludeSelf: true };
  }

  visitDescendantorselfof(ctx) {
    console.log("found descendantOrSelfOf");
    console.log(ctx.getText());
    return { includeSubtypes: true, excludeSelf: false };
  }

  visitAncestorof(ctx) {
    console.log("found ancestorOf");
    console.log(ctx.getText());
    throw new Error("AncestorOf '>' is not currently supported");
  }

  visitAncestororselfof(ctx) {
    console.log("found ancestorOrSelfOf");
    console.log(ctx.getText());
    throw new Error("AncestorOrSelfOf '>>' is not currently supported");
  }

  visitChildof(ctx) {
    console.log("found childOf");
    console.log(ctx.getText());
    throw new Error("ChildOf '<!' is not currently supported");
  }

  visitParentof(ctx) {
    console.log("found parentOf");
    console.log(ctx.getText());
    throw new Error("ParentOf '>!' is not currently supported");
  }

  visitEclfocusconcept(ctx) {
    console.log("found ecl focus concept");
    console.log(ctx.getText());
    if (ctx.children) return { conceptReference: this.visitChildren(ctx)[0] };
  }

  visitEclconceptreference(ctx) {
    console.log("found ecl concept reference");
    console.log(ctx.getText());
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitConceptid(ctx) {
    console.log("found concept id");
    console.log(ctx.getText());
    const code = ctx.getText();
    let iri = code;
    if (code.match(/^[0-9]+$/)) {
      if (code.match(/1000252/g)) iri = IM.NAMESPACE + code;
      else iri = SNOMED.NAMESPACE + code;
    }
    return iri;
  }

  visitWildcard(ctx) {
    console.log("found wildcard");
    console.log(ctx.getText());
    return ctx.getText();
  }

  visitEclrefinement(ctx) {
    console.log("found ecl refinement");
    console.log(ctx.getText());
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitCompoundrefinementset(ctx) {
    console.log("found compound refinement set");
    console.log(ctx.getText());
    const results = this.visitChildren(ctx)[0];
    if (ctx.children) return results;
  }

  visitConjunctionrefinementset(ctx) {
    console.log("found conjunction refinement set");
    console.log(ctx.getText());
    let build = { where: {} };
    const results = this.visitChildren(ctx);
    if (results) {
      for (const result of results) {
        if (isObjectHasKeys(result, ["conjunction"])) {
          if (build.where.bool && build.where.bool !== result.conjunction)
            throw new Error("Conjunction differs from other conjunctions within refinement set. Logic requires bracketted conjunctions.");
          else build.where.bool = result.conjunction;
        }
        if (isObjectHasKeys(result, ["where"])) {
          if (build.where.where && _.isArray(build.where.where)) build.where.where.push(result);
          else build.where.where = [result];
        }
      }
    }
    return build;
  }

  visitDisjunctionrefinementset(ctx) {
    console.log("found disjunction refinement set");
    console.log(ctx.getText());
    let build = { where: {} };
    const results = this.visitChildren(ctx);
    if (results) {
      for (const result of results) {
        if (isObjectHasKeys(result, ["conjunction"])) {
          if (build.where.bool && build.where.bool !== result.conjunction)
            throw new Error("Conjunction differs from other conjunctions within refinement set. Logic requires bracketted conjunctions.");
          else build.where.bool = result.conjunction;
        }
        if (isObjectHasKeys(result, ["where"])) {
          if (build.where.where && _.isArray(build.where.where)) build.where.where.push(result);
          else build.where.where = [result];
        }
      }
    }
    return build;
  }

  visitConjunction(ctx) {
    console.log("found conjunction");
    console.log(ctx.getText());
    return { conjunction: "and" };
  }

  visitDisjunction(ctx) {
    console.log("found disjunction");
    console.log(ctx.getText());
    return { conjunction: "or" };
  }

  visitExclusion(ctx) {
    console.log("found exclusion");
    console.log(ctx.getText());
    return { conjunction: "not" };
  }

  visitSubrefinement(ctx) {
    console.log("found sub refinement");
    console.log(ctx.getText());
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (isObjectHasKeys(results[0], ["attribute"])) {
        if (!results[0].attribute.bool) results[0].attribute.anyRoleGroup = true;
        return { where: results[0].attribute };
      } else return results[0];
    }
  }

  visitDot(ctx) {
    console.log("dot found");
    console.log(ctx.getText());
    throw new Error("Dot '.' is not currently supported.");
  }

  visitMemberof(ctx) {
    throw new Error("member of '^' is not currently supported.");
  }

  visitCardinality(ctx) {
    throw new Error("Cardinality is not currently supported");
  }

  visitEclattributegroup(ctx) {
    console.log("found ecl attribute group");
    console.log(ctx.getText());
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result)) {
            return { where: { "@id": "http://endhealth.info/im#roleGroup", where: [result.attribute] } };
          }
        }
      }
    }
  }

  visitCompoundattributeset(ctx) {
    console.log("found compount attribute set");
    console.log(ctx.getText());
    const result = this.visitChildren(ctx)[0];
    if (result?.where?.where) result.where.where.forEach(item => (item.anyRoleGroup = true));
    return result;
  }

  visitConjunctionattributeset(ctx) {
    console.log("found conjunction attribute set");
    console.log(ctx.getText());
    let build = { where: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) {
            if (build.where.bool && build.where.bool != result.conjunction)
              throw new Error("Conjunction differs from other conjunctions within attribute set. Logic requires bracketted conjunctions.");
            else build.where.bool = result.conjunction;
          }
          if (isObjectHasKeys(result, ["attribute"])) {
            if (build.where.where && _.isArray(build.where.where)) build.where.where.push(result.attribute);
            else build.where.where = [result.attribute];
          }
        }
      }
    }
    return build;
  }

  visitDisjunctionattributeset(ctx) {
    console.log("found disjunction attribute set");
    console.log(ctx.getText());
    let build = { where: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) {
            if (build.where.bool && build.where.bool != result.conjunction)
              throw new Error("Conjunction differs from other conjunctions within attribute set. Logic requires bracketted conjunctions.");
            else build.where.bool = result.conjunction;
          }
          if (isObjectHasKeys(result, ["where"])) {
            if (build.where.where && _.isArray(build.where.where)) build.where.where.push(result);
            else build.where.where = [result];
          }
        }
      }
    }
    return build;
  }

  visitBracketattributeset(ctx) {
    console.log("found bracket attribute set");
    console.log(ctx.getText());
    let build = { type: "BoolGroup" };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result)) {
            build.items = [result];
          }
        }
      }
    }
  }

  visitSubattributeset(ctx) {
    console.log("found sub attribute set");
    console.log(ctx.getText());
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitEclattribute(ctx) {
    console.log("found ecl attribute");
    console.log(ctx.getText());
    let build = { attribute: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["from"])) {
            build.attribute["@id"] = result.from["@id"];
            if (isObjectHasKeys(result.from, ["includeSubtypes"])) build.attribute.includeSubtypes = result.from.includeSubtypes;
          }
          if (isObjectHasKeys(result, ["value"])) {
            if (result.value.in) build.attribute.in = result.value.in;
            if (result.value.notIn) build.attribute.notIn = result.value.notIn;
          }
        }
      }
    }
    return build;
  }

  visitEclattributeexpressionvalue(ctx) {
    console.log("found ecl attribute expression value");
    console.log(ctx.getText());
    let build = { value: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["operator"])) {
            if (result.operator === "=") build.value.in = [];
            else if (result.operator === "!=") build.value.notIn = [];
            else throw new Error(`attribute value operator: '${result.operator}' is not currently supported`);
          }
          if (isObjectHasKeys(result, ["from"])) {
            if (build.value.in && _.isArray(build.value.in)) build.value.in.push(result.from);
            if (build.value.notIn && _.isArray(build.value.notIn)) build.value.notIn.push(result.from);
          }
        }
      }
    }
    return build;
  }

  visitEclattributestringvalue(ctx) {
    console.log("found ecl attribute string value");
    console.log(ctx.getText());
    let build = { value: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["operator"])) {
            if (result.operator === "=") build.value.in = [];
            else if (result.operator === "!=") build.value.notIn = [];
            else throw new Error(`attribute value operator: '${result.operator}' is not currently supported`);
          }
          if (isObjectHasKeys(result, ["text"])) {
            if (build.value.in && _.isArray(build.value.in)) build.value.in.push({ variable: result.text });
            if (build.value.notIn && _.isArray(build.value.notIn)) build.value.notIn.push({ variable: result.text });
          }
        }
      }
    }
    return build;
  }

  visitEclattributenumbervalue(ctx) {
    console.log("found ecl attribute number value");
    console.log(ctx.getText());
    let build = { value: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["operator"])) {
            if (result.operator === "=") build.value.in = [];
            else if (result.operator === "!=") build.value.notIn = [];
            else throw new Error(`attribute value operator: '${result.operator}' is not currently supported`);
          }
          if (isObjectHasKeys(result, ["number"])) {
            if (build.value.in && _.isArray(build.value.in)) build.value.in.push({ value: result.number });
            if (build.value.notIn && _.isArray(build.value.notIn)) build.value.notIn.push({ variable: result.number });
          }
        }
      }
    }
    return build;
  }

  visitExpressioncomparisonoperator(ctx) {
    console.log("found expression comparison operator");
    console.log(ctx.getText());
    return { operator: ctx.getText() };
  }

  visitStringcomparisonoperator(ctx) {
    console.log("found string comparison operator");
    console.log(ctx.getText());
    return { operator: ctx.getText() };
  }

  visitStringvalue(ctx) {
    console.log("found string value");
    console.log(ctx.getText());
    return { text: ctx.getText() };
  }

  visitNumericcomparisonoperator(ctx) {
    console.log("found numeric comparison operator");
    console.log(ctx.getText());
    return { operator: ctx.getText() };
  }

  visitNumericvalue(ctx) {
    console.log("found numeric value");
    console.log(ctx.getText());
    return { number: ctx.getText() };
  }

  visitBracketsubrefinement(ctx) {
    console.log("found bracket sub refinement");
    console.log(ctx.getText());
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      for (const result of results) {
        if (result) return result;
      }
    }
  }

  // visitChildren(ctx) {
  //   if (!ctx) return;
  //   if (ctx.children) {
  //     return ctx.children.map(child => {
  //       if (child.children && child.children.length != 0) {
  //         return child.accept(this);
  //       } else {
  //         return child.getText();
  //       }
  //     });
  //   } else {
  //     console.log("no children");
  //     console.log(ctx.getText());
  //   }
  // }

  process;
}
