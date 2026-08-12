export const config = {
  rpcEndpoint: import.meta.env.VITE_X1_RPC_ENDPOINT || "https://rpc.mainnet.x1.xyz",
  programId:
    import.meta.env.VITE_AIRDROP_PROGRAM_ID || "xen8pjUWEnRbm1eML9CGtHvmmQfruXMKUybqGjn3chv",
  explorerUrl: import.meta.env.VITE_X1_EXPLORER_URL || "https://explorer.mainnet.x1.xyz",
  tokenDecimals: 9,
  // Token mint addresses
  xnmTokenMint:
    import.meta.env.VITE_XNM_TOKEN_MINT || "XNMbEwZFFBKQhqyW3taa8cAUp1xBUHfyzRFJQvZET4m",
  xblkTokenMint:
    import.meta.env.VITE_XBLK_TOKEN_MINT || "XBLKLmxhADMVX3DsdwymvHyYbBYfKa5eKhtpiQ2kj7T",
  xuniTokenMint:
    import.meta.env.VITE_XUNI_TOKEN_MINT || "XUNigZPoe8f657NkRf7KF8tqj9ekouT4SoECsD6G2Bm",
};
