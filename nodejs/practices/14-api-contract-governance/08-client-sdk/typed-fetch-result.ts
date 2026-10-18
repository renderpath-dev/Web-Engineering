export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; problem: { title: string; status: number; code: string } };

export function unwrapResult<T>(result: ApiResult<T>): T {
  if (!result.ok) throw new Error(result.problem.code);
  return result.data;
}
