import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Auth0Provider } from '@auth0/auth0-react'

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
  if (!process.env.NEXT_PUBLIC_AUTH0_DOMAIN || !process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID) {
    throw new Error('Missing Auth0 environment variables');
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Auth0Provider
          domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
          clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
          authorizationParams={{
            redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
            audience: "https://dev-yh7epi8p8mkinedt.us.auth0.com/api/v2/",
            scope: "openid profile email offline_access"
          }}
        >
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}
