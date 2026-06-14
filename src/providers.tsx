import { SolanaProvider } from "@solana/react-hooks";
import { PropsWithChildren } from "react";
import { solanaClient } from "./lib/solana";


export function Providers({ children }: PropsWithChildren) {
  return <SolanaProvider client={solanaClient}>{children}</SolanaProvider>;
}
