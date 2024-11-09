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
import { AuthService } from "../services/AuthService";

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Post("/register")
  public async register(
    @Body() reqBody: { data: { email: string; mobile_phone: string } }
  ): Promise<any> {
    const { data } = reqBody;
    return await new AuthService().register(data);
  }
}
