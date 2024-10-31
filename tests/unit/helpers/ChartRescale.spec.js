import { setTooltips, rescaleData } from "@/helpers/ChartRescale";

describe("ChartRescale", () => {
  describe("setTooltips", () => {
    it("returns tooltip callbacks", () => {
      const testCounts = [100, 59, 9199, 7410];
      expect(Object.keys(setTooltips(testCounts))).toStrictEqual(["callbacks"]);
      expect(Object.keys(setTooltips(testCounts).callbacks)).toStrictEqual(["label"]);
      expect(
        setTooltips(testCounts).callbacks.label({
          label: "Concept",
          dataIndex: 1
        })
      ).toBe("Concept:59");
    });
  });

  describe("rescaleData", () => {
    it("can rescale data", () => {
      expect(rescaleData([1030354, 93282, 1811, 1122, 99, 94, 68, 45, 26, 23, 11, 11, 8, 8, 2, 1])).toStrictEqual([
        680405.1187499999, 67617.9, 6339.178124999999, 6339.178124999999, 6339.178124999999, 6339.178124999999, 6339.178124999999, 6339.178124999999,
        6339.178124999999, 6339.178124999999, 6339.178124999999, 6339.178124999999, 6339.178124999999, 6339.178124999999, 6339.178124999999, 6339.178124999999
      ]);
    });
  });
});
