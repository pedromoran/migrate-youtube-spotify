import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "node_modules/next/headers";
import "src/globals.css";
import { GoogleCookieEnum } from "./auth/google/cookies";
import { UserProfileProvider } from "./user-profile-provider";
import { getGoogleUserProfile } from "src/services/youtube/getGoogleUserProfile";
import { getSpotifyUserProfile } from "src/services/spotify/getSpotifyUserProfile";
import { getSpotifyAccessFromCookies } from "src/utils/getSpotifyAccessFromCookies";

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
  const { authorization } = await getSpotifyAccessFromCookies();
  const cookieStore = await cookies();

  const google_access_token = cookieStore.get(
    GoogleCookieEnum.access_token,
  )?.value;
  const google_refresh_token = cookieStore.get(
    GoogleCookieEnum.refresh_token,
  )?.value;
  const google_token_type = cookieStore.get(
    GoogleCookieEnum.token_type,
  )?.value;

  const gle = await getGoogleUserProfile({
    authorization: `${google_token_type} ${google_access_token}`,
    refresh_token: google_refresh_token!,
  });
  const sfy = await getSpotifyUserProfile(authorization);

  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased bg-[#151419] text-white`}
      >
        <UserProfileProvider
          googleUserProfile={typeof gle === "object" ? gle : null}
          spotifyUserProfile={typeof sfy === "object" ? sfy : null}
        >
          {children}
        </UserProfileProvider>
      </body>
    </html>
  );
}
