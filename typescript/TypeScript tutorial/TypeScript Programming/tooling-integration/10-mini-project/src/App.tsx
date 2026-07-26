import { formatProduct } from "./domain/product";

export function App() {
  const label = formatProduct({
    id: "p1",
    title: "Keyboard",
    priceCents: 9900,
  });

  return <p>{label}</p>;
}
