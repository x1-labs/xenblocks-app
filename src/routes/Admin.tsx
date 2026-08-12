import { useState, useCallback } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletProvider } from "@/components/admin/WalletProvider";
import { StatusTable } from "@/components/admin/StatusTable";
import { ProposalPanel } from "@/components/admin/ProposalPanel";
import { RunsTable } from "@/components/admin/RunsTable";
import { BotBalancesPanel } from "@/components/admin/BotBalancesPanel";
import { NavBar } from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useMultisigMember } from "@/hooks/useMultisigMember";
import type { TokenDelta } from "@/lib/admin/fetchDeltas";
import type { GlobalStateV2 } from "@/lib/admin/fetchGlobalState";

function AdminContent() {
  const [deltas, setDeltas] = useState<TokenDelta[] | null>(null);
  const [globalState, setGlobalState] = useState<GlobalStateV2 | null>(null);
  const handleDeltasChange = useCallback((d: TokenDelta[]) => setDeltas(d), []);
  const handleGlobalStateChange = useCallback((s: GlobalStateV2) => setGlobalState(s), []);
  const { isMember } = useMultisigMember();

  return (
    <main className="min-h-screen flex flex-col justify-between mx-0">
      <NavBar />
      <div className="flex flex-content justify-center w-full">
        <div className="card mx-2 sm:mx-8 lg:mx-2 w-full max-w-screen-xl">
          <div className="card-body p-4 sm:p-6">
            <div className="card-title flex items-center justify-between">
              <h1 className="text-2xl">Airdrops</h1>
              <WalletMultiButton />
            </div>

            <div className="mt-4 space-y-4 sm:space-y-6">
              <StatusTable
                deltas={deltas}
                globalState={globalState}
                onDeltasChange={handleDeltasChange}
                onGlobalStateChange={handleGlobalStateChange}
              />

              <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
                <div className="space-y-4 sm:space-y-6">
                  <BotBalancesPanel deltas={deltas} globalState={globalState} />
                  {isMember && <ProposalPanel deltas={deltas} globalState={globalState} />}
                </div>
                <RunsTable />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="flex-grow"></section>
      <Footer isLoading={false} />
    </main>
  );
}

export default function Admin() {
  return (
    <WalletProvider>
      <AdminContent />
    </WalletProvider>
  );
}
