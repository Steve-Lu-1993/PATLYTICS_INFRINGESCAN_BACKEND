import { GenericDAO_TypeORM } from "../daos/GDAO_TypeORM";
import { User } from "../entities/User";
import { UserComparison } from "../entities/UserComparison";
import { ServiceRes } from "../types/GenericTypes";

export class UserComparisonService{
    private serviceName = "UserComparisonService";
    private userComparisonDao = new GenericDAO_TypeORM<UserComparison>("user_comparison");
    private userDao = new GenericDAO_TypeORM<User>("user");

    public async getListByUserUuid(userUuid: string): Promise<ServiceRes<UserComparison[]>> {
        const functionName = "getListByUserUuid";
        try {
            const user = await this.userDao.read({ filters: { uuid: userUuid }});
            if (!user) {
                return { status: 0, message: "user_not_found" };
            }
            const userComparisons = await this.userComparisonDao.readList({ filters: { user_id: user.id },relations:["patentCompanyComparison","patentCompanyComparison.company","patentCompanyComparison.patent"]  });
            if (!userComparisons) {
                return { status: 0, message: "user_comparisons_not_found" };
            }
            return { status: 1, message: "user_comparisons_found", data: userComparisons };
        } catch (error: any) {
            throw new Error(`${this.serviceName}.${functionName}: ${error.message}`);
        }
    }
    

}