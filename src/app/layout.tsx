import type { Metadata } from "next";
// The Geist font imports are now completely removed.
import "./globals.css";

export const metadata: Metadata = {
  title: "Medical School Rankings", 
  description: "Interactive crowdsourced medical school rankings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Ensure you remove the font-related classNames entirely */}
      <body className="antialiased"> 
        {children}
      </body>
    </html>
  );
}