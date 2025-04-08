"use server";

import axios from "node_modules/axios";
import { getGoogleAccessFromCookies } from "../../utils/getGoogleAccessFromCookies";

interface PlaylistItemsResponse {
  kind: string;
  etag: string;
  nextPageToken: string;
  items: Item[];
  pageInfo: PageInfo;
}

interface Item {
  kind: string;
  etag: string;
  id: string;
  snippet: Snippet;
  contentDetails: ContentDetails;
}

interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string | "Deleted video" | "Private video";
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: ResourceId;
  videoOwnerChannelTitle: string;
  videoOwnerChannelId: string;
}

interface Thumbnails {
  default?: Default;
  medium?: Medium;
  high?: High;
  standard?: Standard;
  maxres?: Maxres;
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

interface Standard {
  url: string;
  width: number;
  height: number;
}

interface Maxres {
  url: string;
  width: number;
  height: number;
}

interface ResourceId {
  kind: string;
  videoId: string;
}

interface ContentDetails {
  videoId: string;
  videoPublishedAt: string;
}

interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface YoutubePlaylistItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  artist: string;
  album: string;
  position: number;
}

function extractMetadata(title: string, description: string) {
  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const re = new RegExp(
    `${escapeRegExp(title)}[\\s\\S]*(?=[\\s\\S]℗\\s)`,
    "g",
  );
  const parts = description
    .match(re)?.[0]
    ?.replace(/\n\n/g, " · ")
    ?.split(" · ");
  const metadata = {
    album: "",
    artist: "",
  };
  metadata.artist = parts?.[1]?.trim() || "";
  metadata.album = parts?.[2]?.trim() || "";
  return metadata;
}

function formatYoutubePlaylistItems(
  prevLength: number,
  params: PlaylistItemsResponse["items"],
): YoutubePlaylistItem[] {
  return params
    .filter(
      p =>
        p.snippet.title.toLowerCase() !== "deleted video" &&
        p.snippet.title.toLowerCase() !== "private video",
    )
    .map((p, i) => {
      const { album, artist } = extractMetadata(
        p.snippet.title,
        p.snippet.description,
      );

      return {
        id: p.id,
        title: p.snippet.title
          .replace(/\([^)]*[Vv][Ii][Dd][Ee][Oo][^)]*\)/g, "")
          .replace(/\[[^)]*[Vv][Ii][Dd][Ee][Oo][^)]*\]/g, "")
          .replace(/\([^)]*[Ll][Yy][Rr][Ii][Cc][Ss]?[^)]*\)/g, "")
          .replace(/\[[^)]*[Ll][Yy][Rr][Ii][Cc][Ss]?[^)]*\]/g, "")
          .replace(/(?<=[(\s])[Ff][Tt]\.(?=[)\s])|:/g, "")
          .replace(/\([^)]*[Aa][Uu][Dd][Ii][Oo][^)]*\)/g, "")
          .replace(/\[[^)]*[Aa][Uu][Dd][Ii][Oo][^)]*\]/g, "")
          .replace(/[\(\)]/g, m => {
            if (m === "(") return "- ";
            if (m === ")") return "";
            return "";
          })
          .trim(),
        description: p.snippet.description,
        thumbnail: p.snippet.thumbnails.high?.url || "",
        album,
        artist,
        position: prevLength + i + 1,
      };
    });
}

export async function getPlaylistItems({
  position,
  playlistId,
}: {
  playlistId: string;
  position: number;
  // order: "newest_first" | "oldest_first" = "newest_first",
}): Promise<YoutubePlaylistItem[] | null> {
  const access = await getGoogleAccessFromCookies();
  let plItems: YoutubePlaylistItem[] = [];
  let total: number | null = null;
  const limit = 50;
  let currPage = 1;

  async function recursive(pageToken?: string) {
    try {
      const p = new URLSearchParams();
      p.append("part", "contentDetails,id,snippet");
      p.append("playlistId", playlistId);
      p.append("maxResults", limit.toString());
      if (pageToken) p.append("pageToken", pageToken);

      const res = await axios.get<PlaylistItemsResponse>(
        "https://www.googleapis.com/youtube/v3/playlistItems?" +
          p.toString(),
        {
          headers: {
            Authorization: `${access.token_type} ${access.access_token}`,
          },
        },
      );

      total = res.data.pageInfo.totalResults;
      plItems.push(...formatYoutubePlaylistItems(plItems.length, res.data.items)); //prettier-ignore

      // if (plItems.length >= total || plItems.length - 10 > position) {
      // if (isInRange) {
      //   if (currPage !== 1) {
      //     const start = plItems.length - 11 - limit;
      //     const end = plItems.length - 11;
      //     plItems = plItems.slice(start, end);
      //   }
      //   return;
      // }

      if (position > plItems.length) {
        currPage++;
        await recursive(res.data.nextPageToken);
      }
      plItems = plItems.slice(plItems.length - limit);
      return;
    } catch (error) {
      if (
        pageToken &&
        //@ts-expect-error: non-typed
        error.response?.data?.error?.message
          ?.toLowerCase()
          .includes("page")
      ) {
        return;
      }
      console.log(error);
      return null;
    }
  }

  if (!access) return null;
  await recursive();
  return plItems;
}
