"use server";

import axios from "node_modules/axios";
import { getGoogleAccessFromCookies } from "../../app/auth/google/getGoogleAccessFromCookies";

// process.env.YOUTUBE_ENDPOINT_PLAYLISTS

// Parameters
// Required parameters
// part	string
// The part parameter specifies a comma-separated list of one or more playlist resource properties that the API response will include.

// If the parameter identifies a property that contains child properties, the child properties will be included in the response. For example, in a playlist resource, the snippet property contains properties like author, title, description, and timeCreated. As such, if you set part=snippet, the API response will contain all of those properties.

// The following list contains the part names that you can include in the parameter value:
// contentDetails
// id
// localizations
// player
// snippet
// status

// Response
// If successful, this method returns a response body with the following structure:

// {
//   "kind": "youtube#playlistListResponse",
//   "etag": etag,
//   "nextPageToken": string,
//   "prevPageToken": string,
//   "pageInfo": {
//     "totalResults": integer,
//     "resultsPerPage": integer
//   },
//   "items": [
//     playlist Resource
//   ]
// }

interface YoutubePlaylistsResponse {
  kind: string;
  etag: string;
  nextPageToken: string;
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
  status: Status;
  contentDetails: ContentDetails;
  player: Player;
}

interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  localized: Localized;
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

interface Localized {
  title: string;
  description: string;
}

interface Status {
  privacyStatus: string;
}

interface ContentDetails {
  itemCount: number;
}

interface Player {
  embedHtml: string;
}

export interface YoutubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
}

function formatYoutubePlaylist(
  params: YoutubePlaylistsResponse["items"][0],
): YoutubePlaylist {
  return {
    id: params.id,
    title: params.snippet.title,
    description: params.snippet.description,
    thumbnail: params.snippet.thumbnails.default.url,
    itemCount: params.contentDetails.itemCount,
  };
}

export async function getPlaylists(): Promise<
  YoutubePlaylist[] | null
> {
  const access = await getGoogleAccessFromCookies();
  if (!access) return null;
  try {
    const p = new URLSearchParams();
    p.append("part", "contentDetails,id,snippet");
    p.append("mine", "true");
    const { data } = await axios.get(
      process.env.YOUTUBE_ENDPOINT_PLAYLISTS! + "?" + p.toString(),
      {
        headers: {
          Authorization: `${access.token_type} ${access.access_token}`,
        },
      },
    );
    return data.items.map(
      (item: YoutubePlaylistsResponse["items"][0]) =>
        formatYoutubePlaylist(item),
    );
  } catch (error) {
    return null;
  }
}
