import { Inter } from "next/font/google";
import "./globals.css";
import { metadata, viewport } from "./metadata";

const inter = Inter({ subsets: ["latin"] });

export { metadata, viewport };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

