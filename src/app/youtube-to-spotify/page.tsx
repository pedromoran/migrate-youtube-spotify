"use client";
import { useState } from "react";
import { SpotifyPanel } from "src/components/SpotifyPanel";
import { SpotifyPlaylists } from "src/components/SpotifyPlaylists";
import { YoutubePanel } from "src/components/YoutubePanel";
import { YoutubePlaylists } from "src/components/YoutubePlaylists";

export default function YoutubeToSpotifyPage() {
  const [youtubeSearch, setYoutubeSearch] = useState<string | null>(
    null,
  );
  const [playlist, setPlaylist] = useState<{
    youtubePlaylistId: string | null;
    spotifyPlaylistId: string | null;
  }>({
    spotifyPlaylistId: null,
    youtubePlaylistId: null,
  });

  return (
    <div className="min-h-screen">
      <main className="w-full flex flex-col items-center py-16 space-y-10">
        <h1 className="text-lg border-b">
          {playlist.youtubePlaylistId &&
            !playlist.spotifyPlaylistId &&
            "Select a spotify destination playlist"}
          {!playlist.youtubePlaylistId &&
            !playlist.spotifyPlaylistId &&
            "Select a youtube playlist to migrate to spotify"}
        </h1>
        {!playlist.youtubePlaylistId && (
          <YoutubePlaylists
            channel={null}
            onSelectPlaylist={(playlistId: string) => {
              setPlaylist({
                ...playlist,
                youtubePlaylistId: playlistId,
              });
            }}
          />
        )}
        {playlist.youtubePlaylistId &&
          !playlist.spotifyPlaylistId && (
            <SpotifyPlaylists
              onSelectPlaylist={(playlistId: string) => {
                setPlaylist({
                  ...playlist,
                  spotifyPlaylistId: playlistId,
                });
              }}
            />
          )}

        {playlist.youtubePlaylistId && playlist.spotifyPlaylistId && (
          <section className="grid grid-cols-[repeat(2,_600px)] gap-x-8">
            <YoutubePanel
              channel={null}
              onCurrentTrackMetadata={s => setYoutubeSearch(s)}
              playlistId={playlist.youtubePlaylistId}
            />
            <SpotifyPanel
              onFetchedTracks={() => {}}
              youtubeSearch={youtubeSearch}
              userProfile={null}
              onNewTrackAdded={() => {}}
              playlistId={playlist.spotifyPlaylistId}
            />
          </section>
        )}
      </main>
    </div>
  );
}
