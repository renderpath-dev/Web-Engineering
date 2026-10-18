import type { ApiClientConfig, ApiResult, FetchLike, VersionResponse } from "./api-client.types.js";
import { parseProblemResponse } from "./problem-parser.js";
import { buildRequest, type RequestOptions } from "./request-builder.js";

export class ContractNotesClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;
  private readonly csrfToken: string | undefined;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.fetchImpl = config.fetch ?? fetch;
    this.csrfToken = config.csrfToken;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    const request = buildRequest(this.baseUrl, path, {
      ...options,
      csrfToken: options.csrfToken ?? this.csrfToken
    });
    const response = await this.fetchImpl(request.url, request.init);
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        problem: await parseProblemResponse(response)
      };
    }

    return {
      ok: true,
      status: response.status,
      data: (await response.json()) as T
    };
  }

  getVersion(): Promise<ApiResult<VersionResponse>> {
    return this.request<VersionResponse>("/v1/version");
  }
}
