import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "node_modules/next/headers";
import "src/globals.css";
import { GoogleCookieEnum } from "./auth/google/cookies";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Migrate YouTube-Spotify",
  description: "",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const cookieStore = await cookies();
  // const youtubeAccessToken = cookieStore.get(
  //   GoogleCookieEnum.access_token,
  // );
  // console.log(youtubeAccessToken);

  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased bg-[#151419] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
