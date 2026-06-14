import { shortener } from "../utils/shortener";

interface HeliusDasItem {
    id: string;
    interface: string;
    token_info?: {
        balance?: string | number;
        decimals?: number;
        symbol?: string;
    };
    content?: {
        metadata?: { name?: string };
        files?: Array<{ uri?: string }>;
    };
}

const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY as string;

const HELIUS_RPC_URL = `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;


export interface TokenAsset {
    id: string;
    symbol: string;
    name: string;
    icon: string | null;
    balance: number;
    rawBalance: bigint;
    decimals: number;

}

export async function getTokensByOwner(address: string): Promise<TokenAsset[]> {
    const response = await fetch(HELIUS_RPC_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": "get-assets",
            "method": "getAssetsByOwner",
            "params": {
                "ownerAddress": address,
                "page": 1,
                "limit": 100,
                "displayOptions": {
                    "showFungible": true,
                    "showNativeBalance": false,
                }
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Helius API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { result?: { items?: HeliusDasItem[] } };
    const items: HeliusDasItem[] = data.result?.items ?? [];
    return items
        .filter((item) => item.interface === "FungibleToken")
        .map((item) => {
            const rawBalance = BigInt(item.token_info?.balance ?? "0");
            const decimals = item.token_info?.decimals ?? 0;
            return {
                id: item.id,
                symbol: item.token_info?.symbol ?? "???",
                name: item.content?.metadata?.name ?? shortener(item.id),
                icon: item.content?.files?.[0]?.uri ?? null,
                balance: Number(rawBalance) / Math.pow(10, decimals),
                rawBalance,
                decimals,
            };
        });
}