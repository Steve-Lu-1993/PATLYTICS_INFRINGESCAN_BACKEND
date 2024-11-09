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
import { ComparisonService } from "../services/ComparisonService";

@Route("comparison")
@Tags("Comparison")
export class ComparisonController extends Controller {
  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Get("/getOrCreateComparison/{company_uuid}/{publication_number}")
  public async getOrCreateComparison(
    @Path() company_uuid: string,
    @Path() publication_number: string
  ): Promise<any> {
    return await new ComparisonService().getOrCreateComparison(
      company_uuid,
      publication_number
    );
  }

  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Get( "/getOrCreateComparisonByUser/{user_uuid}/{company_uuid}/{publication_number}" )
  public async getOrCreateComparisonByUser(
    @Path() user_uuid: string,
    @Path() company_uuid: string,
    @Path() publication_number: string
  ): Promise<any> {
    return await new ComparisonService().getOrCreateComparisonByUser(
      user_uuid,
      company_uuid,
      publication_number
    );
  }
}
