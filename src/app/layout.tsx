import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Auth0Provider } from '@/components/Auth0Provider'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Neuro86",
  description: "Neuro86, support for meningioma patients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Auth0Provider>
            {children}
          </Auth0Provider>
      </body>
    </html>
  );
}
