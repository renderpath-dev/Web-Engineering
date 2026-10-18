export type EmptyResponse = {
  status: 204;
  body: undefined;
};

export function deleteSucceeded(): EmptyResponse {
  return { status: 204, body: undefined };
}
