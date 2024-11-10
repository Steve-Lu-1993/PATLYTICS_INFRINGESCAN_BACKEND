import {
  Body,
  Controller,
  Security,
  Get,
  Path,
  Post,
  Put,
  Delete,
  Query,
  Route,
  Request,
  SuccessResponse,
  Response,
  Tags,
  Header,
} from "@tsoa/runtime";
import express from "express";
import { UserService } from "../services/UserService";

@Route("user")
@Tags("User")
export class UserController extends Controller {
  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Security("api_key")
  @Get("/")
  public async getUser(@Request() request: express.Request): Promise<any> {
    const user = request.user as { uuid: string; iat: number; exp: number };
    // console.log(user.uuid)
    return await new UserService().getUserByUuid(user.uuid);
  }
}
