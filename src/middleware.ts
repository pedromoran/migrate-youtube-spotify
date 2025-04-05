import { NextResponse, NextRequest } from "next/server";
import { getYoutubeUserProfile } from "./services/youtube/getYoutubeUserProfile";
import { getSpotifyUserProfile } from "./services/spotify/getSpotifyUserProfile";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/youtube-to-spotify") {
    const youtubeUserProfile = await getYoutubeUserProfile();

    if (youtubeUserProfile === "unauthorized") {
      return NextResponse.redirect(
        new URL("/youtube-access", request.url),
      );
    }

    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/spotify-to-youtube") {
    const spotifyUserProfile = await getSpotifyUserProfile();

    if (spotifyUserProfile === "unauthorized") {
      return NextResponse.redirect(
        new URL("/spotify-access", request.url),
      );
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/youtube-to-spotify", "/spotify-to-youtube"],
};
