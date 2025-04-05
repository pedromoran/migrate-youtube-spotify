"use server";
import axios, { AxiosError } from "node_modules/axios";
import { getGoogleAccessFromCookies } from "../../utils/getGoogleAccessFromCookies";

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

export async function getYoutubeUserProfile(): Promise<
  YoutubeUserProfile | null | "unauthorized"
> {
  const { authorization } = await getGoogleAccessFromCookies();
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
    // console.log(error.response?.data);
    return null;
  }
}
