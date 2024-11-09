import { GenericDAO_TypeORM } from "../daos/GDAO_TypeORM";
import { Company } from "../entities/Company";
import { Product } from "../entities/Product";
import { ServiceRes } from "../types/GenericTypes";

export class CompanyService {
  private serviceName: string = "CompanyService";

  private companyDao = new GenericDAO_TypeORM<Company>("company");

  public async getCompanies(): Promise<ServiceRes<Company[]>> {
    const functionName = "getCompanies";
    try {
      const companies = await this.companyDao.readList({ filters: {} });
      if (!companies) {
        return { status: 0, message: "companies_lookup_failed" };
      }
      return { status: 1, message: "companies_found", data: companies };
    } catch (error: any) {
      return {
        status: 0,
        message: `${this.serviceName}.${functionName}: ${error.message}`,
      };
    }
  }

  public async getCompanyProducts(
    company_id: number
  ): Promise<ServiceRes<Product[]>> {
    const functionName = "getCompanyProducts";
    try {
      const company = await this.companyDao.read({
        filters: { id: company_id },
        relations: ["products"],
      });
      if (!company) {
        return { status: 0, message: "company_not_found" };
      }
      if (company.products.length === 0) {
        return { status: 0, message: "company_products_not_found" };
      }
      return {
        status: 1,
        message: "company_products_found",
        data: company.products,
      };
    } catch (error: any) {
      return {
        status: 0,
        message: `${this.serviceName}.${functionName}: ${error.message}`,
      };
    }
  }
}
