// Example _metrics:
// [
//   {
//     id: 22334,
//     startTime: 1234567890,
//     endTime: 1234567999,
//     diff: 1099
//   }
// ]
export default class PerfMetrics {
  constructor() {
    this._metrics = [];
    this._average = null;
    this._standardDeviation = null;
  }
  addMetric(metric) {
    const diff = metric.endTime - metric.startTime;
    this._metrics.push({ ...metric, diff });
  }
  calcStandardDeviation() {
    if (this._average === null) {
      this.calcAverage();
    }
    const average = this._average;
    const metricsLen = this.metricsLen();
    const sum = this._metrics.reduce((acc, curr) => {
      return acc + Math.pow(curr.diff - average, 2);
    }, 0);
    this._standardDeviation = Math.sqrt(sum / metricsLen);
  }
  calcAverage() {
    const metrics = this.metrics;
    const metricsLen = this.metricsLen;
    const sum = metrics.reduce((acc, curr) => {
      return acc + curr.diff;
    }, 0);
    this._average = sum / metricsLen;
  }
  get standardDeviation() {
    return this._standardDeviation;
  }
  get average() {
    return this._average;
  }
  get metrics() {
    return this._metrics;
  }
  get metricsLen() {
    return this._metrics.length;
  }
  get outLiers() {
    if (this._metrics.length === 0) {
      return [];
    }
    if (this._average === null) {
      this.calcAverage();
    }
    if (this._standardDeviation === null) {
      this.calcStandardDeviation();
    }
    const average = this._average;
    const standardDeviation = this._standardDeviation;
    const outLiers = this._metrics.filter(
      (metric) => metric.diff > average + standardDeviation
    );
    return outLiers;
  }
}
