import { Dataset } from "../../interfaces/modules/Dataset.js";

export class PieChartData {
  datasets: Dataset[];
  labels: string[];

  constructor(datasets: Dataset[], labels: string[]) {
    this.datasets = datasets;
    this.labels = labels;
  }
}
