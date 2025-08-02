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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          crossOrigin="anonymous"
        />
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
              <link rel="stylesheet" href="/cadillac-theme.css" />
      </head>
      <body className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}


