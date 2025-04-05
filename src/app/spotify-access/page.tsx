import Image from "next/image";
import { SpotifyOAuthButton } from "src/components/SpotifyOAuthButton";

export default async function SpotifyAccess() {
  return (
    <div className="min-h-screen">
      <main className="w-full flex flex-col items-center py-16 space-y-10">
        <h1 className="text-lg border-b max-w-[400px] text-center">
          Grant access through your spotify account to connect to{" "}
          <a
            className="text-sky-400 hover:underline"
            href="https://developer.spotify.com/"
            target="_blank"
          >
            Spotify Api
          </a>
        </h1>
        <Image
          className="mx-auto"
          src="/spotify.svg"
          alt="spotify logo"
          width={120}
          height={120}
        />
        <SpotifyOAuthButton />
      </main>
    </div>
  );
}
