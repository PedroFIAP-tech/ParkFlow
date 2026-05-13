import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParkFlow Security AI",
  description: "Central privada de seguranca operacional para estacionamentos"
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
