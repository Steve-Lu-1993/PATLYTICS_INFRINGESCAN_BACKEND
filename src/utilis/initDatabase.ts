import { DataSource } from "typeorm";

// 初始化 TypeORM 數據庫
export const initializeTypeORMDatabase = (
  dataSource: DataSource,
  retryAttempts = 5,
  retryDelay = 2000
): void => {
  dataSource
    .initialize()
    .then(() => {
      console.log(
        `TypeORM database: ${dataSource.options.database} initialized`
      );
    })
    .catch((error) => {
      console.error("TypeORM database connection error:", error);
      if (retryAttempts > 0) {
        console.log(
          `Retrying to connect to TypeORM database... Attempts left: ${retryAttempts}`
        );
        setTimeout(
          () =>
            initializeTypeORMDatabase(
              dataSource,
              retryAttempts - 1,
              retryDelay
            ),
          retryDelay
        );
      } else {
        console.error(
          "Failed to connect to TypeORM database after several attempts."
        );
      }
    });
};