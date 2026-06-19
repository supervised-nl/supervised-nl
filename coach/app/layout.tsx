import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const generalSans = localFont({
  src: "../public/fonts/GeneralSans-Variable.woff2",
  variable: "--font-general-sans",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Supervised Coach",
  description: "Wekelijkse AI-uitdagingen en vraagbaak, afgestemd op de workshop van je team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={generalSans.variable}>
      <body className="antialiased">
        <div id="glow" aria-hidden="true" />
        <div id="noise" aria-hidden="true" />
        <div id="glow-pulses" aria-hidden="true">
          <span className="glow-pulse glow-pulse-1" />
          <span className="glow-pulse glow-pulse-2" />
          <span className="glow-pulse glow-pulse-3" />
          <span className="glow-pulse glow-pulse-4" />
          <span className="glow-pulse glow-pulse-5" />
        </div>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
