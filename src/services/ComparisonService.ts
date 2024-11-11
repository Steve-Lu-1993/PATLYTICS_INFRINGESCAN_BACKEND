import { randomUUID } from "crypto";
import { OpenAiLMService } from "../apis/LLM/openai/main";
import { GenericDAO_TypeORM } from "../daos/GDAO_TypeORM";
import { Company } from "../entities/Company";
import { Patent } from "../entities/Patent";
import { PatentCompanyComparison } from "../entities/PatentCompanyComparison";
import { UserComparison } from "../entities/UserComparison";
import { ServiceRes } from "../types/GenericTypes";
import { User } from "../entities/User";

export class ComparisonService {
    private serviceName: string = "ComparisonService";

    private comparisonDao = new GenericDAO_TypeORM<PatentCompanyComparison>("patent_company_comparison");
    private companyDao = new GenericDAO_TypeORM<Company>("company");
    private patentDao = new GenericDAO_TypeORM<Patent>("patent");
    private userDao = new GenericDAO_TypeORM<User>("user");
    private userComparisonDao = new GenericDAO_TypeORM<UserComparison>("user_comparison");
    private openAiLMService = new OpenAiLMService();

    public async getComparisonByUuid(uuid: string): Promise<ServiceRes<PatentCompanyComparison>> {
        const functionName = "getComparisonByUuid";
        try {
            const comparison = await this.comparisonDao.read({ filters: { uuid },relations:["patent","company"] });
            if (!comparison) {
                return { status: 0, message: "comparison_not_found" };
            }
            return { status: 1, message: "comparison_found", data: comparison };
        } catch (error: any) {
            return { status: 0, message: `${this.serviceName}.${functionName}: ${error.message}` };
        }
    }

    public async getOrCreateComparisonByUser(user_uuid:string,company_uuid:string,publication_number:string):Promise<ServiceRes<{comparison:PatentCompanyComparison,company:Company,patent:Patent}>>{
        const functionName = "getOrCreateComparisonByUser";

        try {
            const user = await this.userDao.read({filters:{uuid:user_uuid}})
            if(!user){
                return {status:0,message:"user_not_found"}
            }

           const comparison = await this.getOrCreateComparison(company_uuid,publication_number)
              if(comparison.status === 0 || comparison.data === undefined){
                return {status:0,message:`comparison_not_found_or_creation_failed:${comparison.message}`}
              }
            const userComparison = await this.userComparisonDao.read({filters:{user_id:user.id,patent_company_comparison_id:comparison.data.comparison.id}})
            if(!userComparison){
                const newUserComparison = await this.userComparisonDao.create({uuid:randomUUID(),user_id:user.id,patent_company_comparison_id:comparison.data.comparison.id})
                if(!newUserComparison){
                    return {status:0,message:"user_comparison_creation_failed"}
                }
            }
            return {status:1,message:"user_comparison_created",data:comparison.data}

        } catch (error:any) {
            return {status:0,message:`${this.serviceName}.${functionName}: ${error.message}`}
            
        }

    }

    public async getOrCreateComparison(company_uuid:string,publication_number:string):Promise<ServiceRes<{comparison:PatentCompanyComparison,company:Company,patent:Patent}>>{
        
        const functionName = "getOrCreateComparison";
        try {
            const company = await this.companyDao.read({ filters: { uuid: company_uuid } });
            if (!company) {
                return { status: 0, message: "company_not_found" };
            }
            const patent = await this.patentDao.read({ filters: { publication_number: publication_number } });
            if (!patent) {
                return { status: 0, message: "patent_not_found" };
            }
            const comparison = await this.comparisonDao.read({ filters: { company_id: company.id, patent_id: patent.id } });
            if (!comparison) {
                const newComparison = await this.createComparison(company_uuid, publication_number);
                if (newComparison.status === 0 || newComparison.data === undefined) {
                    return { status: 0, message: `comparison_creation_failed:${newComparison.message}}` };
                }
                return { status: 1, message: "comparison_created", data: { comparison: newComparison.data, company, patent } };
            }
            return { status: 1, message: "comparison_found", data: { comparison, company, patent } };
        } catch (error: any) {
            return { status: 0, message: `${this.serviceName}.${functionName}: ${error.message}` };
        }
    }

    public async createComparison(company_uuid:string,publication_number:string):Promise<ServiceRes<PatentCompanyComparison>>{
        const functionName = "createComparison";
        try {
            const company = await this.companyDao.read({ filters: { uuid: company_uuid },relations:["products"] });
            if (!company) {
                return { status: 0, message: "company_not_found" };
            }
            const companyProducts = company.products.map(p=>{
                return {
                    id:p.id,
                    name:p.name,
                    description:p.description
                }
            })

            const patent = await this.patentDao.read({ filters: { publication_number: publication_number } });
            if (!patent) {
                return { status: 0, message: "patent_not_found" };
            }

            const aiComparison = await this.openAiLMService.getComparisonResult(patent.description,companyProducts)
            if (aiComparison.status === 0 || aiComparison.data === undefined) {
                return { status: 0, message: `ai_comparison_failed:${aiComparison.message}` };
            }

            const productIds = aiComparison.data.map(product => product.id);
            const newComparison:Partial<PatentCompanyComparison> = {
                // created_at:Date.now(),
                // updated_at:Date.now(),
                uuid:randomUUID(),
                company_id:company.id,
                patent_id:patent.id,
                comparison_results:aiComparison.data,
                potential_infringement_product_ids:productIds
            }
            console.log("newComparison",newComparison)
            const comparison = await this.comparisonDao.create(newComparison);
            if (!comparison) {
                return { status: 0, message: "comparison_creation_failed" };
            }
            return { status: 1, message: "comparison_created", data: comparison };
        } catch (error: any) {
            return { status: 0, message: `${this.serviceName}.${functionName}: ${error.message}` };
        }
    }
}