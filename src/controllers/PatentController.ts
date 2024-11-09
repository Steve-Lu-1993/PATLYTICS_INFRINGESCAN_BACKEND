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
import { PatentService } from "../services/PatentService";

@Route("patent")
@Tags("Patent")
export class PatentController extends Controller {
  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Get("/list")
  public async getPatents(@Query() keyword?: string): Promise<any> {
    return await new PatentService().getPatents(keyword);
  }

  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Get("/{publication_number}/detail")
  public async getPatentByPublicationNumber(
    @Path() publication_number: string
  ): Promise<any> {
    return await new PatentService().getPatentByPublicationNumber(
      publication_number
    );
  }
}
