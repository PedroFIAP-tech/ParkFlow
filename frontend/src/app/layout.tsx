import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParkFlow",
  description: "Central operacional inteligente para ocorrencias veiculares"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

