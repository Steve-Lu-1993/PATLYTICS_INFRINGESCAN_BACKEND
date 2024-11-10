import { randomUUID } from "crypto";
import { GenericDAO_TypeORM } from "../daos/GDAO_TypeORM";
import { User } from "../entities/User";
import { ServiceRes } from "../types/GenericTypes";
import { UserAccessToken } from "../entities/UserAccessToken";
import jwt from "jsonwebtoken";

export class AuthService {
  private serviceName: string = "AuthService";

  private userDao = new GenericDAO_TypeORM<User>("user");
  private userAccessTokenDao = new GenericDAO_TypeORM<UserAccessToken>( "user_access_token" );
  private jwtSecret = process.env.JWT_SECRET!;
  private refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;

  public async register(
    first_name: string,
    last_name: string,
    email: string,
    password: string
  ): Promise<ServiceRes<{ user: User; userAccessToken: UserAccessToken }>> {
    const functionName = "register";

    try {
      const existingUser = await this.userDao.read({
        filters: { email },
      });
      if (existingUser) {
        return { status: 0, message: "user_already_exists" };
      }

      const user = await this.userDao.create({
        first_name,
        last_name,
        email,
        password,
        uuid: randomUUID(),
      });
      if (!user) {
        return { status: 0, message: "user_creation_failed" };
      }

      const accessToken = jwt.sign({ uuid: user.uuid }, this.jwtSecret, {
        expiresIn: "1h",
      });
      const refreshToken = jwt.sign(
        { uuid: user.uuid },
        this.refreshTokenSecret,
        {
          expiresIn: "7d",
        }
      );

      const userAccessToken = await this.userAccessTokenDao.create({
        user_id: user.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expires_at: Date.now() + 3600000,
        refresh_token_expires_at: Date.now() + 7 * 24 * 3600000,
      });

      return {
        status: 1,
        message: "user_created",
        data: { user, userAccessToken },
      };
    } catch (error: any) {
      return {
        status: 0,
        message: `${this.serviceName}.${functionName}: ${error.message}`,
      };
    }
  }

  public async login(
    email: string,
    password: string
  ): Promise<ServiceRes<{ user: User; userAccessToken: UserAccessToken }>> {
    const functionName = "login";

    try {
      const user = await this.userDao.read({ filters: { email, password } });
      if (!user) {
        return { status: 0, message: "user_not_found" };
      }

      //check if user access token exists and unexpired
      let userAccessToken = await this.userAccessTokenDao.read({
        filters: { user_id: user.id },
      });
      if (!userAccessToken) {
        const accessToken = jwt.sign({ uuid: user.uuid }, this.jwtSecret, {
          expiresIn: "1h",
        });
        const refreshToken = jwt.sign(
          { uuid: user.uuid },
          this.refreshTokenSecret,
          {
            expiresIn: "7d",
          }
        );
        userAccessToken = await this.userAccessTokenDao.create({
          user_id: user.id,
          access_token: accessToken,
          refresh_token: refreshToken,
          access_token_expires_at: Date.now() + 3600000,
          refresh_token_expires_at: Date.now() + 7 * 24 * 3600000,
        });
      }

      if (userAccessToken.access_token_expires_at < Date.now()) {
        const accessToken = jwt.sign({ uuid: user.uuid }, this.jwtSecret, {
          expiresIn: "1h",
        });
        userAccessToken = await this.userAccessTokenDao.update(
          userAccessToken.id,
          {
            access_token: accessToken,
            access_token_expires_at: Date.now() + 3600000,
          }
        );
      }

      return {
        status: 1,
        message: "user_found",
        data: { user, userAccessToken },
      };
    } catch (error: any) {
      return {
        status: 0,
        message: `${this.serviceName}.${functionName}: ${error.message}`,
      };
    }
  }

  public async refreshToken(refreshToken: string): Promise<any> {
    const functionName = `refreshToken`;
    const userTypeOrmDAO = new GenericDAO_TypeORM<User>("user");
    const userAccessTokenDAO = new GenericDAO_TypeORM<UserAccessToken>(
      "user_access_token"
    );

    refreshToken = refreshToken.replace(/"/g, "");

    console.log("Trying to refresh token with:", refreshToken);

    try {
      const refreshTokenSecret =
        process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";
      const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

      console.log(refreshTokenSecret, jwtSecret);

      const decoded: any = jwt.verify(refreshToken, refreshTokenSecret);
      const userUuid = decoded.uuid;

      const user = await userTypeOrmDAO.read({
        filters: { uuid: userUuid },
      });

      if (!user) return { status: 0, message: "user_not_found" };

      const userAccessToken = await userAccessTokenDAO.read({
        filters: { refresh_token: refreshToken, user_id: user?.id },
      });

      if (
        !userAccessToken ||
        userAccessToken.refresh_token_expires_at < Date.now()
      ) {
        return { status: 0, message: "invalid_or_expired_refresh_token" };
      }

      const newAccessToken = jwt.sign({ uuid: userUuid }, jwtSecret, {
        expiresIn: "1h",
      });

      await userAccessTokenDAO.update(userAccessToken.id, {
        access_token: newAccessToken,
        access_token_expires_at: Date.now() + 3600000, // 1 hour expiration
      });

      return { status: 1, data: { accessToken: newAccessToken } };
    } catch (error: any) {
      return {
        status: 0,
        message: `${this.serviceName}.${functionName}: ${error.message}`,
      };
    }
  }
}
