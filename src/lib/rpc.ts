import { createSolanaRpc } from "@solana/kit";

const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';

export const rpc = createSolanaRpc(rpcUrl);
