import axios from "axios";

export const YoutubeSignOutButton = () => {
  const handleSignOut = async () => {
    try {
      await axios.delete(window.origin + "/auth/spotify/cookies");
      window.location.reload();
    } catch (error) {}
  };
  return (
    <button className="btn" onClick={handleSignOut}>
      Sign out
    </button>
  );
};
