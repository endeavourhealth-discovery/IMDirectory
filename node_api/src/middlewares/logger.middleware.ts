import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";
const { combine, timestamp, json, errors } = format;

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
};

const errorFilter = format((info, opts) => {
  return ["fatal", "error"].includes(info.level) ? info : false;
});

const logger = createLogger({
  levels: logLevels,
  transports: [
    new transports.DailyRotateFile({
      filename: "logs/error/error.log",
      level: "fatal",
      format: combine(errorFilter(), timestamp(), json()),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d"
    }),
    new transports.DailyRotateFile({
      filename: "logs/combined/combined.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d"
    })
  ],
  exceptionHandlers: [
    new transports.DailyRotateFile({
      filename: "logs/exceptions/exceptions.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d"
    })
  ],
  rejectionHandlers: [
    new transports.DailyRotateFile({
      filename: "logs/rejections/rejections.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d"
    })
  ],
  format: combine(errors({ stack: true }), timestamp(), json()),
  defaultMeta: { service: "node_api" }
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({ format: format.simple() }));
}

export default logger;
