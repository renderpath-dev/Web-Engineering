export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export function formatProduct(product: ProductRecord): string {
  return `${product.title}:${(product.priceCents / 100).toFixed(2)}`;
}
