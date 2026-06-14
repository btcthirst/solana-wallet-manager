import { createWalletTransactionSigner, LAMPORTS_PER_SOL } from "@solana/client";
import { useBalance, useWalletConnection } from "@solana/react-hooks";
import { useEffect, useState } from "react";
import { getTokensByOwner, TokenAsset } from "../lib/helius";
import { transferSol } from "../lib/transfer";

export function Dashboard() {
    const { wallet } = useWalletConnection();
    const { lamports } = useBalance(wallet?.account.address);
    const sol = lamports != null ? Number(lamports) / Number(LAMPORTS_PER_SOL) : null;

    const [tokens, setTokens] = useState<TokenAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [tokenError, setTokenError] = useState<string | null>(null);

    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [sending, setSending] = useState(false);
    const [txSignature, setTxSignature] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleTransfer() {
        if (!wallet) return;
        setError(null);

        if (!recipient.trim()) {
            setError("Recipient address is required");
            return;
        }
        const parsedAmount = Number(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            setError("Amount must be greater than 0");
            return;
        }

        setSending(true);
        setTxSignature(null);

        try {
            const { signer } = await createWalletTransactionSigner(wallet);
            const sig = await transferSol(signer, recipient.trim(), parsedAmount);
            setTxSignature(sig);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setSending(false);
        }
    }

    useEffect(() => {
        if (!wallet?.account.address) return;
        setLoading(true);
        setTokenError(null);
        getTokensByOwner(wallet.account.address)
            .then(setTokens)
            .catch(() => setTokenError("Failed to load tokens"))
            .finally(() => setLoading(false));
    }, [wallet?.account.address]);

    return (
        <div>
            <p>Balance: {sol !== null ? `${sol} SOL` : wallet ? "Loading..." : "—"}</p>

            <h2>Tokens</h2>
            {loading && <p>Loading tokens...</p>}
            {tokenError && <p>❌ {tokenError}</p>}
            {!loading && !tokenError && wallet && tokens.length === 0 && <p>No tokens found</p>}
            {tokens.map((token) => (
                <div key={token.id}>
                    {token.icon && <img src={token.icon} alt={token.symbol} width={24} />}
                    <span>{token.name}: {token.balance.toFixed(token.decimals > 2 ? 2 : token.decimals)}</span>
                </div>
            ))}
            <div>
                <h2>Send SOL</h2>
                <input
                    type="text"
                    placeholder="Recipient address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount SOL"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button onClick={handleTransfer} disabled={sending || !wallet}>
                    {sending ? "Sending..." : "Send"}
                </button>

                {txSignature && (
                    <p>
                        ✅ Success!{" "}
                        <a
                            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View on Explorer
                        </a>
                    </p>
                )}
                {error && <p>❌ {error}</p>}
            </div>
        </div>
    );
}
