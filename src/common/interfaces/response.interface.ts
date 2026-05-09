export interface IResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface IPaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
