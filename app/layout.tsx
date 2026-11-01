import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
export const metadata: Metadata = {
  title: "Asset Studio | Base64 Extractor",
  description: "Extract and download embedded Base64 assets from HTML files.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}


