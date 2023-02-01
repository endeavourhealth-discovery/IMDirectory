import ECLVisitor from "./ECLVisitor";

export default class ECLBuilderVisitor extends ECLVisitor {
  constructor(build) {
    super();
    this.Build = build ? build : "";
  }

  visitEcl(ctx) {
    console.log("found ecl");
    console.log(ctx.getText());
    this.Build += `{ "type": "BoolGroup", "operator": "AND"`;
    if (ctx.children) {
      this.Build += `,"items": [`;
      this.visitChildren(ctx);
      this.Build += "]";
    }
    this.Build += "}";
    return;
  }

  visitExpressionconstraint(ctx) {
    console.log("found expression constraint");
    console.log(ctx.getText());
    this.Build += `{"type": "Concept"`;
    if (ctx.children) this.visitChildren(ctx);
    this.Build += "}";
  }

  visitSubexpressionconstraint(ctx) {
    console.log("found sub expression constraint");
    console.log(ctx.getText());
    if (ctx.children) this.visitChildren(ctx);
  }

  visitConstraintoperator(ctx) {
    console.log("found constraintOperator");
    console.log(ctx.getText());
    this.Build += `, "descendants": "` + ctx.getText() + `"`;
  }

  visitEclfocusconcept(ctx) {
    console.log("found ecl focus concept");
    console.log(ctx.getText());
    if (this.Build.slice(-1) !== "[" && this.Build.slice(-1) !== "{") this.Build += `, "concept": { "iri": "` + ctx.getText() + `"}`;
    else this.Build += `"concept": { "iri": "` + ctx.getText() + `"}`;
  }

  visitRefinedexpressionconstraint(ctx) {
    console.log("found refined expression constraint");
    console.log(ctx.getText());
    if (ctx.children) {
      this.visitChildren(ctx);
    }
  }

  visitEclrefinement(ctx) {
    console.log("found ecl refinement");
    console.log(ctx.getText());
    this.Build += `, "items":[`;
    if (ctx.children) {
      this.Build += `{`;
      this.visitChildren(ctx);
      this.Build += `}`;
    }
    this.Build += `]`;
  }

  visitRefinementgroup(ctx) {
    console.log("found ecl refinement group");
    console.log(ctx.getText());
  }

  visitConjunctionrefinementset(ctx) {
    console.log("found conjunction refinement set");
    console.log(ctx.getText());
  }

  visitSubrefinement(ctx) {
    console.log("found sub refinement");
    console.log(ctx.getText());
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
