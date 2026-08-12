import { Link } from "react-router";
import { IoTrophy } from "react-icons/io5";
import { BsSendFill } from "react-icons/bs";

export const NavBar = () => {
  const handleLogoClick = () => {
    if (window.location.pathname.startsWith("/leaderboard/")) {
      return "/leaderboard";
    }
    return "/";
  };

  return (
    <div className="navbar p-0 bg-base-100 opacity-85 z-[20] max-w-screen-xl mx-auto px-4 sm:py-6 xl:pt-10">
      <Link to={handleLogoClick()} className="btn btn-link animate-none">
        <img
          className="w-[100px] sm:w-[140px] lg:[160px]"
          src="/xenblocks-logo.svg"
          alt="Xenblocks Logo"
        />
      </Link>

      <Link className="ml-auto" to="/leaderboard">
        <button className="btn btn-ghost hover:bg-base-100 hover:text-accent btn-xs sm:btn-lg">
          <IoTrophy></IoTrophy>
          LEADERBOARD
        </button>
      </Link>

      <a href="https://t.me/+yDcqqTGMNC4yNjdj">
        <button className="btn btn-ghost hover:bg-base-100 hover:text-accent btn-xs sm:btn-lg">
          <BsSendFill></BsSendFill>
          COMMUNITY
        </button>
      </a>
    </div>
  );
};
