import { GenericDAO_TypeORM } from "../daos/GDAO_TypeORM";
import { User } from "../entities/User";

export class AuthService {
  private serviceName: string = "AuthService";

  private userDAO = new GenericDAO_TypeORM<User>("user");
  private generateOtpCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  public register (register: Partial<User>):Promise<boolean>{
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.userDAO.read({ filters: { email: register.email } });
        if (user) {
          reject("Email already registered");
        } else {
          const otpCode = this.generateOtpCode();
          const newUser = await this.userDAO.create({ ...register });
          if (newUser) {
            // send email with otp code
            resolve(true);
          } else {
            reject("Failed to register user");
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
