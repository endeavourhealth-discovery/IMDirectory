export interface ChartOptions {
  plugins: {
    legend: {
      position?: string;
      onHover?: Function;
      onLeave?: Function;
      labels?: { boxWidth: number; fontSize: number };
      display?: boolean;
    };
    tooltip?: { callbacks: { label(t: any, d: any): string } };
  };
}
