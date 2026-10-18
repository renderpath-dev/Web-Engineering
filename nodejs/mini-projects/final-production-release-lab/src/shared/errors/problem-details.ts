export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  requestId: string;
  code: string;
}

export function createProblemDetails(input: {
  status: number;
  title: string;
  detail: string;
  instance: string;
  requestId: string;
  code: string;
}): ProblemDetails {
  return {
    type: "about:blank",
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: input.instance,
    requestId: input.requestId,
    code: input.code
  };
}
