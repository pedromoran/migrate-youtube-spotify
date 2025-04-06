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
  title: string;
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
  default: Default;
  medium: Medium;
  high: High;
  standard: Standard;
  maxres: Maxres;
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
  metadata.artist = parts?.[1].trim() || "";
  metadata.album = parts?.[2].trim() || "";
  return metadata;
}

function formatYoutubePlaylistItems(
  params: PlaylistItemsResponse["items"],
): YoutubePlaylistItem[] {
  return params.map(p => {
    const { album, artist } = extractMetadata(
      p.snippet.title,
      p.snippet.description,
    );

    return {
      id: p.id,
      title: p.snippet.title,
      description: p.snippet.description,
      thumbnail: p.snippet.thumbnails.high.url,
      album,
      artist,
    };
  });
}

export async function getPlaylistItems(
  playlistId: string,
): Promise<YoutubePlaylistItem[] | null> {
  const access = await getGoogleAccessFromCookies();
  if (!access) return null;
  try {
    const p = new URLSearchParams();
    p.append("part", "contentDetails,id,snippet");
    p.append("playlistId", playlistId);
    p.append("maxResults", "20");

    const { data } = await axios.get<PlaylistItemsResponse>(
      "https://www.googleapis.com/youtube/v3/playlistItems?" +
        p.toString(),
      {
        headers: {
          Authorization: `${access.token_type} ${access.access_token}`,
        },
      },
    );
    return formatYoutubePlaylistItems(data.items);
  } catch (error) {
    return null;
  }
}
