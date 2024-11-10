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
    @Body()
    reqBody: {
      data: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
      };
    }
  ): Promise<any> {
    const { data } = reqBody;
    const { first_name, last_name, email, password } = data;
    return await new AuthService().register(
      first_name,
      last_name,
      email,
      password
    );
  }

  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Post("/login")
  public async login(
    @Body() reqBody: { data: { email: string; password: string } }
  ): Promise<any> {
    const { data } = reqBody;
    const { email, password } = data;
    return await new AuthService().login(email, password);
  }

  @SuccessResponse("200", "Success")
  @Response("500", "Error")
  @Post("/refreshToken")
  public async refreshToken(@Body() body: { refreshToken: string }) {
    return await new AuthService().refreshToken(body.refreshToken);
  }
}
