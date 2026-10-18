export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code: string;
};

export type ApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

export type ApiFailure = {
  ok: false;
  status: number;
  problem: ProblemDetails;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type ApiClientConfig = {
  baseUrl: string;
  fetch?: FetchLike;
  csrfToken?: string;
};

export type VersionResponse = {
  apiVersion: string;
  openapi: string;
  deprecatedOperations: string[];
};
