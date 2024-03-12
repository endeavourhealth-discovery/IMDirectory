import { NextFunction, Request, Response } from "express";
import jwkToPem from "jwk-to-pem";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import logger from "./logger.middleware";

let pems: { [key: string]: any } = {};

class AuthMiddleware {
  private poolRegion: string = "eu-west-2";
  private userPoolId: string = "eu-west-2_Vt5ScFwss";

  public async verifyToken(req: Request, res: Response, next: NextFunction, role?: string) {
    if (await this.checkToken(req, role)) next();
    else res.status(401).end();
  }

  public async checkToken(req: Request, role?: string) {
    try {
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
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  public secure(role?: string) {
    return (req: Request, res: Response, nxt: any) => this.verifyToken(req, res, nxt, role);
  }

  public async getUsernameFromToken(req: Request): Promise<string> {
    const token = req.headers?.authorization?.substring(7);
    if (!token) throw new Error("Missing authorisation token from request");
    let decodedJwt: any = jwt.decode(token, { complete: true });
    if (decodedJwt === null) {
      throw new Error("Failed to decode token");
    }
    const username = decodedJwt.payload["cognito:username"];
    if (username) return username;
    else throw new Error("Failed to get username from token");
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
}

export default AuthMiddleware;
