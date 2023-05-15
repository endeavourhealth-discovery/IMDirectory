import { Request, Response } from "express";
import jwkToPem from "jwk-to-pem";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import logger from "./logger.middleware";

let pems: { [key: string]: any } = {};

class AuthMiddleware {
  private poolRegion: string = "eu-west-2";
  private userPoolId: string = "eu-west-2_Vt5ScFwss";

  constructor() {
    this.setUp();
  }

  public verifyToken(req: Request, resp: Response, next: any, role?: string): any {
    const token = req.headers?.authorization?.substring(7);
    if (!token) return resp.status(401).end();

    let decodedJwt: any = jwt.decode(token, { complete: true });
    logger.info("decodedJwt", decodedJwt);
    if (decodedJwt === null) {
      resp.status(401).end();
      return;
    }

    if (role) {
      if (!decodedJwt.payload["cognito:groups"]) {
        resp.status(401).end();
        return;
      }

      const groups: string[] = decodedJwt.payload["cognito:groups"];

      if (!groups.includes(role)) {
        resp.status(401).end();
        return;
      }
    }

    let kid = decodedJwt.header.kid;
    let pem = pems[kid];
    if (!pem) {
      resp.status(401).end();
      return;
    }
    jwt.verify(token, pem, function (err: any, payload: any) {
      if (err) {
        resp.status(401).end();
      } else {
        next();
      }
    });
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
}

export default AuthMiddleware;
