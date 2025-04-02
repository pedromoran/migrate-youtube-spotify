"use client";
import { PropsWithChildren } from "node_modules/@types/react";
import { SpotifyUserProfile } from "src/interfaces/spotify/user-profile";
import { useState, useEffect } from "react";
import { getSpotifyUserProfile } from "src/services/spotify/getSpotifyUserProfile";
import {
  getYoutubeUserProfile,
  YoutubeUserProfile,
} from "src/services/youtube/getYoutubeUserProfile";
import { createContext } from "vm";

export const UserProfileContext = createContext({});

export const UserProfileProvider = ({
  children,
}: PropsWithChildren) => {
  const [spotifyProfile, setSpotifyProfile] =
    useState<SpotifyUserProfile | null>(null);
  const [youtubeProfile, setYoutubeProfile] =
    useState<YoutubeUserProfile | null>(null);

  useEffect(() => {
    (async () => setSpotifyProfile(await getSpotifyUserProfile()))();
    (async () => setYoutubeProfile(await getYoutubeUserProfile()))();
  }, []);

  return (
    <UserProfileContext.Provider
      value={{
        spotifyProfile,
        youtubeProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};
