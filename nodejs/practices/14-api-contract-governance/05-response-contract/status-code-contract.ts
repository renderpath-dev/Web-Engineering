export type ResponseStatus = 200 | 201 | 204 | 400 | 401 | 404 | 409 | 500;

export function statusClass(status: ResponseStatus): string {
  return `${Math.floor(status / 100)}xx`;
}
