import { IoTrophy } from "react-icons/io5";
import { BsSendFill } from "react-icons/bs";
import { SiGitbook } from "react-icons/si";
import { SiGithub } from "react-icons/si";

export default function Footer({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <footer
      className={`footer footer-center z-[2] mt-auto p-5 bg-base-100 ${!isLoading && "fade-in"}`}
    >
      <nav>
        <div className="">
          <a className="sm:mx-3" href="https://xenblocks.io/leaderboard">
            <button className="btn btn-ghost sm:btn-lg">
              <IoTrophy />
              LEADERBOARD
            </button>
          </a>

          <a className="sm:mx-3" href="https://github.com/jacklevin74/xenminer">
            <button className="btn btn-ghost sm:btn-lg">
              <SiGithub />
              GITHUB
            </button>
          </a>

          <a className="sm:mx-3" href="https://docs.xenblocks.io">
            <button className="btn btn-ghost sm:btn-lg">
              <SiGitbook />
              GITBOOK
            </button>
          </a>

          <a className="sm:mx-3" href="https://t.me/+yDcqqTGMNC4yNjdj">
            <button className="btn btn-ghost sm:btn-lg">
              <BsSendFill />
              COMMUNITY
            </button>
          </a>
        </div>
      </nav>
    </footer>
  );
}
