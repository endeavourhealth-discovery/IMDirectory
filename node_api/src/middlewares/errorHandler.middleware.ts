import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ApiError, CustomError } from "@im-library/models";
import { NextFunction, Request, Response } from "express";
import logger from "./logger.middleware";

function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  process.on("uncaughtException", err => {
    console.error("fatal", error);
    logger.log("fatal", error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("fatal", error);
    logger.log("fatal", error);
    process.exit(1);
  });

  let status = error.status ?? 500;
  let message = error.message ?? "Uncaught server error occurred";
  const newApiError = new ApiError(status, message);
  if (error instanceof CustomError) {
    logger.error(error);
    newApiError.setCode(error.errorType);
    newApiError.setStatus(400);
    status = 400;
  } else if (error.response) {
    logger.error(error);
    handleResponse(error.response, newApiError);
  } else {
    console.error("fatal", error);
    logger.log("fatal", error);
    process.exit(1);
  }
  response.status(status).send(newApiError);
}

function handleResponse(response: any, newApiError: ApiError) {
  if (response.status) {
    newApiError.setStatus(response.status);
  }
  if (response.data) {
    const errorData = response.data;
    if (isObjectHasKeys(errorData, ["message"]) && errorData.message) newApiError.setMessage(errorData.message);
    if (isObjectHasKeys(errorData, ["code"]) && errorData.code) newApiError.setCode(errorData.code);
    if (isObjectHasKeys(errorData, ["debugMessage"]) && errorData.debugMessage) newApiError.setDebugMessage(errorData.debugMessage);
    if (isObjectHasKeys(errorData, ["subErrors"]) && errorData.subErrors) newApiError.setSubErrors(errorData.subErrors);
  }
}

export default errorHandler;
