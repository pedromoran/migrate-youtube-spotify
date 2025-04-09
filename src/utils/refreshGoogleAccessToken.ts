"use server";
import axios from "node_modules/axios";

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  refresh_token: string;
}
// NEXT_PUBLIC_GOOGLE_REFRESH_TOKEN_ENDPOINT

export async function refreshGoogleAccessToken(
  refresh_token: string,
): Promise<RefreshTokenResponse | null> {
  try {
    const response = await axios.post<RefreshTokenResponse>(
      process.env.NEXT_PUBLIC_GOOGLE_REFRESH_TOKEN_ENDPOINT || "",
      {
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token,
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
