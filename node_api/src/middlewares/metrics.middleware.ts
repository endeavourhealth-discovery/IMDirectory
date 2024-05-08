import { NextFunction, Request, Response } from "express";
import graphite from "graphite";
import * as os from "os";
import ConfigService from "@/services/config.service";
import { CONFIG } from "@im-library/vocabulary";

const metrics: any = {};
let client: any;

async function metricsInterceptor(req: Request, res: Response, next: NextFunction) {
  if (!client) {
    try {
      const json = await new ConfigService().getConfig(CONFIG.MONITORING);
      const monitoringCfg = JSON.parse(json);
      if (monitoringCfg.graphite) client = graphite.createClient("plaintext://" + monitoringCfg.graphite.address + ":" + monitoringCfg.graphite.port + "/");
      else if (monitoringCfg.console) client = new consoleClient();
    } catch (e) {
      console.error("Metrics config not found");
      client = { write: () => {} };
    }
  }

  let key = new URL(req.url, req.url.startsWith("http") ? "" : "http://localhost/").pathname.substring(1).replaceAll("/", ".");
  key = os.hostname() + "." + key;

  let data: any = metrics[key];
  if (!data) {
    data = { count: 0, m1_rate: 0, start: Date.now() };
    metrics[key] = data;
  }

  const s = Date.now();
  data.count++;
  data.m1_rate = data.count / ((s - data.start) / 60000);
  next();
  const e = Date.now();
  data.duration = e - s;

  client.write(data, (err: any) => {
    if (err) console.error(err);
  });
}

class consoleClient {
  write(metrics: any, callback?: (err: any) => void) {
    console.log(metrics);
  }
}

export default metricsInterceptor;
