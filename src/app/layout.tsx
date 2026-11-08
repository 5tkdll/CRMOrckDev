import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "CRM ORCK DEV", description: "CRM interno da ORCK DEV" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
