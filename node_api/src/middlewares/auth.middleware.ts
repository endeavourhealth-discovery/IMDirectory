import { NextFunction, Request, Response } from "express";
import jwkToPem from "jwk-to-pem";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import logger from "./logger.middleware";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";

let pems: { [key: string]: any } = {};

class AuthMiddleware {
  private poolRegion: string = "eu-west-2";
  private userPoolId: string = "eu-west-2_Vt5ScFwss";

  public async verifyToken(req: Request, res: Response, next: NextFunction, role?: string) {
    if (await this.checkToken(req, role)) next();
    else res.status(401).end();
  }

  public async checkToken(req: Request, role?: string) {
    const token = req.headers?.authorization?.substring(7);

    if (!token) return false;

    if (Object.keys(pems).length == 0) await this.setUp();

    let decodedJwt: any = jwt.decode(token, { complete: true });
    logger.info("decodedJwt", decodedJwt);
    if (decodedJwt === null) {
      return false;
    }

    if (role) {
      if (!decodedJwt.payload["cognito:groups"]) {
        return false;
      }

      const groups: string[] = decodedJwt.payload["cognito:groups"];

      if (!groups.includes(role)) {
        return false;
      }
    }

    let kid = decodedJwt.header.kid;
    let pem = pems[kid];
    if (!pem) {
      return false;
    }
    jwt.verify(token, pem);
    return true;
  }

  public secure(role?: string) {
    return (req: Request, res: Response, nxt: any) => this.verifyToken(req, res, nxt, role);
  }

  private async setUp() {
    const URL = `https://cognito-idp.${this.poolRegion}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`;

    try {
      const response = await fetch(URL);
      if (response.status !== 200) {
        throw new Error("request not successful");
      }
      const data = await response.json();
      const { keys }: any = data;
      for (let key of keys) {
        const key_id = key.kid;
        const modulus = key.n;
        const exponent = key.e;
        const key_type = key.kty;
        const jwk = { kty: key_type, n: modulus, e: exponent };
        const pem = jwkToPem(jwk);
        pems[key_id] = pem;
      }
    } catch (error) {
      logger.error(error);
      logger.error("Error! Unable to download JWKs");
    }
  }

  public async getRolesFromToken(req: Request): Promise<string[]> {
    const token = req.headers?.authorization?.substring(7);

    if (!token) throw new CustomError("Missing token", ErrorType.InvalidTokenError);

    if (Object.keys(pems).length == 0) await this.setUp();

    let decodedJwt: any = jwt.decode(token, { complete: true });
    logger.info("decodedJwt", decodedJwt);
    if (decodedJwt === null) {
      throw new CustomError("Invalid token", ErrorType.InvalidTokenError);
    }

    let kid = decodedJwt.header.kid;
    let pem = pems[kid];
    if (!pem) {
      throw new CustomError("Invalid token", ErrorType.InvalidTokenError);
    }
    try {
      jwt.verify(token, pem);
    } catch (err) {
      throw new CustomError("Invalid token", ErrorType.InvalidTokenError);
    }

    if (!decodedJwt.payload["cognito:groups"]) {
      return [];
    }

    const roles: string[] = decodedJwt.payload["cognito:groups"];

    return roles;
  }

  public async getEmailFromToken(req: Request): Promise<string> {
    const token = req.headers?.authorization?.substring(7);

    if (!token) throw new CustomError("Missing token", ErrorType.InvalidTokenError);

    if (Object.keys(pems).length == 0) await this.setUp();

    let decodedJwt: any = jwt.decode(token, { complete: true });
    logger.info("decodedJwt", decodedJwt);
    if (decodedJwt === null) {
      throw new CustomError("Invalid token", ErrorType.InvalidTokenError);
    }

    let kid = decodedJwt.header.kid;
    let pem = pems[kid];
    if (!pem) {
      throw new CustomError("Invalid token", ErrorType.InvalidTokenError);
    }
    try {
      jwt.verify(token, pem);
    } catch (err) {
      throw new CustomError("Invalid token", ErrorType.InvalidTokenError);
    }

    if (!decodedJwt.payload["email"]) {
      throw new CustomError("Invalid token", ErrorType.InvalidTokenError);
    }

    const email: string = decodedJwt.payload["email"];

    return email;
  }
}

export default AuthMiddleware;
