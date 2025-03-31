"use client";
import { useEffect, useState } from "react";
import { YoutubeTrack } from "./YoutubeTrack";
import Image from "next/image";
import { SpotifyTrack } from "./SpotifyTrack";
import { GetTracksResponse, Track } from "src/app/youtube/route";
import { GoogleOAuthButton } from "./GoogleOAuthButton";
import { getYoutubeTracksIndex } from "src/app/youtube/tracks-index";

interface YoutubeTracksProps {
  onCurrentTrack: (track: Track) => void;
  userProfile: null;
  auth: {
    accessToken: string;
    tokenType: string;
    refreshToken: string;
  } | null;
}

export const YoutubeTracks = ({
  onCurrentTrack,
  auth,
  userProfile,
}: YoutubeTracksProps) => {
  const [tracks, setTracks] = useState<GetTracksResponse | null>(
    null,
  );
  const [index, setIndex] = useState<number | null>(null);

  const fetchTracks = async () => {
    // const res = await fetch("http://localhost:3000/yt-tracks");
    // const data = await res.json();
    // setTracks(data);
  };

  async function goPrevYTSong() {
    try {
      await fetch("/yt-tracks?go=prev", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      fetchTracks();
    } catch (e) {
      console.log(e);
    }
  }

  const notifyMismatch = () => {
    return;
    // if (Notification.permission === "granted") {
    //   new Notification("There is a mismatch! 🙂");
    //   new Audio("notification.wav").play();
    //   return;
    // }
  };

  const handleSpotifyTracks = (sfyTracks: SpotifyTrack[]) => {
    const hasMismatch =
      sfyTracks.length > 0 &&
      sfyTracks[0].title !== tracks?.current.title;

    if (hasMismatch) notifyMismatch();
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

  useEffect(() => {
    // (async () => {
    //   const v = await getYoutubeTracksIndex();
    //   console.log(v);
    // })();
    fetchTracks();
  }, []);

  useEffect(() => {
    if (tracks) onCurrentTrack(tracks.current);
  }, [tracks?.current]);

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
          {tracks?.prev.map((track: Track) => (
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
          )}
          {tracks?.next.map((track: Track) => (
            <YoutubeTrack
              key={track.q}
              title={track.title}
              artist={track.artist}
              album={track.album}
              q={track.q}
              thumbnail={track.thumbnail}
              viewOnly
            />
          ))}
        </ul>
      )}
    </section>
  );
};
