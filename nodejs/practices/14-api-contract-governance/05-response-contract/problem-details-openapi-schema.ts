export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code: string;
};

export function createProblem(status: number, code: string, detail: string): ProblemDetails {
  return {
    type: `https://example.test/problems/${code}`,
    title: code,
    status,
    detail,
    code
  };
}
