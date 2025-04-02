"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { GoogleOAuthButton } from "./GoogleOAuthButton";
import {
  getPlaylists,
  YoutubePlaylist,
} from "src/services/youtube/getPlaylists";

interface YoutubePlaylistsProps {
  userProfile: null;
}

export const YoutubePlaylists = ({
  userProfile,
}: YoutubePlaylistsProps) => {
  const [tracks, setTracks] = useState<YoutubePlaylist[] | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      const response = await getPlaylists();
      setTracks(response);
    })();
  }, []);

  // https://www.googleapis.com/youtube/v3/playlistItems?playlistId=PLzXxG3O_lu6A7Ad8Iz9A7pa0_zhT0WXmy&part=contentDetails,id,snippet
  // https://www.googleapis.com/youtube/v3/videos?id=fyrmM_SYC0Q&part=contentDetails,fileDetails,id,liveStreamingDetails,player,processingDetails,recordingDetails,snippet,statistics,topicDetails

  return (
    <section className="flex flex-col items-center space-y-5">
      <Image
        className="mx-auto"
        src="/youtube_music.svg"
        alt="youtube music logo"
        width={120}
        height={120}
      />
      {!userProfile && <GoogleOAuthButton />}
      {tracks && (
        <ul className="pr-4 py-4 self-stretch space-y-5 overflow-y-auto max-h-[600px]">
          {/* {tracks?.prev.map((track: Track) => (
            <YoutubeTrack
              key={track.q}
              title={track.title}
              artist={track.artist}
              album={track.album}
              q={track.q}
              thumbnail={track.thumbnail}
              onMoveToTrack={goPrevYTSong}
              isPrev
            />
          ))}
          {tracks?.current && (
            <YoutubeTrack
              title={tracks.current.title}
              artist={tracks.current.artist}
              album={tracks.current.album}
              q={tracks.current.q}
              thumbnail={tracks.current.thumbnail}
              onNextTrack={() => {
                fetch(window.origin + "/yt-tracks")
                  .then(res => res.json())
                  .then(data => setTracks(data));
              }}
            />
          )} */}
          {/* {tracks?.map((track) => (
            <YoutubeTrack
              key={track.q}
              title={track.title}
              artist={track.artist}
              album={track.album}
              q={track.q}
              thumbnail={track.thumbnail}
              viewOnly
            />
          ))} */}
        </ul>
      )}
    </section>
  );
};
