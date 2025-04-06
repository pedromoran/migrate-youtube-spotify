"use client";
import { PropsWithChildren, useContext, createContext } from "react";
import { SpotifyUserProfile } from "src/interfaces/spotify/user-profile";
import { YoutubeUserProfile } from "src/services/youtube/getGoogleUserProfile";

interface UserProfileContextData {
  spotifyUserProfile: SpotifyUserProfile | null;
  googleUserProfile: YoutubeUserProfile | null;
}

export const UserProfileContext =
  createContext<UserProfileContextData>({} as UserProfileContextData);

export interface UserProfileProviderProps {
  spotifyUserProfile: SpotifyUserProfile | null;
  googleUserProfile: YoutubeUserProfile | null;
}

export const UserProfileProvider = ({
  spotifyUserProfile,
  googleUserProfile,
  children,
}: PropsWithChildren<UserProfileProviderProps>) => {
  // const [spotifyProfile, setSpotifyProfile] =
  //   useState<SpotifyUserProfile | null>(null);
  // const [youtubeProfile, setYoutubeProfile] =
  //   useState<YoutubeUserProfile | null>(null);

  // useEffect(() => {
  //   (async () => setSpotifyProfile(await getSpotifyUserProfile()))();
  //   (async () => setYoutubeProfile(await getYoutubeUserProfile()))();
  // }, []);

  return (
    <UserProfileContext.Provider
      value={{
        spotifyUserProfile,
        googleUserProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error(
      "useUserProfile must be used within a UserProfileProvider",
    );
  }
  return context;
}
