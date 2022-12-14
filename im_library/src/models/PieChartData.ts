import { Dataset } from "../interfaces/Dataset";

export class PieChartData {
  datasets: Dataset[];
  labels: string[];

  constructor(datasets: Dataset[], labels: string[]) {
    this.datasets = datasets;
    this.labels = labels;
  }
}
