"use client";
import { useEffect, useRef, useState } from "react";
import { SpotifyTrack } from "./SpotifyTrack";
import { SearchResponse } from "../interfaces/spotify/search-response";
import Image from "node_modules/next/image";
import { SearchInput } from "./SearchInput";
import { SpotifyUserProfile } from "src/interfaces/spotify/user-profile";
import { SpotifyCookieEnum } from "src/interfaces/spotify-cookies";
import { ProfileInfo } from "./common/ProfileInfo";
import { removeSpotifyCookies } from "src/utils/removeSpotifyCookies";
import { getSpotifyAccessFromCookies } from "src/utils/getSpotifyAccessFromCookies";
import { LoadingSkeletonTracks } from "./LoadingSkeletonTracks";
import { useUserProfile } from "src/app/user-profile-provider";
import classNames from "node_modules/classnames";

interface SpotifyPanelProps {
  youtubeSearch: string | null;
  onFetchedTracks: (tracks: SpotifyTrack[]) => void; //* are used to compare with youtube tracks in the parent component
  onNewTrackAdded: () => void;
  playlistId?: string;
  setIsAutoAdditionOn: (isAutoAdditionOn: boolean) => void;
  isAutoAdditionOn: boolean;
}

export const SpotifyPanel = ({
  youtubeSearch,
  onFetchedTracks,
  onNewTrackAdded,
  playlistId,
  isAutoAdditionOn,
  setIsAutoAdditionOn,
}: SpotifyPanelProps) => {
  const { spotifyUserProfile } = useUserProfile();
  const controllerRef = useRef(new AbortController());
  const [tracks, setTracks] = useState<SpotifyTrack[] | null>(null);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [isAddingTrackToPlaylist, setIsAddingTrackToPlaylist] =
    useState(false);

  const notifyMismatch = () => {
    if (Notification.permission === "granted") {
      new Notification("There is a mismatch! 🙂");
      new Audio("notification.wav").play();
      return;
    }
  };

  useEffect(() => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "default") {
      alert("Let us notify you when there is a mismatch!");
      Notification.requestPermission();
      return;
    }
  }, []);

  const addTrackToSpotifyPlaylist = async (
    playlistId: string,
    track: SpotifyTrack,
  ) => {
    setIsAddingTrackToPlaylist(true);
    const { authorization } = await getSpotifyAccessFromCookies();
    if (!authorization) return;
    const params = new URLSearchParams();
    params.append("uris", `spotify:track:${track.id}`);
    params.append("position", "0");

    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_SPOTIFY_ENDPOINT_PLAYLISTS
        }/${playlistId}/tracks?${params.toString()}`,
        {
          method: "post",
          headers: { authorization },
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
      setTimeout(() => {
        onNewTrackAdded();
      }, 1000);
    } catch (e) {
      const error = e as { name: string; message: string };
      if (error.name === "AbortError") return;
      // alert(error.message);
    } finally {
      setIsAddingTrackToPlaylist(false);
    }
  };

  const compareSpotifyTracks = async (
    search: string,
    tracks: SpotifyTrack[],
  ) => {
    const artists = tracks[0].artist.split(", ");
    let firstExplicit = false;
    let hasElseWithExplicit = false;
    tracks.forEach((t, i) => {
      if (i === 0) {
        firstExplicit = t.explicit;
      } else if (
        t.explicit &&
        search.toLowerCase().includes(t.title.toLowerCase()) &&
        artists.every(a =>
          search.toLowerCase().includes(a.toLowerCase()),
        )
      ) {
        hasElseWithExplicit = true;
      }
    });

    if (!firstExplicit && hasElseWithExplicit) {
      notifyMismatch();
      alert("check explicit");
      setIsLoadingTracks(false);
      return;
    }

    if (
      search.toLowerCase().includes(tracks[0].title.toLowerCase()) &&
      artists.every(a =>
        search.toLowerCase().includes(a.toLowerCase()),
      )
    ) {
      // alert("perfect match");
      await addTrackToSpotifyPlaylist(playlistId ?? "", tracks[0]);
    } else {
      notifyMismatch();
    }
  };

  const fetchSpotifyTracks = async (search: string) => {
    controllerRef.current.abort();
    controllerRef.current = new AbortController();
    setTracks([]);
    setIsLoadingTracks(true);

    if (search === "") {
      setIsLoadingTracks(false);
      return;
    }

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
      if (isAutoAdditionOn)
        await compareSpotifyTracks(search, formattedTracks);
    } catch (e) {
      const error = e as { name: string; message: string };
      if (error.name === "AbortError") return;
      setIsLoadingTracks(false);
      // alert(error.message);
    }
  };
  // curl --request POST \
  // --url 'https://api.spotify.com/v1/playlists/546pGyqcbtR0aiOPlIHIN8/tracks?position=0&uris=spotify%3Atrack%3A0eO2zq5fjPt41BreFmiIKw' \
  // --header 'Authorization: Bearer 1POdFZRZbvb...qqillRxMr2z' \
  // --header 'Content-Type: application/json' \
  // --data '{
  //   "uris": [
  //       "string"
  //   ],
  //   "position": 0
  // }'

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
        {spotifyUserProfile && (
          <ProfileInfo
            image={spotifyUserProfile.images[0]?.url}
            title={spotifyUserProfile.display_name}
            onClickSignOut={() => removeSpotifyCookies()}
          />
        )}
        {/* {userProfile && (
        )} */}
        <div className="w-full grid row-end-[auto,_auto] grid-cols-[1fr_auto] gap-x-2 gap-y-1">
          <p className="col-span-full">Search</p>
          <SearchInput
            defaultValue={youtubeSearch ?? ""}
            onValueChange={v => fetchSpotifyTracks(v)}
          />
          <button
            className={classNames(
              "btn block",
              isAutoAdditionOn ? "bg-orange-400" : "bg-sky-800",
            )}
            onClick={() => {
              if (!isAutoAdditionOn) {
                compareSpotifyTracks(
                  youtubeSearch ?? "",
                  tracks ?? [],
                );
              }
              setIsAutoAdditionOn(!isAutoAdditionOn);
            }}
          >
            {isAutoAdditionOn
              ? "Pause auto addition"
              : "Activate auto addition"}
          </button>
        </div>
      </header>
      <ul className="pr-4 py-4 self-stretch space-y-5 overflow-y-auto max-h-[600px]">
        {isLoadingTracks && <LoadingSkeletonTracks />}
        {tracks?.map(track => (
          <SpotifyTrack
            key={track.link}
            track={track}
            isAddingTrackToPlaylist={isAddingTrackToPlaylist}
            onClickAddToPlaylist={(track: SpotifyTrack) =>
              addTrackToSpotifyPlaylist(playlistId ?? "", track)
            }
          />
        ))}
      </ul>
    </section>
  );
};

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
