import { parser } from "@/nlecl-lang.js";

describe("NL ECL", () => {
  it("should parse an ECL statement", async () => {
    const ecl = '<< 12345 | "Asthma"';
    const actual = parser.parse(ecl);
    const cursor = actual.cursor();

    let next = true;

    while (next) {
      console.log(cursor.name + ": " + cursor.from + "-" + cursor.to);
      console.log(ecl.substring(cursor.from, cursor.to));
      next = cursor.next();
    }
  });
});
