import {
  Repository,
  ObjectLiteral,
  SelectQueryBuilder,
  FindOptionsWhere,
  DeepPartial,
  EntityManager,
  getConnection,
  QueryRunner,
  In,
} from "typeorm";
import { AppDataSource } from "../configs/TypeORM";
import { QueryParamsWithFilterForListType, QueryParamsWithFilterType, } from "../types/ControllerTypes";
import { randomUUID } from "crypto";
import { AdvanceFilterType, JoinConfigType } from "../types/GenericTypes";

interface BaseEntity {
  created_at?: number;
  updated_at?: number;
}

export class GenericDAO_TypeORM<T extends ObjectLiteral & BaseEntity> {
  private repository: Repository<T>;
  private entityName: string;

  constructor(entity: string) {
    this.entityName = entity;
    this.repository = AppDataSource.getRepository(entity);
  }

  private applyFilters(queryBuilder: any, filters?: Partial<T>) {
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        queryBuilder.andWhere(`${this.entityName}.${key} = :${key}`, {
          [key]: value,
        });
      });
    }
  }

  private applyAdvanceFilters<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    adFilters: AdvanceFilterType[]
  ): SelectQueryBuilder<T> {
    adFilters.forEach((filter, index) => {
      const parameterKey = `value${index}`;
      const { column, operator, value } = filter;

      switch (operator) {
        case "=":
        case ">":
        case ">=":
        case "<":
        case "<=":
        case "!=":
          queryBuilder.andWhere(`${column} ${operator} :${parameterKey}`, {
            [parameterKey]: value,
          });
          break;

        case "LIKE":
          queryBuilder.andWhere(`${column} LIKE :${parameterKey}`, {
            [parameterKey]: `%${value}%`,
          });
          break;

        case "LIKE %...%":
          queryBuilder.andWhere(`${column} LIKE :${parameterKey}`, {
            [parameterKey]: `%${value}%`,
          });
          break;

        case "NOT LIKE":
          queryBuilder.andWhere(`${column} NOT LIKE :${parameterKey}`, {
            [parameterKey]: `%${value}%`,
          });
          break;

        case "NOT LIKE %...%":
          queryBuilder.andWhere(`${column} NOT LIKE :${parameterKey}`, {
            [parameterKey]: `%${value}%`,
          });
          break;

        case "IN (...)":
          if (Array.isArray(value)) {
            queryBuilder.andWhere(`${column} IN (:...${parameterKey})`, {
              [parameterKey]: value,
            });
          }
          break;

        case "NOT IN (...)":
          if (Array.isArray(value)) {
            queryBuilder.andWhere(`${column} NOT IN (:...${parameterKey})`, {
              [parameterKey]: value,
            });
          }
          break;

        case "BETWEEN":
          if (Array.isArray(value) && value.length === 2) {
            queryBuilder.andWhere(
              `${column} BETWEEN :${parameterKey}Start AND :${parameterKey}End`,
              {
                [`${parameterKey}Start`]: value[0],
                [`${parameterKey}End`]: value[1],
              }
            );
          }
          break;

        case "NOT BETWEEN":
          if (Array.isArray(value) && value.length === 2) {
            queryBuilder.andWhere(
              `${column} NOT BETWEEN :${parameterKey}Start AND :${parameterKey}End`,
              {
                [`${parameterKey}Start`]: value[0],
                [`${parameterKey}End`]: value[1],
              }
            );
          }
          break;

        case "IS NULL":
          queryBuilder.andWhere(`${column} IS NULL`);
          break;

        case "IS NOT NULL":
          queryBuilder.andWhere(`${column} IS NOT NULL`);
          break;

        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    });

    return queryBuilder;
  }

  private applySorting(
    queryBuilder: any,
    sortField?: string,
    sortOrder?: "ASC" | "DESC"
  ) {
    if (sortField && sortOrder) {
      queryBuilder.orderBy(`${this.entityName}.${sortField}`, sortOrder);
    }
  }

  private selectColumns(queryBuilder: any, columns?: string[]) {
    if (columns && columns.length) {
      queryBuilder.select(
        columns.map((column) => `${this.entityName}.${String(column)}`)
      );
    }
  }

  private joinBuilder(
    queryBuilder: SelectQueryBuilder<T>,
    joins: JoinConfigType[]
  ) {
    joins.forEach((join) => {
      if (join.targetTableFilters && join.targetTableFilters.length) {
        const targetTableFilters = join.targetTableFilters?.reduce(
          (acc: { [key: string]: any }, filter) => {
            acc[filter.key] = filter.value;
            return acc;
          },
          {}
        );

        const onConditions = join.targetTableFilters
          .map((filter) => {
            return `${join.targetTable}.${filter.key} ${filter.operator} :${filter.key}`;
          })
          .join(" AND ");

        switch (join.type) {
          case "leftJoin":
            queryBuilder.leftJoinAndSelect(
              `${this.entityName}.${join.inColumn}`,
              join.targetTable,
              onConditions,
              targetTableFilters
            );
            break;
          case "innerJoin":
            queryBuilder.innerJoinAndSelect(
              `${this.entityName}.${join.inColumn}`,
              join.targetTable,
              onConditions,
              targetTableFilters
            );
            break;
        }
      } else {
        switch (join.type) {
          case "innerJoin":
            queryBuilder.innerJoin(
              `${this.entityName}.${join.inColumn}`,
              join.targetTable
            );
            break;
          case "leftJoin":
            queryBuilder.leftJoin(
              `${this.entityName}.${join.inColumn}`,
              join.targetTable
            );
            break;
        }
      }

      //this part should be refactored
      if (!join.targetTableColumns) {
        // queryBuilder.addSelect(`${join.targetTable}.id`);
      } else {
        queryBuilder.addSelect(
          join.targetTableColumns.map(
            (column) => `${join.targetTable}.${String(column)}`
          )
        );
      }
    });
  }

  async read({
    filters,
    sortField,
    sortOrder,
    columns,
    joins,
    relations,
    adFilters,
    getLatest,
  }: QueryParamsWithFilterType<T> & {
    joins?: JoinConfigType[];
    relations?: string[];
    adFilters?: AdvanceFilterType[];
    getLatest?: boolean;
  }): Promise<T | null> {
    const queryBuilder = this.repository.createQueryBuilder(this.entityName);
    if (joins) {
      this.joinBuilder(queryBuilder, joins);
    }
    this.applyFilters(queryBuilder, filters);

    if (getLatest) {
      queryBuilder.orderBy(`${this.entityName}.created_at`, "DESC");
      queryBuilder.limit(1);
    } else {
      this.applySorting(queryBuilder, sortField, sortOrder);
    }

    this.selectColumns(queryBuilder, columns);
    if (adFilters && adFilters.length > 0) {
      this.applyAdvanceFilters(queryBuilder, adFilters);
    }

    if (relations) {
      relations.forEach((relation) => {
        queryBuilder.leftJoinAndSelect(
          `${this.entityName}.${relation}`,
          relation
        );
      });
    }

    try {
      const data = await queryBuilder.getOne();

      if (!data) {
        return null;
      }
      return data;
    } catch (error: any) {
      console.log(`An error occurred while reading data:${error.message}`);
      return null;
    }
  }

  async readList({
    search,
    columns,
    filters,
    limit,
    offset,
    sortField,
    sortOrder,
    joins,
    relations,
    adFilters,
  }: QueryParamsWithFilterForListType<T> & {
    joins?: JoinConfigType[];
    relations?: string[];
    adFilters?: AdvanceFilterType[];
  }): Promise<T[]> {
    const queryBuilder = this.repository.createQueryBuilder(this.entityName);
    if (joins) {
      this.joinBuilder(queryBuilder, joins);
    }
    if (adFilters && adFilters.length > 0) {
      this.applyAdvanceFilters(queryBuilder, adFilters);
    }

    // 展開 relations
    if (relations) {
      relations.forEach((relationPath) => {
        const relationParts = relationPath.split('.');
        let parentAlias = this.entityName;
        let relationAlias = '';
  
        relationParts.forEach((part, index) => {
          const currentRelation = part;
          relationAlias = relationParts.slice(0, index + 1).join('_');
  
          const relationFullPath = `${parentAlias}.${currentRelation}`;
  
          // 检查是否已经加入了该关联，避免重复
          const isJoined = queryBuilder.expressionMap.joinAttributes.some(
            (join) => join.alias.name === relationAlias
          );
  
          if (!isJoined) {
            queryBuilder.leftJoinAndSelect(relationFullPath, relationAlias);
          }
  
          parentAlias = relationAlias; // 更新父级别的别名
        });
      });
    }

    this.applyFilters(queryBuilder, filters);
    this.selectColumns(queryBuilder, columns);

    if (search) {
      queryBuilder.andWhere(`${this.entityName} LIKE :search`, {
        search: `%${search}%`,
      });
    }

    if (limit) {
      queryBuilder.take(limit);
    }

    if (offset) {
      queryBuilder.skip(offset);
    }

    this.applySorting(queryBuilder, sortField, sortOrder);

    try {
      // console.log("queryBuilder", queryBuilder.getQueryAndParameters())
      const data = await queryBuilder.getMany();
      if (!data) {
        throw new Error("Data not found");
      }
      return data;
    } catch (error: any) {
      throw new Error(
        `An error occurred while reading list of data: ${error.message}`
      );
    }
  }

  async create(data: DeepPartial<T>, queryRunner?: QueryRunner): Promise<T> {
    try {
      const entity = queryRunner
        ? queryRunner.manager.create<T, DeepPartial<T>>(this.entityName, data)
        : this.repository.create(data);

      const res = queryRunner
        ? await queryRunner.manager.save(entity)
        : await this.repository.save(entity);
      return res;
    } catch (error: any) {
      console.log(error.message);
      throw new Error(`An error occurred while saving data: ${error.message}`);
    }
  }

  async batchCreate(data: Partial<T>[]): Promise<T[]> {
    try {
      // 使用條件型別判斷是否需要添加 `uuid`
      const createData = data.map((item) => {
        // 檢查 `T` 是否有 `uuid` 屬性
        if ("uuid" in item) {
          return {
            ...item,
            created_at: Date.now(),
            updated_at: Date.now(),
            uuid: randomUUID(), // 如果有 uuid 屬性，則添加 uuid
          };
        }
        return {
          ...item,
          created_at: Date.now(),
          updated_at: Date.now(),
        }; // 否則不添加 uuid
      });

      // 使用 TypeORM 的 DeepPartial<T> 型別適應 repository.save
      return await this.repository.save(createData as DeepPartial<T>[]);
    } catch (error: any) {
      throw new Error(`An error occurred while saving data: ${error.message}`);
    }
  }

  async batchUpsert(data: Partial<T>[], conflictKey: keyof T): Promise<T[]> {
    try {
      if (!conflictKey) {
        throw new Error("請提供一個衝突鍵");
      }

      const conflictKeyString = String(conflictKey);

      const upsertData = data.map((item) => {
        return {
          ...item,
          created_at: Date.now(),
          updated_at: Date.now(),
        };
      });

      if (upsertData.length === 0) {
        throw new Error("沒有資料需要 Upsert");
      }

      const updateFields = Object.keys(upsertData[0] || {}).filter(
        (key) => key !== conflictKeyString && key !== "created_at"
      );

      const queryBuilder = this.repository
        .createQueryBuilder()
        .insert()
        .into(this.entityName)
        .values(upsertData as DeepPartial<T>[])
        .orUpdate({
          overwrite: updateFields,
        });

      await queryBuilder.execute();

      const conflictValues = upsertData
        .map((item) => item[conflictKey])
        .filter((value) => value !== undefined) as any[];

      const where: FindOptionsWhere<T> = {
        [conflictKey]: In(conflictValues),
      } as FindOptionsWhere<T>;

      return await this.repository.find({
        where,
      });
    } catch (error: any) {
      console.error(`Error in batch upsert: ${error.message}`);
      throw new Error(
        `An error occurred while batch upserting data: ${error.message}`
      );
    }
  }

  async update(id: number, partialData: Partial<T>): Promise<T> {
    if (Object.keys(partialData).length === 0) {
      throw new Error("No data provided");
    }

    try {
      const existingData = await this.repository.findOne({
        where: { id: id as any },
      });
      if (!existingData) {
        throw new Error("Data not found");
      }

      const updatedData = await this.repository.save({
        ...existingData,
        ...partialData,
      });

      return updatedData;
    } catch (error: any) {
      throw new Error(
        `An error occurred while updating data: ${error.message}`
      );
    }
  }

  // async batchUpdate(data: Partial<T>[]): Promise<T[]> {
  //   try {
  //     return await this.repository.save(data as DeepPartial<T>[]);
  //   } catch (error: any) {
  //     console.error(`Error in batch update: ${error.message}`);
  //     throw new Error(`An error occurred while updating data: ${error.message}`);
  //   }
  // }

  async batchUpdate(data: Partial<T>[], conflictKey?: keyof T): Promise<T[]> {
    try {
      // 确定冲突键
      let conflictKeyString: string;
      if (conflictKey) {
        conflictKeyString = String(conflictKey);
      } else {
        // 如果未提供 conflictKey，使用主键
        const primaryColumns = this.repository.metadata.primaryColumns;
        if (primaryColumns.length !== 1) {
          throw new Error("实体必须有单一主键，或者请提供 conflictKey");
        }
        conflictKeyString = primaryColumns[0].propertyName;
      }

      const updatePromises = data.map((item) => {
        const criteria = {
          [conflictKeyString]: item[conflictKeyString],
        } as FindOptionsWhere<T>;

        return this.repository.update(criteria, {
          ...item,
          updated_at: Date.now(),
        });
      });
      await Promise.all(updatePromises);

      const conflictValues = data
        .map((item) => item[conflictKeyString])
        .filter((value) => value !== undefined) as any[];

      const where: FindOptionsWhere<T> = {
        [conflictKeyString]: In(conflictValues),
      } as FindOptionsWhere<T>;

      return await this.repository.find({ where });
    } catch (error: any) {
      console.error(`Error in batch update: ${error.message}`);
      throw new Error(
        `An error occurred while batch updating data: ${error.message}`
      );
    }
  }

  async softDelete(id: number): Promise<string> {
    try {
      await this.repository.softDelete(id);

      return "soft deleted";
    } catch (error: any) {
      throw new Error(
        `An error occurred while updating data: ${error.message}`
      );
    }
  }

  async countTotal({
    filters,
    search,
    joins,
    groupByColumns, // 新增的 groupBy 參數
  }: {
    filters?: any;
    search?: string;
    joins?: JoinConfigType[];
    groupByColumns?: string[]; // 定義 groupByColumns 的類型
  }): Promise<any> {
    // 修改返回類型為 any，以適應分組後的結果
    const queryBuilder = this.repository.createQueryBuilder(this.entityName);

    // 處理聯接
    if (joins) {
      this.joinBuilder(queryBuilder, joins);
    }

    // 應用過濾器
    this.applyFilters(queryBuilder, filters);

    // 應用搜索條件
    if (search) {
      queryBuilder.andWhere(`${this.entityName} LIKE :search`, {
        search: `%${search}%`,
      });
    }

    // 應用分組
    if (groupByColumns && groupByColumns.length > 0) {
      groupByColumns.forEach((column) => {
        queryBuilder.addGroupBy(`${this.entityName}.${column}`);
      });
      // 選擇分組欄位和計數
      queryBuilder.select([
        ...groupByColumns.map((column) => `${this.entityName}.${column}`),
        "COUNT(*) AS count",
      ]);
    }

    // 計算總數或分組後的計數
    try {
      if (groupByColumns && groupByColumns.length > 0) {
        const results = await queryBuilder.getRawMany();
        return results.map((result) => ({
          ...result,
          count: Number(result.count),
        }));
      } else {
        const total = await queryBuilder.getCount();
        return total;
      }
    } catch (error: any) {
      throw new Error(`在計算總數時發生錯誤: ${error.message}`);
    }
  }

  async calcSum({
    filters,
    joins,
    groupByColumns,
    sumColumns,
    groupByColumnsAlias,
    sumColumnsAlias,
  }: {
    filters?: any;
    joins?: JoinConfigType[];
    groupByColumns?: string[];
    sumColumns: string[];
    groupByColumnsAlias?: string[];
    sumColumnsAlias?: string[];
  }): Promise<any[]> {
    const queryBuilder = this.repository.createQueryBuilder(this.entityName);

    // 處理聯接
    if (joins) {
      this.joinBuilder(queryBuilder, joins);
    }

    // 應用過濾器
    this.applyFilters(queryBuilder, filters);

    // 應用分組
    if (groupByColumns && groupByColumns.length > 0) {
      groupByColumns.forEach((column) => {
        queryBuilder.addGroupBy(column); // 假設 groupByColumns 已包含表別名
      });
      // 選擇分組欄位
      const selectGroupBy = groupByColumns.map((column, index) => {
        if (groupByColumnsAlias && groupByColumnsAlias[index]) {
          return `${column} AS ${groupByColumnsAlias[index]}`;
        }
        return column;
      });
      queryBuilder.select(selectGroupBy);
    }

    // 應用加總
    if (sumColumns && sumColumns.length > 0) {
      sumColumns.forEach((column, index) => {
        const alias =
          sumColumnsAlias && sumColumnsAlias[index]
            ? sumColumnsAlias[index]
            : `sum_${column.split(".").pop()}`;
        queryBuilder.addSelect(`SUM(${column})`, alias);
      });
    }

    // 執行查詢並返回結果
    try {
      // 調試用，查看最終的 SQL 查詢
      // console.log(queryBuilder.getQuery());
      // console.log(queryBuilder.getParameters());

      const results = await queryBuilder.getRawMany();
      // 將加總結果轉換為數字類型
      return results.map((result) => {
        const transformedResult: any = {};
        groupByColumns?.forEach((column, index) => {
          const alias =
            groupByColumnsAlias && groupByColumnsAlias[index]
              ? groupByColumnsAlias[index]
              : column.includes(".")
              ? column.split(".").pop() ?? column
              : column;
          transformedResult[alias] = result[alias];
        });
        sumColumns.forEach((column, index) => {
          const alias =
            sumColumnsAlias && sumColumnsAlias[index]
              ? sumColumnsAlias[index]
              : `sum_${column.split(".").pop()}`;
          transformedResult[alias] = Number(result[alias]);
        });
        return transformedResult;
      });
    } catch (error: any) {
      throw new Error(`在計算加總時發生錯誤: ${error.message}`);
    }
  }

  async delete(id: number): Promise<string> {
    try {
      await this.repository.delete(id);
      return "deleted";
    } catch (error: any) {
      throw new Error(
        `An error occurred while deleting data: ${error.message}`
      );
    }
  }
}
