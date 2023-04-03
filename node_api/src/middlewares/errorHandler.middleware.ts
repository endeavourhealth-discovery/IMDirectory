import { ErrorType } from "@im-library/enums";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ApiError, CustomError } from "@im-library/models";
import { NextFunction, Request, Response } from "express";

function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  let status = error.status || 500;
  let message = error.message || "Uncaught server error occurred";
  const newApiError = new ApiError(status, message);
  if (error instanceof CustomError) {
    newApiError.setCode(error.errorType);
    newApiError.setStatus(400);
    status = 400;
  } else if (error.response) {
    if (error.response.status) {
      newApiError.setStatus(error.response.status);
      status = error.response.status;
    }
    if (error.response.data) {
      const errorData = error.response.data;
      if (isObjectHasKeys(errorData, ["message"]) && errorData.message) newApiError.setMessage(errorData.message);
      if (isObjectHasKeys(errorData, ["code"]) && errorData.code) newApiError.setCode(errorData.code);
      if (isObjectHasKeys(errorData, ["debugMessage"]) && errorData.debugMessage) newApiError.setDebugMessage(errorData.debugMessage);
      if (isObjectHasKeys(errorData, ["subErrors"]) && errorData.subErrors) newApiError.setSubErrors(errorData.subErrors);
    }
  } else {
    newApiError.setCode(ErrorType.UnhandledError);
  }
  response.status(status).send(newApiError);
}

export default errorHandler;
