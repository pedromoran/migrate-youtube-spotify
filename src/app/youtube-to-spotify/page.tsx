"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SpotifyPanel } from "src/components/SpotifyPanel";
import { SpotifyPlaylists } from "src/components/SpotifyPlaylists";
import { YoutubePanel } from "src/components/YoutubePanel";
import { YoutubePlaylists } from "src/components/YoutubePlaylists";

export default function YoutubeToSpotifyPage() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const youtubePlaylistId = searchParams.get("yt");
  const spotifyPlaylistId = searchParams.get("sfy");
  const [youtubeSearch, setYoutubeSearch] = useState<string | null>(
    null,
  );

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
              // setPlaylist({
              //   ...playlist,
              //   youtubePlaylistId: playlistId,
              // });
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

        {youtubePlaylistId && spotifyPlaylistId && (
          <section className="grid grid-cols-[repeat(2,_600px)] gap-x-8">
            <YoutubePanel
              channel={null}
              onCurrentTrackMetadata={s => setYoutubeSearch(s)}
              playlistId={youtubePlaylistId}
            />
            <SpotifyPanel
              key={youtubeSearch}
              onFetchedTracks={() => {}}
              youtubeSearch={youtubeSearch}
              userProfile={null}
              onNewTrackAdded={() => {}}
              playlistId={spotifyPlaylistId}
            />
          </section>
        )}
      </main>
    </div>
  );
}
