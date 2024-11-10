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
import { ComparisonService } from "../services/ComparisonService";

@Route("comparison")
@Tags("Comparison")
export class ComparisonController extends Controller {
  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Get("/getComparisonByUuid/{uuid}")
  public async getComparisonByUuid(@Path() uuid: string): Promise<any> {
    return await new ComparisonService().getComparisonByUuid(uuid);
  }

  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Post("/getOrCreateComparison")
  public async getOrCreateComparison(
    @Body()
    reqBody: {
      data: { company_uuid: string; publication_number: string };
    }
  ): Promise<any> {
    return await new ComparisonService().getOrCreateComparison(
      reqBody.data.company_uuid,
      reqBody.data.publication_number
    );
  }

  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Security("api_key")
  @Post("/getOrCreateComparisonByUser")
  public async getOrCreateComparisonByUser(
    @Request() request: express.Request,
    @Body()
    reqBody: { data: { company_uuid: string; publication_number: string } }
  ): Promise<any> {
    const { data } = reqBody;
    const { company_uuid, publication_number } = data;

    const user = request.user as { uuid: string; iat: number; exp: number };

    return await new ComparisonService().getOrCreateComparisonByUser(
      user.uuid,
      company_uuid,
      publication_number
    );
  }
}
