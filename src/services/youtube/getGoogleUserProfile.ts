"use server";
import axios, { AxiosError } from "node_modules/axios";
import { getGoogleAccessFromCookies } from "../../utils/getGoogleAccessFromCookies";
import { cookies } from "node_modules/next/headers";
import { setGoogleAccessIntoCookies } from "src/utils/setGoogleAccessIntoCookies";

interface YoutubeChannelResponse {
  kind: string;
  etag: string;
  pageInfo: PageInfo;
  items: Item[];
}

interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

interface Item {
  kind: string;
  etag: string;
  id: string;
  snippet: Snippet;
}

interface Snippet {
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnails: Thumbnails;
  localized: Localized;
}

interface Thumbnails {
  default: Default;
  medium: Medium;
  high: High;
}

interface Default {
  url: string;
  width: number;
  height: number;
}

interface Medium {
  url: string;
  width: number;
  height: number;
}

interface High {
  url: string;
  width: number;
  height: number;
}

interface Localized {
  title: string;
  description: string;
}

export interface YoutubeUserProfile {
  title: string;
  description: string;
  customUrl: string;
  thumbnail: string;
}

export async function getGoogleUserProfile({
  authorization,
  refresh_token,
}: {
  authorization: string;
  refresh_token: string;
}): Promise<
  | YoutubeUserProfile
  | null
  | "token_expired"
  | "unauthenticated"
  | "unauthorized"
> {
  // const { authorization, refresh_token } =
  //   await getGoogleAccessFromCookies();
  const url = new URL(process.env.YOUTUBE_ENDPOINT_CHANNELS || "");

  url.searchParams.append("part", "snippet");
  url.searchParams.append("mine", "true");
  try {
    const response = await axios.get<YoutubeChannelResponse>(
      url.href,
      {
        headers: {
          authorization,
        },
      },
    );

    return {
      title: response.data.items[0].snippet.title,
      description: response.data.items[0].snippet.description,
      customUrl: response.data.items[0].snippet.customUrl,
      thumbnail:
        response.data.items[0].snippet.thumbnails.default.url,
    };
  } catch (error) {
    const e = error as AxiosError<{
      error: {
        status: string;
      };
    }>;
    if (
      e.response?.status === 403 &&
      e.response.data.error.status
        .toLowerCase()
        .includes("permission")
    ) {
      return "unauthorized";
    }

    if (
      e.response?.status === 401 &&
      e.response.data.error.status
        .toLowerCase()
        .includes("unauthenticated")
    ) {
      return "token_expired";
    }

    if (
      e.response?.status === 401 &&
      e.response.data.error.status
        .toLowerCase()
        .includes("unauthenticated")
    ) {
      return "unauthenticated";
    }
    // console.log(error.response?.data);
    return null;
  }
}

// To refresh an access token, your application sends an HTTPS POST request to Google's authorization server (https://oauth2.googleapis.com/token) that includes the following parameters:

// Fields
// client_id	The client ID obtained from the API Console.
// client_secret	The client secret obtained from the API Console.
// grant_type	As defined in the OAuth 2.0 specification, this field's value must be set to refresh_token.
// refresh_token	The refresh token returned from the authorization code exchange.
// The following snippet shows a sample request:

// POST /token HTTP/1.1
// Host: oauth2.googleapis.com
// Content-Type: application/x-www-form-urlencoded

// client_id=your_client_id&
// client_secret=your_client_secret&
// refresh_token=refresh_token&
// grant_type=refresh_token
