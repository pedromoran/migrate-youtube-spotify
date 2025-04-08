import { NextResponse, NextRequest } from "next/server";
import { getGoogleUserProfile } from "./services/youtube/getGoogleUserProfile";
import { getSpotifyUserProfile } from "./services/spotify/getSpotifyUserProfile";
import { cookies } from "next/headers";
import { SpotifyCookieEnum } from "./interfaces/spotify-cookies";
import { GoogleCookieEnum } from "./app/auth/google/cookies";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/youtube")) return youtubeRoute(request);
  if (path.startsWith("/spotify")) return spotifyRoute(request);

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/youtube-access",
    "/youtube-to-spotify",
    "/spotify-access",
    "/spotify-to-youtube",
  ],
};

async function youtubeRoute(request: NextRequest) {
  "use server";
  const path = request.nextUrl.pathname;
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

  const youtubeUserProfile = await getGoogleUserProfile({
    authorization: `${google_token_type} ${google_access_token}`,
    refresh_token: google_refresh_token!,
  });

  const spotify_token_type = cookieStore.get(
    SpotifyCookieEnum.token_type,
  )?.value;
  const spotify_access_token = cookieStore.get(
    SpotifyCookieEnum.access_token,
  )?.value;

  const spotifyUserProfile = await getSpotifyUserProfile(
    `${spotify_token_type} ${spotify_access_token}`,
  );

  if (path === "/youtube-access") {
    if (typeof youtubeUserProfile === "string")
      return NextResponse.next();
    if (typeof youtubeUserProfile === "object") {
      if (typeof spotifyUserProfile === "string")
        return NextResponse.redirect(
          new URL("/spotify-access", request.url),
        );

      return NextResponse.redirect(
        new URL(
          cookieStore.get("prev_url_path")?.value || "/",
          request.url,
        ),
      );
    }
  }

  if (typeof youtubeUserProfile === "string") {
    cookieStore.set("prev_url_path", path);
    return NextResponse.redirect(
      new URL("/youtube-access", request.url),
    );
  }

  if (typeof spotifyUserProfile === "string")
    return NextResponse.redirect(
      new URL("/spotify-access", request.url),
    );

  return NextResponse.next();
}

async function spotifyRoute(request: NextRequest) {
  "use server";
  const path = request.nextUrl.pathname;
  const cookieStore = await cookies();
  const access_token = cookieStore.get(
    SpotifyCookieEnum.access_token,
  )?.value;
  const token_type = cookieStore.get(
    SpotifyCookieEnum.token_type,
  )?.value;
  const spotifyUserProfile = await getSpotifyUserProfile(
    `${token_type} ${access_token}`,
  );

  if (path === "/spotify-access") {
    if (typeof spotifyUserProfile === "string")
      return NextResponse.next();
    if (typeof spotifyUserProfile === "object")
      return NextResponse.redirect(
        new URL(
          cookieStore.get("prev_url_path")?.value || "/",
          request.url,
        ),
      );
  }

  if (typeof spotifyUserProfile === "string") {
    cookieStore.set("prev_url_path", path);
    return NextResponse.redirect(
      new URL("/spotify-access", request.url),
    );
  }

  return NextResponse.next();
}

export async function getGoogleAccessFromCookies() {
  const cookieStore = await cookies();
  const access_token = cookieStore.get(
    GoogleCookieEnum.access_token,
  )?.value;
  const refresh_token = cookieStore.get(
    GoogleCookieEnum.refresh_token,
  )?.value;
  const token_type = cookieStore.get(
    GoogleCookieEnum.token_type,
  )?.value;
  return {
    access_token,
    refresh_token,
    token_type,
    authorization: `${token_type} ${access_token}`,
  };
}
