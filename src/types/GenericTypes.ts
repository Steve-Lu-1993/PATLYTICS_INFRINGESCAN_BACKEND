export type readParamsType = {
  search?: string;
  filters?: { [key: string]: any };
  first?: number;
  rows?: number;
  getOne?: boolean;
  distinct?: string;
  sortField?: string;
  sortOrder?: string;
  columns?: string[];
  joins?: JoinConfigType[];
  nests?: NestConfigType[];
  nestsTotal?: boolean;
};

export type JoinConfigType = {
  inColumn: string;
  type: "innerJoin" | "leftJoin";
  targetTable: string;
  targetTableFilters?: targetTableFilterType[];
  targetTableColumns?: string[];
};

type targetTableFilterType = {
  key: string;
  value: string;
  operator: string;
};

export type JoinColumnType = {
  original: string;
  alias?: string;
};

export type MergeColumnsAsKeyConfigType = {
  table: string;
  column: string;
};

export type AndOnConfigType = {
  table?: string;
  column: string;
  value?: string;
  operator?: string;
};

export type NestConfigType = {
  table: string;
  key: string;
  columns?: string[];
  steps?: (JoinConfigType | CoalesceConfigType)[];
};

export type CoalesceConfigType = {
  type: "coalesce";
  mergeColumns?: string[];
  mergedName?: string;
};

export type DynamicObjectType = {
  [key: string]: number | string;
};

type Operator =
  | "="
  | ">"
  | ">="
  | "<"
  | "<="
  | "!="
  | "LIKE"
  | "LIKE %...%"
  | "NOT LIKE"
  | "NOT LIKE %...%"
  | "IN (...)"
  | "NOT IN (...)"
  | "BETWEEN"
  | "NOT BETWEEN"
  | "IS NULL"
  | "IS NOT NULL";

export type AdvanceFilterType = {
  column: string;
  operator: Operator;
  value: any;
};

export type ServiceRes<T> = {
  status: number;
  message: string;
  data?: T;
};
