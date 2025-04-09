import { NextResponse, NextRequest } from "next/server";
import { getGoogleUserProfile } from "./services/youtube/getGoogleUserProfile";
import { getSpotifyUserProfile } from "./services/spotify/getSpotifyUserProfile";
import { cookies } from "next/headers";
import { SpotifyCookieEnum } from "./interfaces/spotify-cookies";
import { setGoogleAccessIntoCookies } from "./utils/setGoogleAccessIntoCookies";
import { getSpotifyAccessFromCookies } from "./utils/getSpotifyAccessFromCookies";
import { getGoogleAccessFromCookies } from "./utils/getGoogleAccessFromCookies";
import { refreshGoogleAccessToken } from "./utils/refreshGoogleAccessToken";
import { refreshSpotifyAccessToken } from "./utils/refreshSpotifyeAccessToken";
import { setSpotifyAccessIntoCookies } from "./utils/setSpotifyAccessIntoCookies";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const googleAuth = await getGoogleAccessFromCookies();
  const spotifyAuth = await getSpotifyAccessFromCookies();
  const cookieStore = await cookies();

  if (!googleAuth.access_token && googleAuth.refresh_token) {
    const auth = await refreshGoogleAccessToken(
      googleAuth.refresh_token,
    );
    if (auth) {
      setGoogleAccessIntoCookies({
        access_token: auth.access_token,
        token_type: auth.token_type,
        refresh_token: auth.refresh_token,
        expires_in: auth.expires_in,
      });
      return path === "/youtube-access"
        ? NextResponse.redirect(
            new URL(
              cookieStore.get("prev_url_path")?.value || "/",
              request.url,
            ),
          )
        : NextResponse.next();
    } else
      return path === "/youtube-access"
        ? NextResponse.next()
        : NextResponse.redirect(
            new URL("/youtube-access", request.url),
          );
  }

  if (!spotifyAuth.access_token && spotifyAuth.refresh_token) {
    const auth = await refreshSpotifyAccessToken(
      spotifyAuth.refresh_token,
    );
    if (auth) {
      setSpotifyAccessIntoCookies({
        access_token: auth.access_token,
        token_type: auth.token_type,
        refresh_token: auth.refresh_token,
        expires_in: auth.expires_in,
      });
      //* it'll be spotify-access when refreshing the page after granting access
      return path === "/spotify-access"
        ? NextResponse.redirect(
            new URL(
              cookieStore.get("prev_url_path")?.value || "/",
              request.url,
            ),
          )
        : NextResponse.next();
    } else
      return path === "/spotify-access"
        ? NextResponse.next()
        : NextResponse.redirect(
            new URL("/spotify-access", request.url),
          );
  }

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
  const googleAuth = await getGoogleAccessFromCookies();
  const spotifyAuth = await getSpotifyAccessFromCookies();

  if (!googleAuth.access_token && path.startsWith("/youtube")) {
    return path === "/youtube-access"
      ? NextResponse.next()
      : NextResponse.redirect(
          new URL("/youtube-access", request.url),
        );
  }

  if (!spotifyAuth.access_token && path.startsWith("/spotify")) {
    return path === "/spotify-access"
      ? NextResponse.next()
      : NextResponse.redirect(
          new URL("/spotify-access", request.url),
        );
  }

  let youtubeUserProfile = await getGoogleUserProfile({
    authorization: googleAuth.authorization,
    refresh_token: googleAuth.refresh_token!,
  });

  //* Refresh token if expired
  if (youtubeUserProfile === "token_expired") {
    const auth = await refreshGoogleAccessToken(
      googleAuth.refresh_token || "",
    );
    if (auth) {
      await setGoogleAccessIntoCookies({
        access_token: auth.access_token,
        token_type: auth.token_type,
      });
      youtubeUserProfile = await getGoogleUserProfile({
        authorization: `${auth.token_type} ${auth.access_token}`,
        refresh_token: auth.refresh_token,
      });
    }
  }

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
