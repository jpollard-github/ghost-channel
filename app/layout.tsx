import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Ghost Channel", description: "A calm, data-driven ambient broadcast.", applicationName: "Ghost Channel", manifest: "/manifest.webmanifest", icons: [{ rel: "icon", url: "/icons/icon.svg" }] };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#101418" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
