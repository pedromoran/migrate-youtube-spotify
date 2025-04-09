"use server";
import axios, { AxiosRequestConfig } from "node_modules/axios";

interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: 3600;
  refresh_token: string;
  scope: string;
}
// NEXT_PUBLIC_GOOGLE_REFRESH_TOKEN_ENDPOINT

export async function refreshSpotifyAccessToken(
  refresh_token: string,
): Promise<RefreshTokenResponse | null> {
  // const authOptions = {
  //   url: "https://accounts.spotify.com/api/token",
  //   headers: {
  //     "content-type": "application/x-www-form-urlencoded",
  //     Authorization:
  //       "Basic " +
  //       Buffer.from(
  //         process.env.SPOTIFY_CLIENT_ID! +
  //           ":" +
  //           process.env.SPOTIFY_CLIENT_SECRET!,
  //       ).toString("base64"),
  //   },
  //   form: {},
  //   json: true,
  // };

  const config: AxiosRequestConfig = {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(process.env.SPOTIFY_CLIENT_ID! + ":" + process.env.SPOTIFY_CLIENT_SECRET!).toString("base64"), //prettier-ignore
    },
  };

  try {
    const response = await axios.post(
      process.env.SPOTIFY_ENDPOINT_TOKEN!,
      {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        config,
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
