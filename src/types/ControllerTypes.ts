export type QueryParamsType<T> = {
  offset?: number
  limit?: number
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
  columns?: string[];
};

export type QueryParamsForListType<T> = QueryParamsType<T> & {
  search?: string;
  offset?: number;
  limit?: number;
};

export type QueryParamsWithFilterType<T> = QueryParamsType<T> & {
  filters: Partial<T>;
};

export type QueryParamsWithFilterForListType<T> = QueryParamsForListType<T> & {
  uid?: string;
  filters: Partial<T>;
};
