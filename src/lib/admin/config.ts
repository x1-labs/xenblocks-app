export const adminConfig = {
  rpcUrl: import.meta.env.VITE_X1_RPC_ENDPOINT || "https://rpc.mainnet.x1.xyz",
  multisigAddress: import.meta.env.VITE_SQUADS_MULTISIG_ACCOUNT || "",
  vaultIndex: parseInt(import.meta.env.VITE_SQUADS_VAULT_INDEX || "0", 10),
  squadsProgramId: import.meta.env.VITE_SQUADS_PROGRAM_ID || "",
  botAddress: import.meta.env.VITE_AIRDROP_BOT_AUTH || "",
};
