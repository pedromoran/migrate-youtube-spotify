import Image from "next/image";
import { GoogleOAuthButton } from "src/components/GoogleOAuthButton";

export default async function YoutubeAccess() {
  return (
    <div className="min-h-screen">
      <main className="w-full flex flex-col items-center py-16 space-y-10">
        <h1 className="text-lg border-b max-w-[400px] text-center">
          Grant access through your google account to connect to{" "}
          <a
            className="text-sky-400 hover:underline"
            href="https://developers.google.com/youtube/v3"
            target="_blank"
          >
            Youtube Api
          </a>
        </h1>
        <Image
          className="mx-auto"
          src="/youtube_music.svg"
          alt="youtube music logo"
          width={120}
          height={120}
        />
        <GoogleOAuthButton />
      </main>
    </div>
  );
}
