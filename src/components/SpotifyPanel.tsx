import { useRef, useState } from "react";
import { SpotifyTrack } from "./SpotifyTrack";
import { SearchResponse } from "../interfaces/spotify/search-response";
import Image from "node_modules/next/image";
import { SearchInput } from "./SearchInput";
import { SpotifyOAuthButton } from "./SpotifyOAuthButton";
import { SpotifyUserProfile } from "src/interfaces/spotify/user-profile";
import { SpotifySignOutButton } from "./SpotifySignOutButton";
import { SpotifyCookieEnum } from "src/interfaces/spotify-cookies";
import { ProfileInfo } from "./common/ProfileInfo";
import { removeSpotifyCookies } from "src/utils/removeSpotifyCookies";
import { getGoogleAccessFromCookies } from "src/utils/getGoogleAccessFromCookies";
import { getSpotifyAccessFromCookies } from "src/utils/getSpotifyAccessFromCookies";
import axios from "node_modules/axios";

interface SpotifyPanelProps {
  youtubeSearch: string | null;
  onFetchedTracks: (tracks: SpotifyTrack[]) => void; //* are used to compare with youtube tracks in the parent component
  onNewTrackAdded: () => void;
  userProfile: SpotifyUserProfile | null;
  playlistId?: string;
}

export const SpotifyPanel = ({
  youtubeSearch,
  onFetchedTracks,
  onNewTrackAdded,
  userProfile,
  playlistId,
}: SpotifyPanelProps) => {
  const controllerRef = useRef(new AbortController());
  const [tracks, setTracks] = useState<SpotifyTrack[] | null>(null);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  const fetchSpotifyTracks = async (search: string) => {
    if (search === "") {
      controllerRef.current.abort();
      setTracks([]);
      setIsLoadingTracks(false);
      return;
    }
    controllerRef.current.abort();
    controllerRef.current = new AbortController();
    setIsLoadingTracks(true);

    const params = new URLSearchParams();
    params.append("q", search);
    params.append("type", "track");

    const signal = controllerRef.current.signal;
    const { authorization } = await getSpotifyAccessFromCookies();

    if (!authorization) return;
    try {
      const data = await fetch(
        "https://api.spotify.com/v1/search?" + params.toString(),
        {
          headers: { authorization },
          signal,
        },
      )
        .then(async r => {
          const data = await r.json();
          if (r.ok) return data;
          if (data.error.message.includes("auth"))
            throw new Error("Need to sign into spotify");
          throw new Error(
            "An error occurred while fetching spotify tracks",
          );
        })
        .then(r => r);

      const formattedTracks = formatSpotifyTracks(data);
      setTracks(formattedTracks);
      onFetchedTracks(formattedTracks);
      setIsLoadingTracks(false);
    } catch (e) {
      const error = e as { name: string; message: string };
      if (error.name === "AbortError") return;
      setIsLoadingTracks(false);
      // alert(error.message);
    }
  };

  // https://api.spotify.com/v1/playlists/{playlist_id}/tracks
  // POST
  // /playlists/{playlist_id}/tracks
  // playlist_id
  // string
  // Required
  // The Spotify ID of the playlist.

  // Example: 3cEYpjA9oz9GiPac4AsH4n
  // position
  // integer
  // The position to insert the items, a zero-based index. For example, to insert the items in the first position: position=0; to insert the items in the third position: position=2. If omitted, the items will be appended to the playlist. Items are added in the order they are listed in the query string or request body.

  // Example: position=0
  // uris
  // string
  // A comma-separated list of Spotify URIs to add, can be track or episode URIs. For example:
  // uris=spotify:track:4iV5W9uYEdYUVa79Axb7Rh, spotify:track:1301WleyT98MSxVHPZCA6M, spotify:episode:512ojhOuo1ktJprKbVcKyQ
  // A maximum of 100 items can be added in one request.
  // Note: it is likely that passing a large number of item URIs as a query parameter will exceed the maximum length of the request URI. When adding a large number of items, it is recommended to pass them in the request body, see below.

  // Example: uris=spotify%3Atrack%3A4iV5W9uYEdYUVa79Axb7Rh,spotify%3Atrack%3A1301WleyT98MSxVHPZCA6M

  // Body application/json
  // supports free form additional properties
  // uris
  // array of strings
  // A JSON array of the Spotify URIs to add. For example: {"uris": ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M", "spotify:episode:512ojhOuo1ktJprKbVcKyQ"]}
  // A maximum of 100 items can be added in one request. Note: if the uris parameter is present in the query string, any URIs listed here in the body will be ignored.

  // position
  // integer
  // The position to insert the items, a zero-based index. For example, to insert the items in the first position: position=0 ; to insert the items in the third position: position=2. If omitted, the items will be appended to the playlist. Items are added in the order they appear in the uris array. For example: {"uris": ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M"], "position": 3}
  const addTrackToSpotifyPlaylist = async (
    playlistId: string,
    track: SpotifyTrack,
  ) => {
    const { authorization } = await getSpotifyAccessFromCookies();
    if (!authorization) return;
    const params = new URLSearchParams();
    params.append("uris", `spotify:track:${track.id}`);
    params.append("position", "0");
    try {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?${params.toString()}`,
        {
          method: "POST",
          headers: {
            authorization,
            "Content-Type": "application/json",
          },
        },
      );
      onNewTrackAdded();
    } catch (e) {
      const error = e as { name: string; message: string };
      if (error.name === "AbortError") return;
      // alert(error.message);
    }
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-col items-center space-y-5">
        <Image
          src="/spotify.svg"
          priority
          className="mx-auto"
          alt="spotify logo"
          width="120"
          height="120"
        />
        {userProfile && (
          <ProfileInfo
            image={userProfile.images[0]?.url}
            title={userProfile.display_name}
            onClickSignOut={() => removeSpotifyCookies()}
          />
        )}
        {/* {userProfile && (
        )} */}
        <SearchInput
          defaultValue={youtubeSearch ?? ""}
          onValueChange={v => fetchSpotifyTracks(v)}
        />
      </header>
      <ul className="pr-4 py-4 self-stretch space-y-5 overflow-y-auto max-h-[600px]">
        {isLoadingTracks && <Skeleton />}
        {tracks?.map(track => (
          <SpotifyTrack
            key={track.link}
            track={track}
            onClickAddToPlaylist={(track: SpotifyTrack) =>
              addTrackToSpotifyPlaylist(playlistId ?? "", track)
            }
          />
        ))}
      </ul>
    </section>
  );
};

function Skeleton() {
  return (
    <ul className="space-y-5">
      {[1, 2, 3].map((_, i) => (
        <div
          key={i}
          className="skeleton h-[140px] grid grid-cols-[100px_auto] gap-8 rounded shadow p-5  space-x-5"
        >
          <div className="skeleton w-[100px] h-[100px]"></div>
          <div>
            <h3 className="text-2xl text-transparent skeleton font-extrabold">
              _
            </h3>
            <p className="w-32 text-transparent skeleton mt-2">_</p>
            <button
              // onClick={() => {}}
              className="mt-2 text-transparent skeleton ml-auto block font-bold rounded w-max px-3 py-1.5"
            >
              ____________
            </button>
          </div>
        </div>
      ))}
    </ul>
  );
}

function formatSpotifyTracks(
  payload: SearchResponse,
): SpotifyTrack[] {
  const { tracks } = payload;
  const { items } = tracks;
  const formattedTracks = items.map(track => {
    const { album, artists, name, explicit, external_urls, id } =
      track;
    const artist = artists.map(artist => artist.name).join(", ");
    const t: SpotifyTrack = {
      artist,
      title: name,
      album: album.name,
      explicit,
      thumbnail: album.images[1].url,
      link: external_urls.spotify,
      id,
    };
    return t;
  });
  return formattedTracks;
}

function spotifyAccessTokenCookie() {
  try {
    const p = new URLSearchParams(
      document.cookie.replace(/;\s+/g, "&"),
    );
    const spotifyAccessToken = p.get(SpotifyCookieEnum.access_token);
    const tokenType = p.get(SpotifyCookieEnum.token_type);
    if (!spotifyAccessToken || !tokenType) return null;
    return `${tokenType} ${spotifyAccessToken}`;
  } catch (error) {
    //* this error could be thrown by next on the server side when doesn't find the "document" global variable defined
    return null;
  }
}
