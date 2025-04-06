import { useEffect, useRef, useState } from "react";
import Image from "node_modules/next/image";
import { getSpotifyAccessFromCookies } from "src/utils/getSpotifyAccessFromCookies";
import axios from "node_modules/axios";

interface SpotifyPanelProps {
  onSelectPlaylist: (playlistId: string) => void;
}

export interface SpotifyPlaylist {
  name: string;
  id: string;
  description: string;
  thumbnail: string;
  tracksCount: number;
}

export interface SpotifyPlaylistsResponse {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
  items: Playlist[];
}

export interface Playlist {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[] | null;
  name: string;
  owner: Owner;
  public: boolean;
  snapshot_id: string;
  tracks: Tracks;
  type: string;
  uri: string;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface Owner {
  external_urls: ExternalUrls2;
  followers: Followers;
  href: string;
  id: string;
  type: string;
  uri: string;
  display_name: string;
}

export interface ExternalUrls2 {
  spotify: string;
}

export interface Followers {
  href: string;
  total: number;
}

export interface Tracks {
  href: string;
  total: number;
}

export function SpotifyPlaylists({
  onSelectPlaylist,
}: SpotifyPanelProps) {
  const controllerRef = useRef(new AbortController());
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);

  const fetchSpotifyTracks = async () => {
    controllerRef.current.abort();
    controllerRef.current = new AbortController();
    setIsLoadingTracks(true);

    const params = new URLSearchParams();
    const signal = controllerRef.current.signal;
    const { authorization } = await getSpotifyAccessFromCookies();

    if (!authorization) return;
    try {
      // SpotifyPlaylistsResponse
      const { data } = await axios.get<SpotifyPlaylistsResponse>(
        "https://api.spotify.com/v1/me/playlists" + params.toString(),
        {
          headers: { authorization },
          signal,
        },
      );

      setIsLoadingTracks(false);
      setPlaylists(formatSpotifyPlaylists(data));
    } catch (e) {
      // if (data.error.message.includes("auth"))
      //   throw new Error("Need to sign into spotify");
      // throw new Error(
      //   "An error occurred while fetching spotify tracks",
      // );
      const error = e as { name: string; message: string };
      if (error.name === "AbortError") return;
      setIsLoadingTracks(false);
    }
  };

  useEffect(() => {
    fetchSpotifyTracks();
  }, []);

  return (
    <section className="w-full space-y-5">
      {/* <header className="flex flex-col items-center space-y-5">
        <Image
          src="/spotify.svg"
          priority
          className="mx-auto"
          alt="spotify logo"
          width="120"
          height="120"
        />
      </header> */}
      {playlists && (
        <section className="grid grid-cols-[repeat(auto-fill,_250px)] place-content-center mx-auto gap-8 w-[95%] max-w-[1500px]">
          {playlists.map(p => (
            <article
              key={p.id}
              className="group w-full cursor-pointer shadow bg-[#232127] hover:bg-[#2b2a2e] rounded overflow-hidden"
              onClick={() => onSelectPlaylist(p.id)}
            >
              <div className="relative w-full">
                <img
                  className="group-hover:rounded-0"
                  src={p.thumbnail}
                  alt={"playlist " + p.name}
                />
                {/* <p className="absolute right-2 bottom-2">
                  {p.itemCount} songs
                </p> */}
              </div>
              <section className="py-1.5 px-3">
                <p className="">{p.name}</p>
              </section>
            </article>
          ))}
        </section>
      )}
    </section>
  );
}

function formatSpotifyPlaylists(
  data: SpotifyPlaylistsResponse,
): SpotifyPlaylist[] {
  return data.items.map(item => ({
    name: item.name,
    id: item.id,
    description: item.description,
    thumbnail:
      item.images?.[0]?.url || "/spotify-non-playlist-image.png",
    tracksCount: item.tracks.total,
  }));
}
