"use server";
import axios, { AxiosError } from "node_modules/axios";
import { SpotifyUserProfile } from "src/interfaces/spotify/user-profile";
// import { getSpotifyAccessFromCookies } from "src/utils/getSpotifyAccessFromCookies";

export async function getSpotifyUserProfile(
  authorization: string,
): Promise<SpotifyUserProfile | null | "unauthorized"> {
  try {
    const { data } = await axios.get(
      process.env.NEXT_PUBLIC_SPOTIFY_ENDPOINT_SELF_USER_PROFILE ||
        "",
      {
        headers: {
          authorization,
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
