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
import { CompanyService } from "../services/CompanyService";

@Route("company")
@Tags("Company")
export class CompanyController extends Controller {
  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Get("/list")
  public async getCompanies(): Promise<any> {
    console.log("getCompanies");
    return await new CompanyService().getCompanies();
  }

  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Get("/{company_id}/products")
  public async getCompanyProducts(
    @Path() company_id: number
  ): Promise<any> {
    return await new CompanyService().getCompanyProducts(company_id);
  }
}
