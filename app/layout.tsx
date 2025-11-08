import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "AI at Work — Human Productivity ROI",
  description:
    "Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
