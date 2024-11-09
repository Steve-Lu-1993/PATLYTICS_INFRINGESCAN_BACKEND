import { ObjectLiteral } from "typeorm";
import { GenericDAO_TypeORM } from "../daos/GDAO_TypeORM";

interface BaseEntity {
  created_at?: number;
  updated_at?: number;
}


export class GenericService_TypeORM<T extends ObjectLiteral & BaseEntity> {
  private dao: GenericDAO_TypeORM<T>;

  constructor(entity: string) {
    this.dao = new GenericDAO_TypeORM<T>(entity);
  }

  read(queryParams: any): Promise<T | null> {
    return this.dao.read(queryParams);
  }

  create(data: T): Promise<T> {
    return this.dao.create(data);
  }
}
