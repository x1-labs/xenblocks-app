import { NavBar } from "@/components/NavBar";
import Footer from "@/components/Footer";
import { SiGitbook } from "react-icons/si";
import { Section } from "@/components/Section";

export default function Home() {
  return (
    <main className="flex flex-col mx-0 min-h-screen">
      <NavBar />

      <div className="hero py-8 mt-0 mb-4 sm:py-8 sm:my-8 bg-base-100">
        <div className="hero-content grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-7 z-10">
            <div className="mx-2 sm:mx-8">
              <h1 className="text-[1.4rem] sm:text-2xl lg:text-3xl xl:text-[2.8rem] font-mono text-accent mb-10 md:mb-12">
                <div className="mb-2 lg:mb-4 xl:mb-6">PROOF-OF-WORK MINING</div>
                <div>ACCESSIBLE TO EVERYONE</div>
              </h1>
              <p className="mb-12 max-w-lg uppercase leading-loose md:leading-loose lg:leading-loose text-justify text-xs sm:text-left lg:text-lg">
                XenBLOCKs serve as a Proof-of-Work (PoW) token on the X1 blockchain
              </p>
              <a href="https://docs.xenblocks.io/mining/how-to-mine-xenblocks">
                <button className="btn btn-primary btn-sm sm:btn-md lg:btn-lg hover:bg-base-100 hover:text-primary font-thin text-lg">
                  START MINING
                </button>
              </a>
              <a href="https://docs.xenblocks.io">
                <button className="ml-2 btn btn-sm sm:btn-md lg:btn-lg btn-primary btn-outline font-thin text-lg">
                  GITBOOK
                  <SiGitbook />
                </button>
              </a>
            </div>
          </div>
          <div className="absolute opacity-15 md:opacity-100 md:relative md:block md:col-span-5">
            <img src="./pick-axe.svg" alt="Pickaxe"></img>
          </div>
        </div>
      </div>

      <Section title="HOW IT WORKS" backgroundColor="bg-base-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-28 lg:px-20">
          <div className="hidden md:block">
            <img className="" src="./how-it-works.svg" alt="how it works"></img>
          </div>

          <div className="">
            <article className="">
              <h2 className="mb-6 lg:text-2xl text-accent">HASHING</h2>
              <p className="mb-6 text-sm sm:text-xs lg:text-base md:leading-loose lg:leading-loose uppercase text-justify leading-loose">
                Miners solve a cryptographic puzzle by finding hashes that contain{" "}
                <code>XEN11.</code> Successful identification of such a hash rewards miners with
                XENIUM (XNM).
              </p>
              <p className="uppercase text-sm sm:text-xs lg:text-base md:leading-loose lg:leading-loose lg:text-md text-justify leading-loose">
                Central to its design is the cryptographic hashing algorithm Argon2, known for being
                memory-hard and ensuring fair, asic-resistant mining.
              </p>
            </article>
          </div>

          <div className="md:hidden -mt-8">
            <img className="" src="./how-it-works.svg" alt="how it works"></img>
          </div>

          <div>
            <article className="">
              <h2 className="mb-6 lg:text-2xl text-accent">FIXED GLOBAL HASHRATE</h2>
              <p className="mb-6 text-sm sm:text-xs lg:text-base md:leading-loose lg:leading-loose uppercase text-justify leading-loose">
                As the network&apos;s overall hash power grows, the mechanism adjusts to reduce
                individual miners&apos; hash power, decoupling mining intensity from energy
                consumption by shifting the computational burden to memory.
              </p>
              <p className="text-sm sm:text-xs lg:text-base md:leading-loose lg:leading-loose uppercase text-justify leading-loose">
                This not only deters ASIC mining but also renders XenBLOCKs mining more accessible,
                allowing for the use of commonplace GPUs.
              </p>
            </article>
          </div>

          <div>
            <img src="./hashratefixed.svg" alt="Fixed global hashrate"></img>
          </div>
        </div>
      </Section>

      <Section title="XENIUM (XNM)" backgroundColor="bg-base-100">
        <article>
          <p className="mb-3 text-sm lg:text-xl uppercase text-justify leading-loose">
            XNM is the reward token for mining xenblocks.
          </p>
          <p className="mb-6 text-sm lg:text-xl uppercase text-justify leading-loose">
            Miners receive XNM every time they find a xenblock.
          </p>
          <div className="p-5 lg:p-20">
            <img src="./xeniumchart.svg" alt="XENIUM (XNM) emission over time"></img>
          </div>
        </article>
      </Section>

      <div className={`my-0 w-full bg-base-200`}>
        <div className="max-w-screen-xl mx-auto">
          <div className="card lg:mx-2 w-full text-center">
            <div className="card-body py-10 my-6 mb-20">
              <h2 className="text-xl sm:text-3xl text-center text-accent mb-6">
                <div className="mb-3">THE BEST TIME TO START</div>
                <div>MINING WAS YESTERDAY</div>
              </h2>
              <a href="https://github.com/jacklevin74/xenminer">
                <button className="btn btn-primary hover:bg-base-100 hover:text-primary font-thin text-lg">
                  START MINING
                </button>
              </a>
            </div>
            <img
              className="absolute -left-2 bottom-0 opacity-20 lg:opacity-95"
              width={300}
              src="./bottom-blocks.svg"
              alt=""
            ></img>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
