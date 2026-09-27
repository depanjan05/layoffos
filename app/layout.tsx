import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "./components/site-nav";

export const metadata: Metadata = {
  title: "LayoffOS — Your Recovery Operating System",
  description:
    "A practical operating system for what comes after a layoff.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
