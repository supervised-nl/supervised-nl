import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const generalSans = localFont({
  src: "../public/fonts/GeneralSans-Variable.woff2",
  variable: "--font-general-sans",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Supervised Coach",
  description: "Wekelijkse AI-uitdagingen en vraagbaak voor je team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={generalSans.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
