// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI at Work — ROI",
  description: "Human productivity ROI model for AI training",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
