import { GenericDAO_TypeORM } from "../daos/GDAO_TypeORM";
import { User } from "../entities/User";
import { ServiceRes } from "../types/GenericTypes";

export class UserService {
  private serviceName: string = "UserService";
  private userDao = new GenericDAO_TypeORM<User>("user");

  public async getUserByUuid(userUuid: string): Promise<ServiceRes<User>> {
    const functionName = "getUserByUuid";
    try {
      const user = await this.userDao.read({ filters: { uuid: userUuid } });
      if (!user) {
        return { status: 0, message: "user_not_found" };
      }
      return { status: 1, message: "user_found", data: user };
    } catch (error: any) {
      throw new Error(`${this.serviceName}.${functionName}: ${error.message}`);
    }
  }
}
