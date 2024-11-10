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
import { UserComparisonService } from "../services/UserComparisonService";


@Route("userComparison")
@Tags("UserComparison")
export class UserComparisonController extends Controller {
    @SuccessResponse("200", "Success")
    @Response("500", "Error")
    @Security("api_key")
    @Get("/user/list")
    public async getListByUserUuid(@Request() request: express.Request): Promise<any> {
      const user = request.user as { uuid: string; iat: number; exp: number };
      // console.log(user.uuid)
      return await new UserComparisonService().getListByUserUuid(user.uuid);
    }
}