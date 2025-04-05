"use server";
import axios, { AxiosError } from "node_modules/axios";
import { cookies } from "node_modules/next/headers";
import { SpotifyCookieEnum } from "src/interfaces/spotify-cookies";
import { SpotifyUserProfile } from "src/interfaces/spotify/user-profile";

export async function getSpotifyUserProfile(): Promise<
  SpotifyUserProfile | null | "unauthorized"
> {
  const cookieStore = await cookies();
  const auth = {
    accessToken: cookieStore.get(SpotifyCookieEnum.access_token)
      ?.value,
    refreshToken: cookieStore.get(SpotifyCookieEnum.refresh_token)
      ?.value,
    tokenType: cookieStore.get(SpotifyCookieEnum.token_type)?.value,
  };

  try {
    const { data } = await axios.get(
      process.env.NEXT_PUBLIC_SPOTIFY_ENDPOINT_SELF_USER_PROFILE ||
        "",
      {
        headers: {
          Authorization: `${auth.tokenType} ${auth.accessToken}`,
        },
      },
    );
    return data;
  } catch (error) {
    const e = error as AxiosError<{
      error?: {
        status: number;
        message: string;
      };
    }>;
    return "unauthorized";
  }
}
