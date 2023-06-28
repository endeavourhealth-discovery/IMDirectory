import morgan from "morgan";
import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";
const { combine, timestamp, json } = format;

const loggerConsole = createLogger({
  level: "http",
  format: combine(timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }), json()),
  transports: [new transports.Console()]
});

const loggerFile = createLogger({
  level: "http",
  format: combine(timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }), json()),
  transports: [
    new transports.DailyRotateFile({
      filename: "logs/http/http.log",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d"
    })
  ]
});

const morganMiddlewareConsole = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res) as string),
      content_length: tokens.res(req, res, "content-length"),
      response_time: Number.parseFloat(tokens["response-time"](req, res) as string)
    });
  },
  {
    stream: {
      write: message => {
        const data = JSON.parse(message);
        loggerConsole.http(`incoming-request`, data);
      }
    },
    skip(req, res) {
      return res.statusCode < 400;
    }
  }
);

const morganMiddlewareFile = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res) as string),
      content_length: tokens.res(req, res, "content-length"),
      response_time: Number.parseFloat(tokens["response-time"](req, res) as string)
    });
  },
  {
    stream: {
      write: message => {
        const data = JSON.parse(message);
        loggerFile.http(`incoming-request`, data);
      }
    },
    skip(req, res) {
      return res.statusCode < 400;
    }
  }
);

export { morganMiddlewareConsole, morganMiddlewareFile };
