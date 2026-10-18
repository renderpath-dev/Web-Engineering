export type Page<T> = {
  items: T[];
  nextCursor: string | null;
  limit: number;
};

export function createPage<T>(items: T[], limit: number, nextCursor: string | null): Page<T> {
  return { items, limit, nextCursor };
}
