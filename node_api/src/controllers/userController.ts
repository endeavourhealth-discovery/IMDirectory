import express, { NextFunction, Request, Response } from "express";
import router from "express-promise-router";
import UserService from "@/services/user.service";
import { USER } from "@im-library/vocabulary/USER";

export default class UserController {
  public path = "/node_api/user";
  public router = router();
  private userService;

  constructor() {
    this.initRoutes();
    this.userService = new UserService();
  }

  private initRoutes() {
    this.router.get("/public/getUserTheme", async (req, res, next) =>
      this.getUserTheme(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/getUserMRU", async (req, res, next) =>
      this.getUserMRU(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/getUserFavourites", async (req, res, next) =>
      this.getUserFavourites(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.post("/public/updateUserTheme", async (req, res, next) =>
      this.updateUserTheme(req)
        .then(data => res.setHeader("content-type", "application/sparql-update").send(data).end())
        .catch(next)
    );
    this.router.post("/public/updateUserMRU", async (req, res, next) =>
      this.updateUserMRU(req)
        .then(data => res.setHeader("content-type", "application/sparql-update").send(data).end())
        .catch(next)
    );
    this.router.post("/public/updateUserFavourites", async (req, res, next) =>
      this.updateUserFavourites(req)
        .then(data => res.setHeader("content-type", "application/sparql-update").send(data).end())
        .catch(next)
    );
  }

  async getUserTheme(req: Request): Promise<string> {
    if (typeof req.query.user === "string") {
      return await this.userService.getUserTheme(req.query.user);
    } else {
      throw new TypeError(`Invalid user id type. User id must be of type string`);
    }
  }

  async getUserMRU(req: Request): Promise<any[]> {
    if (typeof req.query.user === "string") {
      return await this.userService.getUserMRU(req.query.user);
    } else {
      throw new TypeError(`Invalid user id type. User id must be of type string`);
    }
  }

  async getUserFavourites(req: Request): Promise<any[]> {
    if (typeof req.query.user === "string") {
      return await this.userService.getUserFavourites(req.query.user);
    } else {
      throw new TypeError(`Invalid user id type. User id must be of type string`);
    }
  }

  async updateUserTheme(req: Request) {
    return await this.userService.updateUserTheme(req.body.params.user, req.body.params.theme);
  }

  async updateUserMRU(req: Request) {
    return await this.userService.updateUserMRU(req.body.params.user, req.body.params.mru);
  }

  async updateUserFavourites(req: Request) {
    return await this.userService.updateUserFavourites(req.body.params.user, req.body.params.favourites);
  }
}
