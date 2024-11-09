import { GenericDAO_TypeORM } from "../daos/GDAO_TypeORM";
import { Patent } from "../entities/Patent";
import { QueryParamsWithFilterForListType } from "../types/ControllerTypes";
import {
  AdvanceFilterType,
  JoinConfigType,
  ServiceRes,
} from "../types/GenericTypes";

export class PatentService {
  private serviceName: string = "PatentService";

  private patentDao = new GenericDAO_TypeORM<Patent>("patent");

  public async getPatents(
    keyword?: string
  ): Promise<ServiceRes<Partial<Patent>[]>> {
    const functionName = "getPatents";
    try {
      const filterCondition: QueryParamsWithFilterForListType<Patent> & {
        joins?: JoinConfigType[];
        relations?: string[];
        adFilters?: AdvanceFilterType[];
      } = keyword
        ? {
            filters: {},
            adFilters: [
              {
                column: "publication_number",
                operator: "LIKE",
                value: keyword,
              },
            ],
            columns:["id","publication_number","title"],
            limit:10
          }
        : { filters: {}, limit: 10,columns:["id","publication_number","title"] };

      const patents = await this.patentDao.readList(filterCondition);
      if (!patents) {
        return { status: 0, message: "patents_lookup_failed" };
      }

      return { status: 1, message: "patents_found", data: patents };
    } catch (error: any) {
      return { status: 0, message: `${this.serviceName}.${functionName}: ${error.message}` };
    }
  }

  public async getPatentByPublicationNumber(publication_number:string):Promise<ServiceRes<Patent>>{
    const functionName = "getPatentByPublicationNumber";

    try {
        const patent = await this.patentDao.read({filters:{publication_number}});
        if(!patent){
            return {status:0, message:"patent_not_found"};
        }
        return {status:1, message:"patent_found", data:patent};
    } catch (error:any) {
        return {status:0, message:`${this.serviceName}.${functionName}: ${error.message}`};
    }

  }
}
