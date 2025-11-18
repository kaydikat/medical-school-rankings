import type { Metadata } from "next";
import "./globals.css"; // This import is crucial!

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
      <body className="antialiased"> 
        {children}
      </body>
    </html>
  );
}