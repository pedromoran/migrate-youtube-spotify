"use server";
import axios, { AxiosError } from "node_modules/axios";
import { cookies } from "node_modules/next/headers";
import { SpotifyCookieEnum } from "src/interfaces/spotify-cookies";
import { SpotifyUserProfile } from "src/interfaces/spotify/user-profile";

export async function getSpotifyUserProfile(): Promise<
  SpotifyUserProfile | null | "unauthorized"
> {
  const cookieStore = await cookies();
  const spotifyAccessToken = cookieStore.get(
    SpotifyCookieEnum.access_token,
  );
  const spotifyTokenType = cookieStore.get(
    SpotifyCookieEnum.token_type,
  );

  //TODO: send refresh token to a client component
  const spotifyRefreshToken = cookieStore.get(
    SpotifyCookieEnum.refresh_token,
  );

  let spotifyAuth = null;
  if (spotifyAccessToken && spotifyTokenType && spotifyRefreshToken) {
    spotifyAuth = {
      accessToken: spotifyAccessToken.value,
      refreshToken: spotifyRefreshToken.value,
      tokenType: spotifyTokenType.value,
    };
  }

  let spotifyUserProfile = null;
  if (spotifyAuth) {
    try {
      const res = await axios.get(
        process.env.NEXT_PUBLIC_SPOTIFY_ENDPOINT_SELF_USER_PROFILE ||
          "",
        {
          headers: {
            Authorization: `${spotifyAuth.tokenType} ${spotifyAuth.accessToken}`,
          },
        },
      );
      spotifyUserProfile = res.data;
    } catch (error) {
      const e = error as AxiosError<{
        error?: {
          status: number;
          message: string;
        };  
      }>;
      return "unauthorized";
    }

    return null;
  }

  return spotifyUserProfile;
}
