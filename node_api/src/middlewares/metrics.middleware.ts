import { NextFunction, Request, Response } from "express";
import promClient from "prom-client";

const metrics = new promClient.Registry();

metrics.setDefaultLabels({
  app: "nodeapi"
});

promClient.collectDefaultMetrics({ register: metrics, prefix: "nodeapi_" });

const metric_label_enum = {
  PATH: "path",
  METHOD: "method",
  STATUS_CODE: "status_code"
};

// * The http_response rate histogram for measuring the response rates for each http request
const http_response_rate_histogram = new promClient.Histogram({
  name: "node_http_duration",
  labelNames: [metric_label_enum.PATH, metric_label_enum.METHOD, metric_label_enum.STATUS_CODE],
  help: "The duration of HTTP requests in seconds",
  buckets: [0.0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 10]
});

metrics.registerMetric(http_response_rate_histogram);

function promTimer(req: Request, res: Response, next: NextFunction) {
  // Get's the Req URL object
  const req_url = new URL(req.url, `http://${req.headers.host}`);
  // Start's the prom-client histogram timer for the request
  const endTimer = http_response_rate_histogram.startTimer();

  // Copies the original res.send function to a variable
  const original_res_send_function = res.send;

  // Creates a new send function with the functionality of ending the timer whenever the response.send function is called
  const res_send_interceptor: any = function (body: any) {
    // Ends the histogram timer for the request
    endTimer({ method: req.method, path: req_url.pathname, status_code: res.statusCode });
    // Calls the original response.send function
    original_res_send_function.call(res, body);
  };

  // Overrides the existing response.send object/property with the function defined above
  res.send = res_send_interceptor;
  next();
}

export default { metrics, promTimer };
