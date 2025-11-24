import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novahub Editor",
  description:
    "Editor web tipo VS Code: rápido, listo para compilar múltiples lenguajes y colaborar en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
