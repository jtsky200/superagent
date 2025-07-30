import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CADILLAC EV CIS - Customer Intelligence System",
  description: "Customer Intelligence System für CADILLAC Elektrofahrzeuge in der Schweiz",
  keywords: ["CADILLAC", "EV", "Elektrofahrzeuge", "Schweiz", "CRM", "TCO"],
  authors: [{ name: "CADILLAC Switzerland" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}

