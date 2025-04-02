import { cookies } from "next/headers";
import { YoutubeToSpotify } from "src/components/YoutubeToSpotify";
import { SpotifyCookieEnum } from "./auth/spotify/cookies/interfaces";
import { GoogleCookieEnum } from "./auth/google/cookies";
import axios, { AxiosError } from "axios";
import { removeSpotifyCookies } from "src/utils/removeSpotifyCookies";
import { getSelfChannel } from "src/services/youtube/getSelfChannel";

export default async function AppPage() {
  const cookieStore = await cookies();
  const youtubeAccessToken = cookieStore.get(
    GoogleCookieEnum.access_token,
  );
  const youtubeTokenType = cookieStore.get(
    GoogleCookieEnum.token_type,
  );
  //TODO: send refresh token to a client component
  const youtubeRefreshToken = cookieStore.get(
    GoogleCookieEnum.refresh_token,
  );

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

  let youtubeAuth = null;
  if (youtubeAccessToken && youtubeTokenType && youtubeRefreshToken) {
    youtubeAuth = {
      accessToken: youtubeAccessToken.value,
      refreshToken: youtubeRefreshToken.value,
      tokenType: youtubeTokenType.value,
    };
  }

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

      const spotifyHasExpiredToken = !!e.response?.data.error?.message
        .toLowerCase()
        .includes("expired");

      // if (hasExpiredToken) deleteSpotifyCookies();
    }
  }
  // async function deleteSpotifyCookies() {
  //   "use server";
  //   const cookieStore = await cookies();
  //   cookieStore.delete(SpotifyCookieEnum.access_token);
  //   cookieStore.delete(SpotifyCookieEnum.token_type);
  //   cookieStore.delete(SpotifyCookieEnum.refresh_token);
  // }

  // if (spotifyHasExpiredToken) {
  //   deleteSpotifyCookies();
  // }

  const youtubeChannel = await getSelfChannel();

  return (
    <div className="min-h-screen">
      <main className="w-full flex flex-col items-center py-16 space-y-10">
        <YoutubeToSpotify
          spotify={{
            userProfile: spotifyUserProfile,
          }}
          youtube={{
            channel: youtubeChannel,
          }}
        />
      </main>
    </div>
  );
}
