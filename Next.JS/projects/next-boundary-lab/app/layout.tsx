import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next Boundary Lab",
  description: "A Chapter 1 Next.js execution boundary learning project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
