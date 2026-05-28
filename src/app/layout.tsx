import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayPals AI",
  description: "A Supabase-backed AI chat companion starter app.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
