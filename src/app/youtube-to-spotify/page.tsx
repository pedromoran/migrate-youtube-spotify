"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useRef, useState } from "react";
import { SpotifyPanel } from "src/components/SpotifyPanel";
import { SpotifyPlaylists } from "src/components/SpotifyPlaylists";
import { YoutubePanel } from "src/components/YoutubePanel";
import { YoutubePlaylists } from "src/components/YoutubePlaylists";
import {
  getYoutubeTracksIndex,
  updateYoutubeTracksPosition,
} from "../youtube/tracks-index";

export default function YoutubeToSpotifyPage() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const youtubePlaylistId = searchParams.get("yt");
  const spotifyPlaylistId = searchParams.get("sfy");
  const reRender = useReducer(c => c + 1, 0)[1];
  const isAutoAdditionOnRef = useRef(false);
  // const [isAutoAdditionOn, setIsAutoAdditionOn] = useState(false);
  const [youtubeSearch, setYoutubeSearch] = useState<string | null>(
    null,
  );
  const [youtubeTracksPosition, setYoutubeTracksPosition] = useState<
    number | null
  >(null);
  const handleNewYoutubeTracksPosition = async (p: number) => {
    try {
      setYoutubeTracksPosition(p);
      await updateYoutubeTracksPosition(p);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      const i = await getYoutubeTracksIndex();
      if (i) setYoutubeTracksPosition(i);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <main className="w-full flex flex-col items-center py-16 space-y-10">
        <h1 className="text-lg border-b">
          {youtubePlaylistId &&
            !spotifyPlaylistId &&
            "Select a spotify destination playlist"}
          {!youtubePlaylistId &&
            !spotifyPlaylistId &&
            "Select a youtube playlist to migrate to spotify"}
        </h1>
        {!youtubePlaylistId && (
          <YoutubePlaylists
            channel={null}
            onSelectPlaylist={(playlistId: string) => {
              push(`${window.location.pathname}?yt=${playlistId}`);
            }}
          />
        )}
        {youtubePlaylistId && !spotifyPlaylistId && (
          <SpotifyPlaylists
            onSelectPlaylist={(playlistId: string) => {
              const curr = new URL(window.location.href);
              curr.searchParams.append("sfy", playlistId);
              push(`${curr.pathname}${curr.search}`);
            }}
          />
        )}

        {youtubePlaylistId &&
          spotifyPlaylistId &&
          youtubeTracksPosition && (
            <section className="grid grid-cols-[repeat(2,_600px)] gap-x-8">
              <YoutubePanel
                onCurrentTrackMetadata={s => setYoutubeSearch(s)}
                playlistId={youtubePlaylistId}
                onPositionChange={handleNewYoutubeTracksPosition}
                position={youtubeTracksPosition}
              />
              <SpotifyPanel
                key={youtubeSearch}
                onFetchedTracks={() => {}}
                youtubeSearch={youtubeSearch}
                isAutoAdditionOnRef={isAutoAdditionOnRef}
                activateAutoAddition={() => {
                  isAutoAdditionOnRef.current = true;
                  reRender();
                }}
                deactivateAutoAddition={() => {
                  isAutoAdditionOnRef.current = false;
                  reRender();
                }}
                onNewTrackAdded={() =>
                  handleNewYoutubeTracksPosition(
                    youtubeTracksPosition + 1,
                  )
                }
                playlistId={spotifyPlaylistId}
              />
            </section>
          )}
      </main>
    </div>
  );
}
