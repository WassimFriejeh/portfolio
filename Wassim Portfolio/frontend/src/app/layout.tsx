import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import "./globals.css";

const albert = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:4410";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wassim Friejeh — Full-stack developer",
    template: "%s · Wassim Friejeh",
  },
  description:
    "Full-stack developer in Beirut, Lebanon. Websites, web applications, backend systems, and APIs.",
  openGraph: {
    title: "Wassim Friejeh — Full-stack developer",
    description:
      "Full-stack developer in Beirut, Lebanon. Websites, web applications, backend systems, and APIs.",
    type: "website",
    locale: "en_LB",
    url: siteUrl,
    siteName: "Wassim Friejeh",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={albert.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
