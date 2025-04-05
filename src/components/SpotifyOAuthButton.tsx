"use client";
import Image from "next/image";
import React from "react";

export function SpotifyOAuthButton() {
  const goToSpotifyOAuth = async () => {
    window.open(
      process.env.NEXT_PUBLIC_SELF_ENDPOINT_SPOTIFY_AUTH,
      "_self",
    );
  };

  return (
    <button
      className="btn"
      onClick={goToSpotifyOAuth}
      aria-label="Button Sign in with Spotify"
    >
      {/* <span>
        <Image
          src="/spotify.svg"
          priority
          alt="spotify logo"
          width="24"
          height="24"
        />
      </span> */}
      <span>Sign in</span>
    </button>
  );
}
