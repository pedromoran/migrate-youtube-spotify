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

interface SpotifyPanelProps {
  search: string | null;
  onFetchedTracks: (tracks: SpotifyTrack[]) => void; //* are used to compare with youtube tracks in the parent component
  userProfile: SpotifyUserProfile | null;
}

export const SpotifyPanel = ({
  search,
  onFetchedTracks,
  userProfile,
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
        {userProfile ? (
          // <section className="flex mx-auto space-x-5">
          //   <div className="w-[80px] h-[80px]">
          //     {userProfile.images[0] ? (
          //       <img
          //         src={userProfile.images[0]?.url}
          //         className="rounded-full w-full h-full object-cover"
          //         alt="spotify user profile image"
          //       />
          //     ) : (
          //       <span className="grid place-content-center w-full h-full rounded-full text-4xl font-extrabold bg-sky-700 text-white">
          //         {userProfile.display_name[0]}
          //       </span>
          //     )}
          //   </div>
          //   <div className="flex-grow flex justify-between items-start">
          //     <div>
          //       <p>Profile</p>
          //       <h2 className="text-2xl font-extrabold">
          //         {userProfile.display_name}
          //       </h2>
          //     </div>
          //     <SpotifySignOutButton />
          //   </div>
          // </section>
          <ProfileInfo
            image={userProfile.images[0]?.url}
            title={userProfile.display_name}
            onClickSignOut={() => removeSpotifyCookies()}
          />
        ) : (
          <SpotifyOAuthButton />
        )}
        {userProfile && (
          <SearchInput
            defaultValue={search ?? ""}
            onValueChange={v => fetchSpotifyTracks(v)}
          />
        )}
      </header>
      {userProfile && (
        <ul className="pr-4 py-4 self-stretch space-y-5 overflow-y-auto max-h-[600px]">
          {isLoadingTracks && <Skeleton />}
          {tracks?.map(track => (
            <SpotifyTrack key={track.link} track={track} />
          ))}
        </ul>
      )}
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
    const { album, artists, name, explicit, external_urls } = track;
    const artist = artists.map(artist => artist.name).join(", ");
    const t: SpotifyTrack = {
      artist,
      title: name,
      album: album.name,
      explicit,
      thumbnail: album.images[1].url,
      link: external_urls.spotify,
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
