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
    this.router.post("/public/updateUserTheme", async (req, res, next) =>
      this.updateUserTheme(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.post("/public/updateUserMRU", async (req, res, next) =>
      this.updateUserMRU(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
  }

  async getUserTheme(req: Request) {
    return await this.userService.getUserTheme(req.body.user);
  }

  async getUserMRU(req: Request) {
    return await this.userService.getUserMRU(req.body.user);
  }

  async updateUserTheme(req: Request) {
    console.log("b");
    console.log(req.body.user);
    console.log(req.body.theme);
    return await this.userService.updateUserTheme(req.body.user, req.body.theme);
  }

  async updateUserMRU(req: Request) {
    return await this.userService.updateUserMRU(req.body.user, req.body.userMRU);
  }
}
