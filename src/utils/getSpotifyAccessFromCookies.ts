"use server";
import { cookies } from "node_modules/next/headers";
import { SpotifyCookieEnum } from "src/interfaces/spotify-cookies";

export async function getSpotifyAccessFromCookies() {
  const cookieStore = await cookies();
  const refresh_token = cookieStore.get(
    SpotifyCookieEnum.refresh_token,
  )?.value;
  const access_token = cookieStore.get(
    SpotifyCookieEnum.access_token,
  )?.value;

  const token_type = cookieStore.get(
    SpotifyCookieEnum.token_type,
  )?.value;

  return {
    access_token,
    refresh_token,
    token_type,
    authorization: `${token_type} ${access_token}`,
  };
}
