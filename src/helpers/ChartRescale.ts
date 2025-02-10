export function setTooltips(counts: number[]): {
  callbacks: { label(d: any): string };
} {
  return {
    callbacks: {
      label: function (d: any) {
        const realData = counts;
        const label = d.label;
        const value = realData[d.dataIndex];
        return label + ":" + value;
      },
    },
  } as { callbacks: { label(d: any): string } };
}

export function rescaleData(data: number[]): number[] {
  const sum = data.reduce((a, b) => a + b, 0);
  const minPercent = 0.75;
  const min = sum * (minPercent / 100);
  const percents = data.map((d) => Math.round((d / sum) * 100));
  let countZero = 0;
  const modPercents = percents.map((num) => {
    if (num === 0) {
      countZero++;
      return minPercent;
    } else {
      return num;
    }
  });
  modPercents[0] = modPercents[0] - countZero * minPercent;
  return modPercents.map((num) => num * min);
}

export default {
  setTooltips,
  rescaleData,
};
